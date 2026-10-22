import { useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { ask } from "@tauri-apps/plugin-dialog";
import { useDocumentsStore } from "../state/documentsStore";

function confirmReload(title: string): Promise<boolean> {
  return ask(`"${title}" was changed by another program. Reload it and discard your unsaved edits here?`, {
    title: "File changed on disk",
    kind: "warning",
    okLabel: "Reload",
    cancelLabel: "Keep my edits",
  });
}

/** Picks up edits made in other programs (or by git) whenever the window regains focus. */
export function useExternalFileChanges() {
  useEffect(() => {
    let unlisten: (() => void) | undefined;
    void getCurrentWindow()
      .onFocusChanged(({ payload: focused }) => {
        if (focused) void useDocumentsStore.getState().syncWithDisk(confirmReload);
      })
      .then((fn) => { unlisten = fn; });
    return () => unlisten?.();
  }, []);
}
