import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { crx } from '@crxjs/vite-plugin'

const manifest = {
  manifest_version: 3,

  name: 'Chrome Translator',

  version: '0.1.0',

  description:
    'Traducción bidireccional de mensajes y campos de texto.',

  action: {
    default_title: 'Chrome Translator',
    default_popup: 'index.html',
  },

  background: {
    service_worker: 'src/background/worker.ts',
    type: 'module',
  },

  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/content/content.ts'],
      run_at: 'document_idle',
      all_frames: true,
    },
  ],

  permissions: ['storage', 'scripting'],

  host_permissions: ['<all_urls>'],
}

export default defineConfig({
  plugins: [
    vue(),
    crx({
      manifest,
    }),
  ],

  build: {
    rollupOptions: {
      preserveEntrySignatures: 'exports-only',
    },
  },
})
