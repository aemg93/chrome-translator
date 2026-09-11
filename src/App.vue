<script setup lang="ts">
import { onMounted, ref } from 'vue'

type Language = {
  code: string
  label: string
  flag: string
}

type TranslationSettings = {
  incomingTarget: string
  outgoingTarget: string
  writingLanguage: string
}

const languages: Language[] = [
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
]

// Modelos para los tres selects
const writingLanguage = ref('es')
const outgoingTarget = ref('en')
const incomingTarget = ref('es')
const enabled = ref(true)
const saving = ref(false)

onMounted(async () => {
  const result =
    await chrome.storage.local.get(
      'translationSettings',
    )

  const raw =
    result.translationSettings

  if (
    typeof raw === 'object' &&
    raw !== null &&
    'incomingTarget' in raw &&
    'outgoingTarget' in raw &&
    'writingLanguage' in raw &&
    typeof raw.incomingTarget === 'string' &&
    typeof raw.outgoingTarget === 'string' &&
    typeof raw.writingLanguage === 'string'
  ) {
    const settings =
      raw as TranslationSettings

    writingLanguage.value =
      settings.writingLanguage

    outgoingTarget.value =
      settings.outgoingTarget

    incomingTarget.value =
      settings.incomingTarget
  }
})

async function saveSettings(): Promise<void> {
  saving.value = true

  await chrome.storage.local.set({
    translationSettings: {
      writingLanguage: writingLanguage.value,
      outgoingTarget: outgoingTarget.value,
      incomingTarget: incomingTarget.value,
    },
    extensionEnabled: enabled.value
  })

  saving.value = false

  // Mostrar feedback visual
  const saveButton = document.querySelector('.save-button') as HTMLButtonElement
  const originalText = saveButton.textContent
  saveButton.textContent = '✓ Guardado'

  setTimeout(() => {
    saveButton.textContent = originalText
  }, 1500)
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

function isEqual(a: string, b: string): boolean {
  return a === b
}
</script>

<template>
  <main class="popup">
    <header>
      <div class="brand-icon">🌐</div>

      <div>
        <h1>Chrome Translator</h1>
        <p>Traducción universal inteligente</p>
      </div>
    </header>

    <section class="card">
      <!-- Grupo 1: Mi idioma de escritura -->
      <div class="settings-group">
        <label class="settings-label">Escribo en:</label>
        <select v-model="writingLanguage">
          <option
            v-for="item in languages"
            :key="item.code"
            :value="item.code"
          >
            {{ item.flag }} {{ item.label }}
          </option>
        </select>
      </div>

      <!-- Grupo 2: A dónde va MI texto -->
      <div class="settings-group">
        <label class="settings-label">Cuando selecciono MI texto, traducir a:</label>
        <select v-model="outgoingTarget">
          <option
            v-for="item in languages"
            :key="item.code"
            :value="item.code"
          >
            {{ item.flag }} {{ item.label }}
          </option>
        </select>
      </div>

      <!-- Grupo 3: A dónde va el texto EXTRANJERO -->
      <div class="settings-group">
        <label class="settings-label">Cuando selecciono texto EXTRANJERO, traducir a:</label>
        <select v-model="incomingTarget">
          <option
            v-for="item in languages"
            :key="item.code"
            :value="item.code"
          >
            {{ item.flag }} {{ item.label }}
          </option>
        </select>
      </div>

      <!-- Separador -->
      <div class="divider"></div>

      <!-- Switch de activación -->
      <div class="toggle-group">
        <label class="toggle-label">
          <input type="checkbox" v-model="enabled" />
          Extensión activada
        </label>
      </div>

      <!-- Botón de guardar -->
      <button
        class="save-button"
        :disabled="isEqual(writingLanguage, outgoingTarget)"
        @click="saveSettings"
      >
        {{ saving ? 'Guardando...' : 'Guardar configuración' }}
      </button>
    </section>

    <footer>
      <div class="preview">
        <div class="preview-item">
          <span class="preview-label">Mi texto →</span>
          <span class="preview-flag">{{ language(writingLanguage).flag }}</span>
          <span class="preview-arrow">→</span>
          <span class="preview-flag">{{ language(outgoingTarget).flag }}</span>
        </div>
        <div class="preview-item">
          <span class="preview-label">Texto extranjero →</span>
          <span class="preview-flag">{{ language(incomingTarget).flag }}</span>
        </div>
      </div>
    </footer>
  </main>
</template>

<style scoped>
.popup {
  width: 320px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

header {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
}

.brand-icon {
  font-size: 28px;
  margin-right: 12px;
}

header h1 {
  margin: 0 0 4px 0;
  font-size: 18px;
  font-weight: 600;
}

header p {
  margin: 0;
  color: #666;
  font-size: 13px;
}

.card {
  padding: 20px 24px;
}

.settings-group {
  margin-bottom: 16px;
}

.settings-label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #333;
}

.settings-group select {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
  cursor: pointer;
}

.settings-group select:focus {
  outline: none;
  border-color: #4285f4;
  box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
}

.divider {
  height: 1px;
  background-color: #f0f0f0;
  margin: 20px 0;
}

.toggle-group {
  margin-bottom: 16px;
}

.toggle-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  color: #333;
}

.toggle-label input {
  margin-right: 8px;
  width: 16px;
  height: 16px;
}

.save-button {
  width: 100%;
  padding: 10px 16px;
  background-color: #4285f4;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.save-button:not(:disabled):hover {
  background-color: #3367d6;
}

.save-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.footer {
  padding: 16px 24px 20px;
  border-top: 1px solid #eee;
  font-size: 13px;
  color: #666;
}

.preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.preview-label {
  font-weight: 500;
}

.preview-flag {
  font-size: 16px;
}

.preview-arrow {
  margin: 0 4px;
  color: #999;
  font-weight: bold;
}
</style>