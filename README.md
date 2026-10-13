# Scribe

Scribe is a Markdown editor and previewer available as a native Tauri desktop application and a browser-based editor.

## Features

- CodeMirror 6 Markdown editing, formatting toolbar, syntax highlighting, and GitHub-flavored Markdown preview
- Editor, split, and preview layouts; tabs; search and replace; command palette
- Light, dark, and system themes; editor typography and wrapping options
- HTML export with sanitized Markdown output
- Native desktop: multiple-file open, direct disk saves, recent files, optional autosave, and file associations
- Browser: local Markdown import (file picker or drag and drop) and Markdown/HTML downloads

## Using Scribe

Create a document or open a `.md`, `.markdown`, `.mdown`, or `.mkd` file. Edit the text and switch between source and preview modes. Use **Ctrl/Cmd+S** to save, **Ctrl/Cmd+Shift+S** for Save As, and **Ctrl/Cmd+Shift+P** for the command palette.

**Browser limitation:** saving downloads a new copy; it does not overwrite the original local file. The browser editor does not offer background disk autosave, recent-file reopening, or native filesystem access. Save before leaving the page. Native desktop builds can write directly to approved local file paths.

## Privacy and security

Document editing and Markdown rendering run locally; this project does not implement accounts, cloud sync, or upload endpoints. Preferences are kept in browser/webview local storage. Remote images and links embedded in Markdown may contact external servers when displayed or opened. Untrusted Markdown is sanitized before preview and HTML export. The native application uses Tauri file plugins and OS dialogs.

## Development

Prerequisites: Node.js 20+ and npm. To build the desktop application, also install Rust and the platform-specific Tauri 2 prerequisites.

```bash
npm ci
npm run dev
npm test
npm run build
```

To start or bundle the native desktop application:

```bash
npm run tauri dev
npm run tauri build
```

To build for project-hosted GitHub Pages, set `GITHUB_PAGES=true` before `npm run build`. The deployment workflow publishes `dist/` to GitHub Pages once the GitHub Pages service is enabled and deployment succeeds.

## Technology and compatibility

React 19, TypeScript, Vite 7, Tailwind CSS 4, CodeMirror 6, Zustand 5, React Markdown, and Tauri 2 (Rust). The browser version targets current Chromium, Firefox, and Safari browsers; native desktop packaging targets Windows, macOS, and Linux. Desktop functionality depends on each platform's Tauri/WebView runtime.

## License

MIT. See [LICENSE](LICENSE).
