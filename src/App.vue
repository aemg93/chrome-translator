<script setup lang="ts">
import { onMounted, ref } from 'vue'

type Language = {
  code: string
  label: string
  flag: string
}

type StoredLanguagePair = {
  source: string
  target: string
}

const languages: Language[] = [
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
]

const sourceLanguage = ref('es')
const targetLanguage = ref('en')
const saved = ref(false)

onMounted(async () => {
  const result =
    await chrome.storage.local.get(
      'translationLanguagePair',
    )

  const raw =
    result.translationLanguagePair

  if (
    typeof raw === 'object' &&
    raw !== null &&
    'source' in raw &&
    'target' in raw &&
    typeof raw.source === 'string' &&
    typeof raw.target === 'string'
  ) {
    const pair =
      raw as StoredLanguagePair

    sourceLanguage.value =
      pair.source

    targetLanguage.value =
      pair.target
  }
})

async function save(): Promise<void> {
  await chrome.storage.local.set({
    translationLanguagePair: {
      source: sourceLanguage.value,
      target: targetLanguage.value,
    },
  })

  saved.value = true

  window.setTimeout(() => {
    saved.value = false
  }, 1500)
}

function swap(): void {
  const current =
    sourceLanguage.value

  sourceLanguage.value =
    targetLanguage.value

  targetLanguage.value =
    current
}

function language(
  code: string,
): Language {
  return (
    languages.find(
      item => item.code === code,
    ) ?? languages[0]
  )
}
</script>

<template>
  <main class="popup">
    <header>
      <div class="brand-icon">🌐</div>

      <div>
        <h1>Chrome Translator</h1>
        <p>Traducción universal</p>
      </div>
    </header>

    <section class="card">
      <label>Idioma de origen</label>

      <select v-model="sourceLanguage">
        <option
          v-for="item in languages"
          :key="item.code"
          :value="item.code"
        >
          {{ item.flag }} {{ item.label }}
        </option>
      </select>

      <button
        type="button"
        class="swap"
        title="Invertir idiomas"
        @click="swap"
      >
        ⇄
      </button>

      <label>Traducir a</label>

      <select v-model="targetLanguage">
        <option
          v-for="item in languages"
          :key="item.code"
          :value="item.code"
        >
          {{ item.flag }} {{ item.label }}
        </option>
      </select>

      <button
        type="button"
        class="save"
        :disabled="
          sourceLanguage === targetLanguage
        "
        @click="save"
      >
        {{ saved ? '✓ Guardado' : 'Guardar configuración' }}
      </button>
    </section>

    <footer>
      {{ language(sourceLanguage).flag }}
      {{ language(sourceLanguage).label }}
      →
      {{ language(targetLanguage).flag }}
      {{ language(targetLanguage).label }}
    </footer>
  </main>
</template>
