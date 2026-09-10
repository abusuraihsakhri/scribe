# Scribe — Native Windows 11 Markdown Editor & Viewer

<p align="center">
  <img src="src-tauri/icons/128x128@2x.png" alt="Scribe Logo" width="96" height="96" />
</p>

<p align="center">
  <strong>A lightning-fast, secure, native Markdown editor and viewer crafted for Windows 11.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Tauri-v2.0-blue?logo=tauri&logoColor=white" alt="Tauri 2" />
  <img src="https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript&logoColor=white" alt="TypeScript 5.8" />
  <img src="https://img.shields.io/badge/CodeMirror-v6-black?logo=codemirror&logoColor=white" alt="CodeMirror 6" />
  <img src="https://img.shields.io/badge/Tailwind-CSS_v4-38bdf8?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/Security-OWASP_Audited-green" alt="Security Audited" />
  <img src="https://img.shields.io/badge/Platform-Windows_11-0078d4?logo=windows&logoColor=white" alt="Windows 11" />
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License MIT" />
</p>

---

## 📖 Overview

**Scribe** is a high-performance desktop Markdown editor designed to feel like an authentic, first-class Windows 11 application rather than a sluggish browser wrapper. Engineered with **Tauri 2** (Rust) on the native backend and **React 19** with **CodeMirror 6** on the frontend, Scribe delivers sub-millisecond keystroke latency, instantaneous preview synchronization, and rigorous security boundaries.

Whether drafting technical documentation, taking notes, or reviewing Markdown files, Scribe provides an uninterrupted, distraction-free environment that respects your privacy and system resources.

---

## ✨ Key Features

### ⚡ Next-Generation Editor (CodeMirror 6)
- **Fluid Typing & Syntax Highlighting** — Full Markdown syntax highlighting with specialized token styling for headings, blockquotes, inline code, links, and lists.
- **Smart Editing & Auto-Continuation** — Automatically continues unordered lists (`-`, `*`, `+`), numbered lists (`1.`), and checklists (`- [ ]`) when pressing <kbd>Enter</kbd>. Terminating empty items removes the prefix cleanly.
- **Auto-Closing & Bracket Matching** — Intelligent pairing for parentheses, square brackets, curly braces, markdown formatting marks (`**`, `*`, `~~`, `` ` ``).
- **Custom Typography & Formatting** — Configurable font family (*Cascadia Code*, *Consolas*, *JetBrains Mono*, system monospaced), font size, line height, tab spacing (2, 4, 8 spaces), word wrapping, line numbers, and active line gutters.

### 🌓 Live Dual-Engine Preview & View Modes
- **GFM Compliant** — Complete GitHub Flavored Markdown support including tables, strikethrough, autolinks, and task checklists.
- **Syntax-Highlighted Code Blocks** — Automatic language detection and syntax highlighting powered by `rehype-highlight` and `highlight.js`, with an integrated language pill and one-click clipboard copy button.
- **Three View Layouts**:
  - **Editor Mode** (<kbd>Ctrl</kbd>+<kbd>1</kbd>): Pure, distraction-free writing surface.
  - **Split Mode** (<kbd>Ctrl</kbd>+<kbd>2</kbd>): Side-by-side editing with a draggable, responsive split divider.
  - **Preview Mode** (<kbd>Ctrl</kbd>+<kbd>3</kbd>): Clean reading view formatted with GitHub-inspired typography.

### 🛡️ Audited Security & Local-First Sandbox
- **Zero Telemetry & Offline-First** — Never sends document contents to external servers or cloud services. All computation is performed locally on your machine.
- **Rehype AST HTML Sanitization** — All Markdown rendering passes through a strict HTML sanitization boundary (`rehype-sanitize`) configured to whitelist only benign formatting tags and syntax-highlight classes, blocking malicious scripts, data exfiltration, and event-handler injections.
- **Hardened Tauri IPC Capabilities** — Scoped filesystem permissions with explicit deny-lists protecting sensitive directories (including `$HOME/.ssh`, `$HOME/.aws`, `$HOME/.gnupg`).
- **UNC & Path Traversal Guards** — Image and asset resolution blocks Windows UNC paths (preventing NetNTLMv2 hash leak attacks) and sanitizes directory traversal sequences (`..`).
- **Hardened Content Security Policy (CSP)** — WebView2 environment enforces strict CSP forbidding unauthorized frame embedding and remote script execution.

### 📑 Document Lifecycle & Data Safety
- **Multi-Tab Workspace** — Work across multiple files simultaneously with tab indicators, close buttons, and tab context menus (*Close*, *Close Others*, *Close All*).
- **Unsaved Changes Guard** — Clean Windows 11 dialog prompts users before discarding unsaved edits when closing tabs or quitting the application.
- **Configurable Autosave** — Automatically writes document changes to disk at customizable intervals (5s to 120s).
- **External Change Detection** — Automatically syncs when a file is modified externally.
- **Recent Files Quick Access** — Pinned sidebar list of recently opened files for instant access.
- **Standalone HTML Export** — Export rendered, styled, and sanitized standalone HTML files independently of DOM layout or view mode.

### 🎯 Windows 11 Native Integration
- **Mica & Acrylic Theming** — Seamless switching between Light, Dark, and System theme (automatically tracking Windows 11 accent colors and dark mode).
- **Native File Dialogs & Associations** — Integrated with Windows shell for opening `.md`, `.markdown`, `.mdown`, and `.mkd` files.
- **Drag-and-Drop Ingestion** — Drag markdown files directly from Windows File Explorer into Scribe to open them instantly.
- **Command Palette** (<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd>) — Quick-launcher with fuzzy search across all application actions and shortcuts.
- **Search & Replace** (<kbd>Ctrl</kbd>+<kbd>F</kbd> / <kbd>Ctrl</kbd>+<kbd>H</kbd>) — Fast search with match counting, navigation, case-sensitivity, whole-word matching, and ReDoS-safe regular expressions.

---

## ⌨️ Keyboard Shortcuts

| Category | Shortcut | Action |
|:---|:---|:---|
| **File** | <kbd>Ctrl</kbd> + <kbd>N</kbd> | New Document |
| | <kbd>Ctrl</kbd> + <kbd>O</kbd> | Open File(s) |
| | <kbd>Ctrl</kbd> + <kbd>S</kbd> | Save Document |
| | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd> | Save As... |
| | <kbd>Ctrl</kbd> + <kbd>W</kbd> | Close Active Document |
| **Editing** | <kbd>Ctrl</kbd> + <kbd>Z</kbd> | Undo |
| | <kbd>Ctrl</kbd> + <kbd>Y</kbd> | Redo |
| | <kbd>Ctrl</kbd> + <kbd>B</kbd> | Bold (`**text**`) |
| | <kbd>Ctrl</kbd> + <kbd>I</kbd> | Italic (`*text*`) |
| | <kbd>Ctrl</kbd> + <kbd>K</kbd> | Insert Link (`[text](url)`) |
| **Search** | <kbd>Ctrl</kbd> + <kbd>F</kbd> | Find in Document |
| | <kbd>Ctrl</kbd> + <kbd>H</kbd> | Find & Replace |
| | <kbd>Enter</kbd> / <kbd>Shift</kbd>+<kbd>Enter</kbd> | Next / Previous Match |
| | <kbd>Esc</kbd> | Close Find / Replace Panel |
| **View** | <kbd>Ctrl</kbd> + <kbd>1</kbd> | Editor Only View |
| | <kbd>Ctrl</kbd> + <kbd>2</kbd> | Split Editor & Preview |
| | <kbd>Ctrl</kbd> + <kbd>3</kbd> | Preview Only View |
| | <kbd>Ctrl</kbd> + <kbd>\</kbd> | Toggle Sidebar |
| | <kbd>F11</kbd> | Toggle Fullscreen |
| | <kbd>Ctrl</kbd> + <kbd>=</kbd> | Zoom In |
| | <kbd>Ctrl</kbd> + <kbd>-</kbd> | Zoom Out |
| | <kbd>Ctrl</kbd> + <kbd>0</kbd> | Reset Zoom |
| **Launcher** | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd> | Command Palette |

---

## 🏗️ Architecture & Technology Stack

```
┌─────────────────────────────────────────────────────────┐
│                      Scribe Desktop                     │
├────────────────────────────┬────────────────────────────┤
│         Presentation       │     Native Backend (Rust)  │
│   React 19 + TypeScript    │           Tauri 2          │
│   Tailwind CSS v4          │  ───────────────────────── │
│   Lucide Icons             │   OS Windowing & Dialogs   │
├────────────────────────────┤   Scoped Filesystem IPC    │
│       CodeMirror 6 Core    │   Default URL Opener       │
│   Markdown Language Parser │   Persistent App Store     │
│   Smart Editing Keymaps    │                            │
├────────────────────────────┼────────────────────────────┤
│     State Management       │    Markdown & Sanitization │
│   Zustand 5 (Docs, UI)     │   ReactMarkdown + GFM      │
│   Local Storage Settings   │   Rehype-Highlight         │
│                            │   Rehype-Sanitize Schema   │
└────────────────────────────┴────────────────────────────┘
```

| Component | Technology | Version | Purpose |
|:---|:---|:---|:---|
| **Runtime** | [Tauri](https://v2.tauri.app/) | `2.x` | Native Windows desktop shell & secure Rust backend |
| **Frontend Framework** | [React](https://react.dev/) | `19.1` | Reactive UI layout and state rendering |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | `5.8` | Strict static type checking across all frontend modules |
| **Build Tool** | [Vite](https://vite.dev/) | `7.x` | High-speed frontend development server and bundler |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | `4.3` | Fluid, utility-first design tokens and theming |
| **Code Editor** | [CodeMirror](https://codemirror.net/) | `6.x` | Extensible text editor, bracket matching, history, syntax tree |
| **Markdown Pipeline** | `react-markdown` | `10.1` | AST-based markdown parsing and virtual DOM rendering |
| **Syntax Highlighting** | `rehype-highlight` | `7.0` | Code block highlighting across 100+ programming languages |
| **Sanitization** | `rehype-sanitize` | `6.0` | Strict HTML AST filter guarding against XSS & script injection |
| **State Container** | [Zustand](https://github.com/pmndrs/zustand) | `5.0` | Lightweight, decoupled document & UI store |
| **Iconography** | [Lucide React](https://lucide.dev/) | `1.39` | Consistent, accessible UI icon set |

---

## 📁 Project Structure

```
scribe/
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── FormattingToolbar.tsx  # Markdown formatting action buttons
│   │   ├── Sidebar.tsx            # Document list and recent files
│   │   ├── StatusBar.tsx          # Word/char counters, Ln/Col, encoding
│   │   ├── Toolbar.tsx            # Header actions and view switchers
│   │   ├── UnsavedChangesDialog.tsx # Guard modal for dirty documents
│   │   ├── WelcomeScreen.tsx      # Landing screen for new sessions
│   │   └── Workspace.tsx          # Resizable split workspace container
│   ├── editor/                # CodeMirror 6 engine setup
│   │   ├── CodeEditor.tsx         # Editor instance with compartment configs
│   │   ├── codeEditorTheme.ts     # Dark/light editor token styles
│   │   ├── formatting.ts          # Text selection wrapping & block insertion
│   │   └── smartEditing.ts        # Enter/Tab continuation keymaps
│   ├── preview/               # Markdown rendering
│   │   ├── CodeBlock.tsx          # Code block container with copy button
│   │   └── Preview.tsx            # Sanitized react-markdown preview component
│   ├── markdown/              # AST & sanitization schemas
│   │   └── sanitizeSchema.ts      # Rehype whitelist for safe HTML elements
│   ├── filesystem/            # Native I/O
│   │   └── fs.ts                  # Tauri plugin dialog & filesystem wrappers
│   ├── search/                # Find & Replace
│   │   └── SearchPanel.tsx        # Search UI with safe regex and match navigation
│   ├── commands/              # Command launcher
│   │   ├── CommandPalette.tsx     # Fuzzy search modal
│   │   └── commands.ts            # Command definitions and fuzzy matching algorithm
│   ├── settings/              # User preferences
│   │   ├── SettingsDialog.tsx     # Configuration modal
│   │   └── settingsStore.ts       # Persistent settings state
│   ├── state/                 # Application state
│   │   ├── documentsStore.ts      # Active documents, dirty flags, save/saveAs
│   │   ├── recentFilesStore.ts    # Recent files MRU list
│   │   ├── uiStore.ts             # Active view mode, sidebar visibility, theme
│   │   └── types.ts               # Core domain interfaces
│   ├── styles/                # CSS styling
│   │   ├── theme.css              # CSS custom properties for dark/light themes
│   │   └── preview.css            # Markdown typography and code highlight styles
│   ├── utils/                 # Helpers & hooks
│   │   ├── textStats.ts           # Word, character, and line count calculators
│   │   └── useDebouncedValue.ts   # Debounce hook for smooth preview updates
│   ├── App.tsx                # Main application orchestrator
│   └── main.tsx               # DOM entry point
├── src-tauri/                 # Tauri 2 Native Backend
│   ├── capabilities/          # Capability definitions & fine-grained permissions
│   │   └── default.json       # Scoped filesystem access & deny-lists
│   ├── icons/                 # Multi-resolution application icons
│   ├── src/                   # Rust entry points
│   │   ├── lib.rs             # Plugin registration & window initialization
│   │   └── main.rs            # Application entry
│   ├── Cargo.toml             # Rust dependencies and metadata
│   └── tauri.conf.json        # Tauri configuration (window, CSP, file associations)
├── package.json               # Node.js dependencies and build scripts
├── tsconfig.json              # TypeScript compiler configuration
└── vite.config.ts             # Vite build & Tauri development server settings
```

---

## 🚀 Getting Started

### Prerequisites

To run and build Scribe locally, ensure you have the following installed on Windows 11:

1. **[Node.js](https://nodejs.org/)** (v18.0.0 or higher)
2. **[Rust](https://www.rust-lang.org/tools/install)** (stable toolchain)
3. **[Microsoft Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)** (required by Rust / Tauri)
4. **WebView2** (included by default on Windows 11)

### Installation

Clone the repository and install frontend dependencies:

```bash
git clone https://github.com/abusuraihsakhri/scribe.git
cd scribe
npm install
```

### Running in Development Mode

Run the web frontend standalone in Vite:
```bash
npm run dev
```

Run the full native desktop application with live reload:
```bash
npm run tauri dev
```

### Running Tests

Execute the unit test suite with Vitest:
```bash
npm test
```

### Building for Production

Compile the optimized frontend and produce the native Windows installer:

```bash
# 1. Build frontend distribution bundle
npm run build

# 2. Build the Tauri native desktop installer (NSIS)
npm run tauri build
```

The production installer (`.exe`) and standalone executable will be generated at:
```
src-tauri/target/release/bundle/nsis/Scribe_<version>_x64-setup.exe
```

---

## 🔒 Security Architecture

Scribe adopts a defense-in-depth model aligned with the **OWASP Desktop Application Top 10 (2025)**:

1. **Input Sanitization & AST Filtering**: All Markdown rendering is processed through `rehype-sanitize` with a strict attribute whitelist. Raw HTML script tags, event handlers (`onload`, `onerror`), and untrusted iframe tags are stripped prior to rendering.
2. **Path Traversal & UNC Guard**: Resolving relative image paths rejects directory traversal sequences (`..`), URL-encoded traversals (`%2e%2e`), and Windows UNC shares (`\\host\share`), mitigating remote NTLM credential coercion.
3. **IPC Capability Scoping**: Tauri v2 capability configuration restricts filesystem read/write operations and explicitly denies access to sensitive user directories (`$HOME/.ssh`, `$HOME/.aws`, `$HOME/.gnupg`).
4. **Content Security Policy**: Hardened CSP prevents clickjacking (`frame-src 'none'`), disables legacy object plugins (`object-src 'none'`), and confines script execution strictly to local application bundles (`default-src 'self'`).
5. **ReDoS-Resistant Search**: Search and replace algorithms implement zero-width boundary guards preventing infinite execution loops when processing regex patterns.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
