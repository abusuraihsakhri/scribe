# Scribe

A native Windows 11 Markdown editor and viewer built with Tauri 2, React, and TypeScript.

Scribe is a fast, polished desktop application for creating, editing, and previewing Markdown documents — designed to feel like a professional Windows 11 application rather than a web wrapper.

## Features

- **CodeMirror 6 Editor** — Line numbers, syntax highlighting, bracket matching, smart editing (auto-continuation of lists, checklists, blockquotes)
- **Markdown Preview** — Full GFM support with syntax-highlighted code blocks, tables, task lists, and a carefully designed typography system
- **Three View Modes** — Editor-only, Preview-only, and Split view with a draggable divider
- **Tab Bar** — Multiple open documents with dirty indicators and close buttons
- **Formatting Toolbar** — Bold, Italic, Heading, Link, Code, Quote, List, Checklist, Table, and more
- **Sidebar** — Open documents list and recent files
- **Search & Replace** — Find, Replace, Replace All with case sensitivity, whole word, and regex toggles
- **Command Palette** — Ctrl+Shift+P fuzzy command launcher with all available commands
- **Settings** — Editor font/size, tab size, word wrap, theme, autosave, and more
- **Themes** — Light, Dark, and System (follows Windows theme)
- **File Operations** — New, Open, Save, Save As, drag-and-drop, native Windows file dialogs
- **Data Safety** — Unsaved changes protection, autosave, external file change detection
- **Keyboard-First** — Full set of Windows-friendly shortcuts
- **Offline** — Works completely without internet

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Tauri 2 (Rust backend) |
| Frontend | React 19, TypeScript 5.8, Vite 7 |
| Styling | Tailwind CSS 4 |
| Editor | CodeMirror 6 |
| Preview | react-markdown + remark-gfm + rehype-highlight |
| State | Zustand 5 |
| Icons | Lucide React |

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://www.rust-lang.org/tools/install) (for Tauri backend)
- Windows 11 (primary target platform)

### Setup

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run the Tauri desktop app in dev mode
npm run tauri dev
```

### Build

```bash
# Build the frontend
npm run build

# Build the Windows installer
npm run tauri build
```

The Windows installer will be output to `src-tauri/target/release/bundle/`.

### Test

```bash
npx vitest run
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+N | New document |
| Ctrl+O | Open file |
| Ctrl+S | Save |
| Ctrl+Shift+S | Save As |
| Ctrl+W | Close document |
| Ctrl+F | Find |
| Ctrl+H | Find and Replace |
| Ctrl+Z | Undo |
| Ctrl+Y | Redo |
| Ctrl+B | Bold |
| Ctrl+I | Italic |
| Ctrl+K | Insert link |
| Ctrl+Shift+P | Command palette |
| Ctrl+1 | Editor mode |
| Ctrl+2 | Split view |
| Ctrl+3 | Preview mode |
| Ctrl+\\ | Toggle sidebar |
| Ctrl+= | Zoom in |
| Ctrl+- | Zoom out |
| Ctrl+0 | Reset zoom |
| F11 | Fullscreen |

## Project Structure

```
src/
  App.tsx              # Root component, orchestrator
  main.tsx             # Entry point
  components/          # UI components (Toolbar, StatusBar, Workspace, Sidebar, etc.)
  editor/              # CodeMirror editor, formatting, smart editing, theme
  preview/             # Markdown preview renderer and code block component
  tabs/                # Tab bar component
  search/              # Search & Replace panel
  commands/            # Command palette
  settings/            # Settings dialog and settings store
  markdown/            # Sanitize schema for HTML preview
  filesystem/          # File I/O via Tauri plugins
  state/               # Zustand stores (documents, UI, recent files)
  styles/              # CSS (theme tokens, preview typography)
  utils/               # Utilities (text stats, debounce hook)

src-tauri/             # Tauri Rust backend
  src/                 # Rust source
  capabilities/        # Tauri plugin permissions
  icons/               # Application icons
```

## Known Limitations

- Image clipboard paste requires the document to be saved first (needs a directory path)
- Mermaid diagram rendering is not implemented
- Export is limited to HTML (no PDF)
- No file tree/explorer for browsing a project folder
