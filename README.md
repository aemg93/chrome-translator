# Chrome Translator

![GitHub release (latest by date)](https://img.shields.io/github/v/release/aemg93/chrome-translator?display_name=tag)
![GitHub Downloads (all assets, all releases)](https://img.shields.io/github/downloads/aemg93/chrome-translator/total)
![GitHub issues](https://img.shields.io/github/issues/aemg93/chrome-translator)
![GitHub pull requests](https://img.shields.io/github/issues-pr/aemg93/chrome-translator)
![GitHub License](https://img.shields.io/github/license/aemg93/chrome-translator)

## 📥 Download

[![Download Chrome Translator](https://img.shields.io/badge/⬇️%20Download-Chrome%20Translator-success?style=for-the-badge&logo=googlechrome&logoColor=white)](https://github.com/aemg93/chrome-translator/releases/latest/download/chrome-translator.zip)

Download the latest ready-to-install version of Chrome Translator.

A powerful Chrome extension for intelligent bidirectional translation. Translate your text to a target language and automatically translate foreign page text to your native language.

## ✨ Features

- **Smart Detection**: Automatically distinguishes between your typed text and webpage content
- **Bidirectional Translation**: 
  - Your text → Target language (e.g., Spanish → English)
  - Foreign text → Your native language (e.g., English/Spanish/etc. → Spanish)
- **Chrome's Built-in AI**: Uses Chrome's integrated Language Detector and Translator APIs for high-quality translations
- **Non-intrusive UI**: Clean popup with real-time translation display
- **Persistent Settings**: Remembers your language preferences between sessions
- **Lightweight**: Optimized for performance with minimal resource usage

## 📥 Installation

### From GitHub Release (Recommended)

1. Go to the [Releases page](https://github.com/aemg93/chrome-translator/releases)
2. Download the latest `chrome-translator.zip` asset
3. Extract the ZIP file to a folder on your computer
4. Open Chrome and navigate to `chrome://extensions`
5. Enable **Developer mode** (toggle in top-right corner)
6. Click **Load unpacked** and select the extracted folder
7. The extension icon will appear in your Chrome toolbar

### Manual Build (For Developers)

1. Clone the repository:
   ```bash
   git clone https://github.com/aemg93/chrome-translator.git
   cd chrome-translator
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the extension:
   ```bash
   npm run build
   ```
4. Load the `dist/` folder as an unpacked extension in `chrome://extensions`

## 🚀 Usage

### Initial Setup

1. Click the extension icon in your Chrome toolbar to open the popup
2. Configure your language preferences:
   - **Escribo en:** Your native language (e.g., Español)
   - **Cuando selecciono MI texto, traducir a:** Target language for your text (e.g., English)
   - **Cuando selecciono texto EXTRANJERO, traducir a:** Target language for foreign text (e.g., Español)
   - Toggle **Extensión activada** to enable/disable
3. Click **Guardar configuración** to save your settings

### Translation Examples

#### Your Text → Target Language
1. Type in any web field: `Hola, ¿cómo estás?` (Spanish)
2. Select the text with your mouse
3. See the translation appear: `Hello, how are you?` (English)

#### Foreign Text → Your Native Language
1. Visit any foreign-language webpage (e.g., English news article)
2. Select text like: `The weather is beautiful today`
3. See the translation appear: `El clima está hermoso hoy` (Spanish)

## ⚙️ Configuration

The extension stores your settings in Chrome's local storage:
- `writingLanguage`: Your native language (e.g., `es`)
- `outgoingTarget`: Target language for your text (e.g., `en`)
- `incomingTarget`: Target language for foreign text (e.g., `es`)
- `extensionEnabled`: Boolean toggle for enabling/disabling

## 🛠️ Development

### Project Structure
```
chrome-translator/
├─ src/
│  ├─ content/          # Content scripts (runs in web pages)
│  ├─ background/       # Service worker (background logic)
│  ├─ services/         # Translation service wrappers
│  └─ App.vue           # Popup UI (Vue 3)
├─ public/              # Static assets
├─ dist/                # Built extension (generated)
├─ vite.config.ts       # Vite + @crxjs/vite-plugin configuration
├─ package.json         # Dependencies and scripts
└─ manifest.json        # Extension manifest
```

### Available Scripts
- `npm run dev`: Start Vite development server (for popup only)
- `npm run build`: Build production extension to `dist/`
- `npm run preview`: Preview built extension locally

### Translation API
The extension uses Chrome's built-in AI features:
- [`LanguageDetector`](https://developer.chrome.com/docs/extensions/reference/languageDetector/) for language detection
- [`Translator`](https://developer.chrome.com/docs/extensions/reference/translator/) for translation

These APIs require Chrome version 109+ and may show download progress bars the first time they're used.

## 📱 Compatibility

- ✅ Google Chrome (v109+)
- ✅ Microsoft Edge (v109+)
- ✅ Other Chromium-based browsers (Brave, Opera, etc.)
- ❌ Firefox (different WebExtensions API)
- ❌ Safari

## 🐛 Known Limitations

- Language pairs depend on Chrome's built-in model availability
- Some less-common language combinations may show "unavailable" errors
- Translation quality varies by language pair and context
- Content script may not work on Chrome Web Store pages (security restriction)

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

Please ensure your code follows the existing style and includes appropriate tests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to the Chrome team for the [Built-in AI APIs](https://developer.chrome.com/docs/extensions/mv3/builtin_ai/)
- Inspired by the need for seamless bilingual browsing experiences
- Built with [Vue 3](https://vuejs.org/) and [Vite](https://vitejs.dev/)

---

**Made with ❤️ for multilingual web users**

<div align="center">
  <sub>Built with • <a href="https://vuejs.org/">Vue 3</a> • <a href="https://vitejs.dev/">Vite</a> • <a href="https://developer.chrome.com/docs/extensions/mv3/getstarted/">Chrome Extensions MV3</a></sub>
</div>