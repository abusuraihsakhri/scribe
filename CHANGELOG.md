# Changelog

## 0.1.4

This release fixes two ways Scribe could lose your writing, and makes images and links in the preview work. Updating is recommended.

### Fixed

- **Typing during a save no longer loses those keystrokes.** If you kept typing while a save or autosave was writing to disk, the tab could show as saved even though the newest text was never written, and closing Scribe would then discard it without asking. The tab now stays marked as unsaved until everything you typed is on disk.
- **Saves can no longer leave a file empty or half written.** Scribe used to clear the file and then write it, so a crash or power cut in between could wipe it. Saves now write a temporary copy first and swap it in only once it is complete.
- **Edits made in other programs are no longer overwritten.** Scribe didn't notice when a file changed on disk (another editor, a sync tool, `git checkout`), and the next autosave replaced the newer version. When you switch back to Scribe it now reloads changed files. If you also have unsaved edits in that tab, it asks which version to keep, and autosave leaves the file alone until you decide.
- **Local images now show in the preview.** Images next to your document (`![](diagram.png)`), in parent folders (`../assets/logo.png`), or with spaces in their names were not displayed.

### Improved

- Links to other Markdown files open them in a new tab, and `#heading` links scroll to that heading. `mailto:` links open your mail app.
- Opening several files at once no longer fails entirely when one of them can't be read. The rest open, and the ones that failed are listed in a single message.
- A file that can't be opened by double-clicking it now shows an error instead of silently doing nothing.

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
