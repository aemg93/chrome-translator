console.log(
  '[Chrome Translator] Background iniciado',
)

async function reinjectIntoOpenTabs(): Promise<void> {
  const manifest =
    chrome.runtime.getManifest()

  const contentScript =
    manifest.content_scripts
      ?.flatMap(
        script => script.js ?? [],
      )
      .find(
        file =>
          file.startsWith(
            'assets/content',
          ) &&
          file.endsWith('.js'),
      )

  if (!contentScript) {
    console.error(
      '[Chrome Translator] No se encontró el content script generado en el manifest.',
    )

    return
  }

  console.log(
    '[Chrome Translator] Content script encontrado:',
    contentScript,
  )

  const tabs =
    await chrome.tabs.query({})

  for (const tab of tabs) {
    if (
      typeof tab.id !== 'number' ||
      !tab.url ||
      !/^https?:\/\//i.test(tab.url)
    ) {
      continue
    }

    try {
      await chrome.scripting.executeScript({
        target: {
          tabId: tab.id,
          allFrames: true,
        },
        files: [
          contentScript,
        ],
      })

      console.log(
        '[Chrome Translator] Content script reinyectado:',
        {
          tabId: tab.id,
          url: tab.url,
        },
      )
    } catch (error: unknown) {
      console.debug(
        '[Chrome Translator] No se pudo reinyectar:',
        {
          tabId: tab.id,
          url: tab.url,
          error,
        },
      )
    }
  }
}

chrome.runtime.onInstalled.addListener(() => {
  console.log(
    '[Chrome Translator] Extensión instalada/actualizada',
  )

  void reinjectIntoOpenTabs()
})

chrome.runtime.onStartup.addListener(() => {
  console.log(
    '[Chrome Translator] Chrome iniciado',
  )

  void reinjectIntoOpenTabs()
})

/*
 * Importante:
 * cuando recargamos la extensión desde
 * chrome://extensions, el service worker
 * vuelve a inicializarse. Ejecutamos aquí
 * la reinyección para las pestañas que ya
 * estaban abiertas.
 */
void reinjectIntoOpenTabs()
