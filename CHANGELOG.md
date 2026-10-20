# Changelog

## 0.1.3

This release fixes three bugs that could change or lose the contents of your files. Updating is recommended.

### Fixed

- **Undo no longer moves text between tabs.** Switching from one tab to another and pressing Ctrl+Z could replace the current document with the text of the previous one, and saving would write that text to disk. Each tab now has its own undo history.
- **Files with Windows (CRLF) line endings no longer look modified when you haven't changed them.** Before, switching tabs marked these files as unsaved, and saving rewrote every line ending as LF, which showed up as a whole-file change in git. Scribe now remembers each file's line ending and saves it back the same way.
- **Autosave no longer opens a Save As dialog every interval.** With autosave on, a new untitled document triggered the dialog every 30 seconds. Autosave now skips documents that have never been saved, and it saves every modified tab rather than only the one in front. If an autosave fails, the tab keeps its unsaved marker instead of reporting an error in the background.

### Improved

- Each tab remembers its cursor and scroll position.
- Undo history is kept when you switch between editor, split, and preview modes.
- The status bar shows the file's actual line ending (LF or CRLF).
