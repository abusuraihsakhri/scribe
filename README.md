# Scribe — Native Markdown Editor & Viewer

### [Open the Project Website & Downloads →](https://abusuraihsakhri.github.io/scribe/)

The GitHub Pages site includes screenshots, features, shortcuts, and links to published desktop installers. **Scribe is a native Tauri application; the GitHub Pages site is not an online Markdown editor.** Documents opened in the application are stored locally; remote images embedded in Markdown may be fetched from their original hosts.


<p align="center">
  <img src="src-tauri/icons/128x128@2x.png" alt="Scribe Logo" width="108" height="108" />
</p>

<p align="center">
  <strong>A lightning-fast, native Markdown editor and viewer built with Tauri 2, React 19, and CodeMirror 6.</strong><br>
  <em>Designed for speed, distraction-free writing, and seamless cross-platform performance on Windows, macOS, and Linux.</em>
</p>

<p align="center">
  <a href="#-key-features"><img src="https://img.shields.io/badge/Tauri-v2.0-blue?logo=tauri&logoColor=white" alt="Tauri 2" /></a>
  <a href="#-architecture--tech-stack"><img src="https://img.shields.io/badge/React-19.1-61dafb?logo=react&logoColor=black" alt="React 19" /></a>
  <a href="#-architecture--tech-stack"><img src="https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript&logoColor=white" alt="TypeScript 5.8" /></a>
  <a href="#-key-features"><img src="https://img.shields.io/badge/CodeMirror-v6-black?logo=codemirror&logoColor=white" alt="CodeMirror 6" /></a>
  <a href="#-architecture--tech-stack"><img src="https://img.shields.io/badge/Tailwind-CSS_v4-38bdf8?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" /></a>
  <a href="#-building-for-production"><img src="https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-0078d4" alt="Supported Platforms: Windows, macOS, Linux" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow" alt="License MIT" /></a>
</p>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Why Scribe?](#-why-scribe)
- [Key Features](#-key-features)
  - [Next-Generation CodeMirror 6 Editor](#-next-generation-codemirror-6-editor)
  - [Live Dual-Engine Preview & Layouts](#-live-dual-engine-preview--layouts)
  - [Multi-Document Tab Management & Safety](#-multi-document-tab-management--safety)
  - [Command Palette & Productivity](#-command-palette--productivity)
  - [Native OS Integration & Fluid Theming](#-native-os-integration--fluid-theming)
- [Keyboard Shortcuts Reference](#-keyboard-shortcuts-reference)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [Getting Started & Local Development](#-getting-started--local-development)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Development Workflow](#development-workflow)
  - [Running Unit Tests](#running-unit-tests)
- [Building for Production](#-building-for-production)
  - [Windows](#windows)
  - [macOS](#macos)
  - [Linux](#linux)
- [Configuration & Settings](#-configuration--settings)
- [License](#-license)

---

## 📖 Overview

**Scribe** is a fast, distraction-free desktop Markdown editor engineered from the ground up for writers, developers, researchers, and note-takers who value speed, simplicity, and privacy.

Instead of bundling a heavyweight browser runtime like traditional Electron editors, Scribe leverages **Tauri 2** with a lean Rust core and your operating system's native webview engine (WebView2 on Windows, WebKit on macOS/Linux). Paired with **React 19** and the modular **CodeMirror 6** text engine, Scribe delivers instant launch times, negligible memory consumption (<40MB), and instantaneous live preview rendering.

---

## 💡 Why Scribe?

| Feature | Scribe (Tauri 2 + CodeMirror 6) | Traditional Electron Editors | Web-Based Markdown Editors |
|:---|:---:|:---:|:---:|
| **Startup Time** | **< 300 ms** | 2 – 5 seconds | Dependent on network |
| **RAM Consumption** | **~35 – 50 MB** | 300 – 800+ MB | 200 – 500 MB (per tab) |
| **Keystroke Latency** | **Sub-millisecond** | Noticeable on large files | Dependent on connection |
| **Offline Reliability** | **100% Offline** | 100% Offline | Degraded / None |
| **Privacy & Telemetry** | **Zero Telemetry** | Often telemetry-heavy | Cloud-hosted data |
| **Native Feel** | **Native Window & Dialogs** | Web-styled wrappers | Browser container |

---

## ✨ Key Features

### ⚡ Next-Generation CodeMirror 6 Editor
- **Full Markdown Syntax Highlighting** — Real-time syntax tree parsing with distinctive tokens for headings, blockquotes, inline formatting, code spans, lists, and links.
- **Smart Editing & Auto-Continuation** — Pressing <kbd>Enter</kbd> automatically continues bulleted lists (`-`, `*`, `+`), numbered lists (`1.`, `2.`), checklists (`- [ ]`), and blockquotes (`>`). Pressing <kbd>Enter</kbd> on an empty item cleanly dismisses the marker.
- **Auto-Closing & Bracket Matching** — Automatically inserts pairs for parentheses `()`, square brackets `[]`, curly braces `{}`, markdown bold `****`, italic `**`, strikethrough `~~~~`, and inline code `` `` ``.
- **Formatting Toolbar** — Dedicated one-click formatting buttons for Bold, Italic, Strikethrough, Headings, Inline Code, Code Blocks, Links, Images, Quotes, Lists, Tables, and Dividers.
- **Customizable Typography** — Select between *Cascadia Code*, *Consolas*, *JetBrains Mono*, or your system monospaced font, with adjustable font size, tab stop size (2, 4, 8 spaces), word wrapping, and active line highlight gutters.

### 🌓 Live Dual-Engine Preview & Layouts
- **GFM Compliant** — Complete GitHub Flavored Markdown specification support, including tables, strikethrough, autolinks, and interactive task lists.
- **Code Block Highlighting** — Syntax-highlighted code blocks across 100+ programming languages powered by `rehype-highlight` and `highlight.js`, complete with an automatic language pill and one-click clipboard copy button.
- **Three Flexible View Modes**:
  - **Editor Mode** (<kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>1</kbd>): Minimalist, distraction-free writing environment.
  - **Split View** (<kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>2</kbd>): Simultaneous editing and real-time live preview separated by a smooth, draggable split divider.
  - **Preview Mode** (<kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>3</kbd>): Clean reading view with GitHub-inspired typography.
- **Relative Image Resolution** — Automatically resolves local image files relative to your document's directory path.

### 📑 Multi-Document Tab Management & Safety
- **Multi-Tab Workspace** — Open and edit multiple documents concurrently. Tabs include dirty change indicators (`●`), quick close buttons, and a context menu (*Close*, *Close Others*, *Close All*).
- **Unsaved Changes Safeguard** — Alerts you before closing modified files or quitting the application to ensure changes are never accidentally lost.
- **Configurable Autosave** — Automatically writes document changes to disk in the background at customizable intervals (5s to 120s).
- **External File Modification Detection** — Detects when an open file is edited outside Scribe and updates cleanly.
- **Recent Files Drawer** — Pinned sidebar list displaying recently opened documents for one-click access.
- **Standalone HTML Export** — Export rendered, styled HTML files with self-contained typography independent of the view mode.

### 🚀 Command Palette & Productivity
- **Fuzzy Command Launcher** (<kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd>) — Quick-launcher with fuzzy matching to trigger any editor command, toggle view modes, cycle themes, or adjust zoom without leaving the keyboard.
- **Search & Replace Panel** (<kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>F</kbd> / <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>H</kbd>) — Fast in-document search with match count indicator, next/previous navigation, match case, whole word, and regular expressions.
- **Live Status Bar** — Live calculation of words, character count, current cursor line and column, file encoding (UTF-8), and line ending formats (LF / CRLF).

### 🎨 Native OS Integration & Fluid Theming
- **Adaptive Theming** — Switch effortlessly between Light, Dark, and System theme (which follows your operating system's color mode).
- **Native File Dialogs** — Uses operating system file open and save dialogs with `.md`, `.markdown`, `.mdown`, and `.mkd` file filters.
- **Drag-and-Drop Ingestion** — Drag Markdown files directly from Windows File Explorer, macOS Finder, or Linux file managers into Scribe to open them instantly.

---

## ⌨️ Keyboard Shortcuts Reference

| Category | Windows / Linux | macOS | Action |
|:---|:---|:---|:---|
| **File Operations** | <kbd>Ctrl</kbd> + <kbd>N</kbd> | <kbd>Cmd</kbd> + <kbd>N</kbd> | New Document |
| | <kbd>Ctrl</kbd> + <kbd>O</kbd> | <kbd>Cmd</kbd> + <kbd>O</kbd> | Open File(s) |
| | <kbd>Ctrl</kbd> + <kbd>S</kbd> | <kbd>Cmd</kbd> + <kbd>S</kbd> | Save Document |
| | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd> | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd> | Save As... |
| | <kbd>Ctrl</kbd> + <kbd>W</kbd> | <kbd>Cmd</kbd> + <kbd>W</kbd> | Close Active Document |
| **Editing** | <kbd>Ctrl</kbd> + <kbd>Z</kbd> | <kbd>Cmd</kbd> + <kbd>Z</kbd> | Undo |
| | <kbd>Ctrl</kbd> + <kbd>Y</kbd> | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd> | Redo |
| | <kbd>Ctrl</kbd> + <kbd>B</kbd> | <kbd>Cmd</kbd> + <kbd>B</kbd> | Bold (`**text**`) |
| | <kbd>Ctrl</kbd> + <kbd>I</kbd> | <kbd>Cmd</kbd> + <kbd>I</kbd> | Italic (`*text*`) |
| | <kbd>Ctrl</kbd> + <kbd>K</kbd> | <kbd>Cmd</kbd> + <kbd>K</kbd> | Insert Link (`[text](url)`) |
| **Search & Replace** | <kbd>Ctrl</kbd> + <kbd>F</kbd> | <kbd>Cmd</kbd> + <kbd>F</kbd> | Find in Document |
| | <kbd>Ctrl</kbd> + <kbd>H</kbd> | <kbd>Cmd</kbd> + <kbd>H</kbd> | Find & Replace |
| | <kbd>Enter</kbd> / <kbd>Shift</kbd>+<kbd>Enter</kbd> | <kbd>Enter</kbd> / <kbd>Shift</kbd>+<kbd>Enter</kbd> | Next / Previous Match |
| | <kbd>Esc</kbd> | <kbd>Esc</kbd> | Close Search Panel |
| **Layout & Views** | <kbd>Ctrl</kbd> + <kbd>1</kbd> | <kbd>Cmd</kbd> + <kbd>1</kbd> | Editor Only View |
| | <kbd>Ctrl</kbd> + <kbd>2</kbd> | <kbd>Cmd</kbd> + <kbd>2</kbd> | Split Editor & Preview |
| | <kbd>Ctrl</kbd> + <kbd>3</kbd> | <kbd>Cmd</kbd> + <kbd>3</kbd> | Preview Only View |
| | <kbd>Ctrl</kbd> + <kbd>\</kbd> | <kbd>Cmd</kbd> + <kbd>\</kbd> | Toggle Sidebar |
| | <kbd>F11</kbd> | <kbd>Ctrl</kbd> + <kbd>Cmd</kbd> + <kbd>F</kbd> | Toggle Fullscreen |
| | <kbd>Ctrl</kbd> + <kbd>=</kbd> | <kbd>Cmd</kbd> + <kbd>=</kbd> | Zoom In |
| | <kbd>Ctrl</kbd> + <kbd>-</kbd> | <kbd>Cmd</kbd> + <kbd>-</kbd> | Zoom Out |
| | <kbd>Ctrl</kbd> + <kbd>0</kbd> | <kbd>Cmd</kbd> + <kbd>0</kbd> | Reset Zoom (100%) |
| **Launcher** | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd> | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd> | Command Palette |

---

## 🏗️ Architecture & Tech Stack

```
┌────────────────────────────────────────────────────────────────────────┐
│                              SCRIBE APP                                │
├───────────────────────────────────┬────────────────────────────────────┤
│         Frontend Presentation     │        Native Backend (Rust)       │
│   React 19 + TypeScript 5.8       │              Tauri 2               │
│   Tailwind CSS v4 + Lucide Icons  │  ────────────────────────────────  │
│                                   │   Window Management & Lifecycle    │
├───────────────────────────────────┤   Native OS File Dialogs           │
│         CodeMirror 6 Core         │   Scoped Async Filesystem I/O      │
│   Markdown Language Pack          │   Default URL Opener               │
│   Smart Editing Keymaps           │   Persistent Application Store     │
├───────────────────────────────────┼────────────────────────────────────┤
│          State Management         │         Markdown Pipeline          │
│   Zustand 5 (Documents, UI)       │   ReactMarkdown + remark-gfm       │
│   Local Storage Settings          │   rehype-highlight (hljs engine)   │
│                                   │   rehype-sanitize (Safe AST)       │
└───────────────────────────────────┴────────────────────────────────────┘
```

| Layer | Component | Version | Description |
|:---|:---|:---|:---|
| **Native Shell** | [Tauri](https://v2.tauri.app/) | `2.x` | Cross-platform Rust desktop runtime with native IPC bridges |
| **Frontend UI** | [React](https://react.dev/) | `19.1` | Component model, reactive rendering, and hooks |
| **Type Safety** | [TypeScript](https://www.typescriptlang.org/) | `5.8` | Strict compile-time static type system |
| **Build Tool** | [Vite](https://vite.dev/) | `7.x` | Fast development server and production Rollup bundler |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | `4.3` | Fluid design token engine with dark/light themes |
| **Editor Core** | [CodeMirror](https://codemirror.net/) | `6.x` | Modern extensible code editor with virtualized line rendering |
| **Markdown Engine** | `react-markdown` | `10.1` | Unified syntax tree processor for Markdown documents |
| **GFM Support** | `remark-gfm` | `4.0` | GitHub Flavored Markdown extensions (tables, task lists, URLs) |
| **Syntax Highlighting** | `rehype-highlight` | `7.0` | Token highlighter supporting over 100 languages |
| **HTML Filtering** | `rehype-sanitize` | `6.0` | AST-level sanitization ensuring clean and safe HTML output |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand) | `5.0` | Unopinionated, lightweight document and UI state store |
| **Icons** | [Lucide React](https://lucide.dev/) | `1.39` | Consistent, lightweight SVG icon package |

---

## 📁 Project Directory Structure

```
scribe/
├── .github/
│   └── workflows/
│       └── release.yml            # Cross-platform GitHub Actions release pipeline
├── src/
│   ├── components/                # UI Components
│   │   ├── FormattingToolbar.tsx  # Formatting action buttons (Bold, Code, Table, etc.)
│   │   ├── Sidebar.tsx            # Open documents list and recent files drawer
│   │   ├── StatusBar.tsx          # Word/char counters, cursor Ln/Col, file encoding
│   │   ├── Toolbar.tsx            # Top application bar with view controls
│   │   ├── UnsavedChangesDialog.tsx # Confirmation modal for dirty documents
│   │   ├── WelcomeScreen.tsx      # Landing page when no document is open
│   │   └── Workspace.tsx          # Resizable split workspace container
│   ├── editor/                    # CodeMirror 6 Implementation
│   │   ├── CodeEditor.tsx         # CodeMirror instance with dynamic compartments
│   │   ├── codeEditorTheme.ts     # Dark and light editor theme tokens
│   │   ├── formatting.ts          # Selection wrapping, block inserting logic
│   │   └── smartEditing.ts        # Enter/Tab auto-continuation keymaps
│   ├── preview/                   # Markdown Rendering
│   │   ├── CodeBlock.tsx          # Fenced code block component with copy button
│   │   └── Preview.tsx            # Live preview renderer with relative image resolution
│   ├── markdown/                  # Sanitization & Schemas
│   │   └── sanitizeSchema.ts      # Whitelist schema for allowed HTML attributes
│   ├── filesystem/                # File Operations
│   │   └── fs.ts                  # Tauri plugin dialog & filesystem wrappers
│   ├── search/                    # Search & Replace
│   │   └── SearchPanel.tsx        # Search interface with regex support
│   ├── commands/                  # Command Launcher
│   │   ├── CommandPalette.tsx     # Fuzzy-search command modal
│   │   └── commands.ts            # Action registry and fuzzy-matching logic
│   ├── settings/                  # Application Preferences
│   │   ├── SettingsDialog.tsx     # Tabbed settings dialog (Editor, Appearance, Files)
│   │   └── settingsStore.ts       # Persistent user settings store
│   ├── state/                     # Zustand State Stores
│   │   ├── documentsStore.ts      # Multi-document tabs, dirty states, save logic
│   │   ├── recentFilesStore.ts    # Recently opened files history
│   │   ├── uiStore.ts             # Active view mode, sidebar visibility, theme
│   │   └── types.ts               # Core domain interfaces
│   ├── styles/                    # Stylesheets
│   │   ├── theme.css              # CSS custom properties for dark/light themes
│   │   └── preview.css            # Markdown typography and highlight styles
│   ├── utils/                     # Utility Functions
│   │   ├── textStats.ts           # Word, character, and line count calculators
│   │   └── useDebouncedValue.ts   # Debounce hook for smooth preview updates
│   ├── App.tsx                    # Root application component and orchestrator
│   └── main.tsx                   # Frontend entry point
├── src-tauri/                     # Tauri 2 Native Backend
│   ├── capabilities/              # Fine-grained Tauri permissions
│   │   └── default.json           # Scoped filesystem and dialog capabilities
│   ├── icons/                     # Application icons (.ico, .icns, multi-size .png)
│   ├── src/                       # Rust Source Code
│   │   ├── lib.rs                 # Tauri plugin registration & builder
│   │   └── main.rs                # Application entry point
│   ├── Cargo.toml                 # Rust dependencies and manifest
│   └── tauri.conf.json            # Tauri runtime configuration & bundle settings
├── package.json                   # Node.js dependencies and scripts
├── tsconfig.json                  # TypeScript compiler settings
└── vite.config.ts                 # Vite bundler & Tauri development server config
```

---

## 🚀 Getting Started & Local Development

### Prerequisites

| Platform | Requirements |
|:---|:---|
| **All Platforms** | [Node.js](https://nodejs.org/) (v18.0.0 or higher) and [Rust](https://www.rust-lang.org/tools/install) (stable toolchain) |
| **Windows** | Windows 10/11 with WebView2 runtime (pre-installed) & Visual Studio C++ Build Tools |
| **macOS** | macOS 11+ with Xcode Command Line Tools (`xcode-select --install`) |
| **Linux** | WebKitGTK and development libraries (see installation commands below) |

#### Linux Dependency Installation

**Ubuntu / Debian / Linux Mint:**
```bash
sudo apt update
sudo apt install -y libwebkit2gtk-4.1-dev build-essential curl wget file libssl-dev libayatana-appindicator3-dev librsvg2-dev
```

**Fedora / RHEL:**
```bash
sudo dnf check-update
sudo dnf install webkit2gtk4.1-devel openssl-devel libayatana-appindicator-devel librsvg2-devel
```

**Arch Linux / Manjaro:**
```bash
sudo pacman -Syu --needed webkit2gtk-4.1 base-devel curl wget openssl libappindicator-gtk3 librsvg
```

---

### Installation

Clone the repository and install frontend dependencies:

```bash
git clone https://github.com/abusuraihsakhri/scribe.git
cd scribe
npm install
```

### Development Workflow

Start the frontend Vite server in browser mode:
```bash
npm run dev
```

Run the full native desktop app with live reload:
```bash
npm run tauri dev
```

### Running Unit Tests

Run the test suite using Vitest:
```bash
npm test
```

---

## 📦 Building for Production

To build optimized native installers and executables:

```bash
# 1. Build the production web bundle
npm run build

# 2. Build native desktop installer packages
npm run tauri build
```

Generated packages will be output to `src-tauri/target/release/bundle/`:

### Windows
* **NSIS Setup Installer**: `nsis/Scribe_<version>_x64-setup.exe`
* **MSI Package**: `msi/Scribe_<version>_x64_en-US.msi`

### macOS
* **Disk Image**: `dmg/Scribe_<version>_x64.dmg`
* **Application Bundle**: `macos/Scribe.app`
* **Universal Binary (Intel + Apple Silicon)**:
  ```bash
  rustup target add aarch64-apple-darwin x86_64-apple-darwin
  npm run tauri build -- --target universal-apple-darwin
  ```

### Linux
* **AppImage**: `appimage/scribe_<version>_amd64.AppImage`
* **Debian Package**: `deb/scribe_<version>_amd64.deb`

---

## ⚙️ Configuration & Settings

Scribe provides a built-in Settings dialog accessible via the toolbar or <kbd>Ctrl/Cmd</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd> → **Settings**:

### 🖊️ Editor Preferences
* **Font Family** — Choose between *Cascadia Code*, *Consolas*, *JetBrains Mono*, or system monospaced.
* **Font Size** — Slider from 10px to 24px (default: 14.5px).
* **Tab Size** — Choose 2, 4, or 8 spaces.
* **Word Wrap** — Toggle soft line wrapping.
* **Line Numbers** — Show or hide line numbers in the gutter.
* **Highlight Active Line** — Highlight the line currently under the cursor.

### 🎨 Appearance
* **Theme** — Select *Light*, *Dark*, or *System* (follows your operating system preference).
* **Sidebar** — Toggle visibility of the documents and recent files drawer.

### 💾 Files & Autosave
* **Autosave** — Toggle automatic background document saving.
* **Autosave Interval** — Adjustable from 5 seconds to 120 seconds.
* **Confirm Before Close** — Toggle unsaved changes guard prompts.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
