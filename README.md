# Scribe — Native Markdown Editor & Viewer

<p align="center">
  <img src="src-tauri/icons/128x128@2x.png" alt="Scribe Logo" width="96" height="96" />
</p>

<p align="center">
  <strong>A lightning-fast, native Markdown editor and viewer for Windows, macOS, and Linux.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Tauri-v2.0-blue?logo=tauri&logoColor=white" alt="Tauri 2" />
  <img src="https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript&logoColor=white" alt="TypeScript 5.8" />
  <img src="https://img.shields.io/badge/CodeMirror-v6-black?logo=codemirror&logoColor=white" alt="CodeMirror 6" />
  <img src="https://img.shields.io/badge/Tailwind-CSS_v4-38bdf8?logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-0078d4" alt="Platforms: Windows, macOS, Linux" />
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License MIT" />
</p>

---

## 📖 Overview

**Scribe** is a fast desktop Markdown editor designed to feel like a responsive desktop application rather than an electron web wrapper. Built with **Tauri 2** (Rust) on the native backend and **React 19** with **CodeMirror 6** on the frontend, Scribe delivers instant startup, sub-millisecond typing latency, and real-time live preview synchronization.

Whether drafting technical documentation, taking notes, or previewing Markdown documents, Scribe provides an uninterrupted, distraction-free environment that respects your privacy and system resources.

---

## ✨ Key Features

### ⚡ Next-Generation Editor (CodeMirror 6)
- **Fluid Typing & Syntax Highlighting** — Full Markdown syntax highlighting with specialized styling for headings, blockquotes, inline code, links, and lists.
- **Smart Editing & Auto-Continuation** — Automatically continues unordered lists (`-`, `*`, `+`), numbered lists (`1.`), and checklists (`- [ ]`) when pressing <kbd>Enter</kbd>. Terminating empty items removes the prefix cleanly.
- **Auto-Closing & Bracket Matching** — Intelligent pairing for parentheses, square brackets, curly braces, and markdown formatting marks (`**`, `*`, `~~`, `` ` ``).
- **Custom Typography & Formatting** — Configurable font family (*Cascadia Code*, *Consolas*, *JetBrains Mono*, system monospaced), font size, line height, tab spacing (2, 4, 8 spaces), word wrapping, line numbers, and active line gutters.

### 🌓 Live Dual-Engine Preview & View Modes
- **GFM Compliant** — Complete GitHub Flavored Markdown support including tables, strikethrough, autolinks, and task checklists.
- **Syntax-Highlighted Code Blocks** — Automatic language detection and syntax highlighting powered by `rehype-highlight` and `highlight.js`, with an integrated language pill and one-click clipboard copy button.
- **Three View Layouts**:
  - **Editor Mode** (<kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>1</kbd>): Pure, distraction-free writing surface.
  - **Split Mode** (<kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>2</kbd>): Side-by-side editing with a draggable, responsive split divider.
  - **Preview Mode** (<kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>3</kbd>): Clean reading view formatted with GitHub-style typography.

### 🔒 Privacy-Focused & Offline-First
- **Zero Telemetry & Offline-First** — Never transmits document contents to external servers or cloud services. All computation and storage remain 100% local on your machine.
- **Local Asset Resolution** — Seamlessly resolves and previews local images relative to your markdown documents.

### 📑 Document Lifecycle & Data Safety
- **Multi-Tab Workspace** — Work across multiple files simultaneously with tab indicators, close buttons, and tab context menus (*Close*, *Close Others*, *Close All*).
- **Unsaved Changes Guard** — Clean confirmation dialog prompts before discarding unsaved edits when closing tabs or quitting the application.
- **Configurable Autosave** — Automatically writes document changes to disk at customizable intervals (5s to 120s).
- **External Change Detection** — Automatically syncs when a file is modified externally.
- **Recent Files Quick Access** — Pinned sidebar list of recently opened files for instant access.
- **Standalone HTML Export** — Export rendered, styled standalone HTML files independently of view mode.

### 🎯 Native OS Integration
- **Adaptive Theming** — Seamless switching between Light, Dark, and System theme (automatically tracking OS appearance).
- **Native File Dialogs & Associations** — Integrated with operating system file pickers for opening `.md`, `.markdown`, `.mdown`, and `.mkd` files.
- **Drag-and-Drop Ingestion** — Drag markdown files directly from your file manager into Scribe to open them instantly.
- **Command Palette** (<kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd>) — Quick-launcher with fuzzy search across all application actions and shortcuts.
- **Search & Replace** (<kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>F</kbd> / <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>H</kbd>) — Fast search with match counting, navigation, case-sensitivity, whole-word matching, and regular expressions.

---

## ⌨️ Keyboard Shortcuts

| Category | Windows / Linux | macOS | Action |
|:---|:---|:---|:---|
| **File** | <kbd>Ctrl</kbd> + <kbd>N</kbd> | <kbd>Cmd</kbd> + <kbd>N</kbd> | New Document |
| | <kbd>Ctrl</kbd> + <kbd>O</kbd> | <kbd>Cmd</kbd> + <kbd>O</kbd> | Open File(s) |
| | <kbd>Ctrl</kbd> + <kbd>S</kbd> | <kbd>Cmd</kbd> + <kbd>S</kbd> | Save Document |
| | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd> | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd> | Save As... |
| | <kbd>Ctrl</kbd> + <kbd>W</kbd> | <kbd>Cmd</kbd> + <kbd>W</kbd> | Close Active Document |
| **Editing** | <kbd>Ctrl</kbd> + <kbd>Z</kbd> | <kbd>Cmd</kbd> + <kbd>Z</kbd> | Undo |
| | <kbd>Ctrl</kbd> + <kbd>Y</kbd> | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd> | Redo |
| | <kbd>Ctrl</kbd> + <kbd>B</kbd> | <kbd>Cmd</kbd> + <kbd>B</kbd> | Bold (`**text**`) |
| | <kbd>Ctrl</kbd> + <kbd>I</kbd> | <kbd>Cmd</kbd> + <kbd>I</kbd> | Italic (`*text*`) |
| | <kbd>Ctrl</kbd> + <kbd>K</kbd> | <kbd>Cmd</kbd> + <kbd>K</kbd> | Insert Link (`[text](url)`) |
| **Search** | <kbd>Ctrl</kbd> + <kbd>F</kbd> | <kbd>Cmd</kbd> + <kbd>F</kbd> | Find in Document |
| | <kbd>Ctrl</kbd> + <kbd>H</kbd> | <kbd>Cmd</kbd> + <kbd>H</kbd> | Find & Replace |
| | <kbd>Enter</kbd> / <kbd>Shift</kbd>+<kbd>Enter</kbd> | <kbd>Enter</kbd> / <kbd>Shift</kbd>+<kbd>Enter</kbd> | Next / Previous Match |
| | <kbd>Esc</kbd> | <kbd>Esc</kbd> | Close Find / Replace Panel |
| **View** | <kbd>Ctrl</kbd> + <kbd>1</kbd> | <kbd>Cmd</kbd> + <kbd>1</kbd> | Editor Only View |
| | <kbd>Ctrl</kbd> + <kbd>2</kbd> | <kbd>Cmd</kbd> + <kbd>2</kbd> | Split Editor & Preview |
| | <kbd>Ctrl</kbd> + <kbd>3</kbd> | <kbd>Cmd</kbd> + <kbd>3</kbd> | Preview Only View |
| | <kbd>Ctrl</kbd> + <kbd>\</kbd> | <kbd>Cmd</kbd> + <kbd>\</kbd> | Toggle Sidebar |
| | <kbd>F11</kbd> | <kbd>Ctrl</kbd> + <kbd>Cmd</kbd> + <kbd>F</kbd> | Toggle Fullscreen |
| | <kbd>Ctrl</kbd> + <kbd>=</kbd> | <kbd>Cmd</kbd> + <kbd>=</kbd> | Zoom In |
| | <kbd>Ctrl</kbd> + <kbd>-</kbd> | <kbd>Cmd</kbd> + <kbd>-</kbd> | Zoom Out |
| | <kbd>Ctrl</kbd> + <kbd>0</kbd> | <kbd>Cmd</kbd> + <kbd>0</kbd> | Reset Zoom |
| **Launcher** | <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd> | <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd> | Command Palette |

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
| **Runtime** | [Tauri](https://v2.tauri.app/) | `2.x` | Cross-platform desktop shell & Rust backend |
| **Frontend Framework** | [React](https://react.dev/) | `19.1` | UI layout and reactive state rendering |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | `5.8` | Strict static type checking |
| **Build Tool** | [Vite](https://vite.dev/) | `7.x` | High-speed frontend development server and bundler |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | `4.3` | Modern design tokens and theming |
| **Code Editor** | [CodeMirror](https://codemirror.net/) | `6.x` | Extensible text editor, bracket matching, history, syntax tree |
| **Markdown Pipeline** | `react-markdown` | `10.1` | AST-based markdown parsing |
| **Syntax Highlighting** | `rehype-highlight` | `7.0` | Code block highlighting across 100+ programming languages |
| **Sanitization** | `rehype-sanitize` | `6.0` | Clean HTML filtering |
| **State Container** | [Zustand](https://github.com/pmndrs/zustand) | `5.0` | Decoupled document & UI store |
| **Iconography** | [Lucide React](https://lucide.dev/) | `1.39` | UI icon set |

---

## 📁 Project Structure

```
scribe/
├── .github/
│   └── workflows/
│       └── release.yml        # Multi-platform CI/CD (Windows, macOS, Linux)
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
│   │   └── Preview.tsx            # Clean react-markdown preview component
│   ├── markdown/              # AST & sanitization schemas
│   │   └── sanitizeSchema.ts      # Schema for safe HTML elements
│   ├── filesystem/            # Native I/O
│   │   └── fs.ts                  # Tauri plugin dialog & filesystem wrappers
│   ├── search/                # Find & Replace
│   │   └── SearchPanel.tsx        # Search UI with regex and match navigation
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
│   ├── capabilities/          # Capability definitions & permissions
│   │   └── default.json       # Scoped filesystem access
│   ├── icons/                 # Multi-resolution application icons (.ico, .icns, .png)
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

| Platform | Requirements |
|:---|:---|
| **All Platforms** | [Node.js](https://nodejs.org/) 18+ and [Rust](https://www.rust-lang.org/tools/install) (stable) |
| **Windows** | Windows 10/11 with WebView2 (pre-installed) & Visual Studio C++ Build Tools |
| **macOS** | macOS 11+ with Xcode Command Line Tools (`xcode-select --install`) |
| **Linux** | WebKitGTK and development libraries (see command below) |

On **Debian / Ubuntu**:
```bash
sudo apt-get update
sudo apt-get install -y libwebkit2gtk-4.1-dev build-essential curl wget file libssl-dev libayatana-appindicator3-dev librsvg2-dev
```

On **Fedora**:
```bash
sudo dnf check-update
sudo dnf install webkit2gtk4.1-devel openssl-devel libayatana-appindicator-devel librsvg2-devel
```

On **Arch Linux**:
```bash
sudo pacman -Syu --needed webkit2gtk-4.1 base-devel curl wget openssl libappindicator-gtk3 librsvg
```

---

### Installation & Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/abusuraihsakhri/scribe.git
   cd scribe
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Run the frontend in Vite (browser mode):**
   ```bash
   npm run dev
   ```

4. **Run the full native desktop app in dev mode:**
   ```bash
   npm run tauri dev
   ```

5. **Run unit tests:**
   ```bash
   npm test
   ```

---

## 📦 Building for Production

To compile Scribe for production:

```bash
# 1. Build frontend distribution bundle
npm run build

# 2. Build the native desktop bundle
npm run tauri build
```

The output packages will be located in `src-tauri/target/release/bundle/`:

* **Windows**: `nsis/Scribe_<version>_x64-setup.exe` and `msi/Scribe_<version>_x64_en-US.msi`
* **macOS**: `dmg/Scribe_<version>_x64.dmg` and `macos/Scribe.app` (or Universal binary: `npm run tauri build -- --target universal-apple-darwin`)
* **Linux**: `deb/scribe_<version>_amd64.deb` and `appimage/scribe_<version>_amd64.AppImage`

---

## 🌐 Automated Multi-Platform Releases (GitHub Actions)

This repository includes a GitHub Actions workflow in [`.github/workflows/release.yml`](file:///.github/workflows/release.yml) configured to build all platforms simultaneously on cloud runners.

Whenever you push a Git version tag (e.g., `v0.1.0`), GitHub Actions will automatically:
1. Spin up **Windows**, **macOS**, and **Ubuntu** runners in parallel.
2. Compile and package the native installers for each operating system:
   - Windows `.exe` installer & `.msi`
   - macOS `.dmg` and `.app` (Universal binary for both Apple Silicon and Intel Macs)
   - Linux `.AppImage` and `.deb`
3. Upload all generated binaries directly to a new **GitHub Draft Release**.

To trigger a release:
```bash
git tag v0.1.0
git push origin v0.1.0
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
