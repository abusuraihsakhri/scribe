import { useEffect, useRef } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

const MARKDOWN_FILE = /\.(md|markdown|mdown|mkd)$/i;

function pathsFromArgs(args: string[]): string[] {
  return args
    .map((arg) => arg.trim().replace(/^["']|["']$/g, ""))
    .filter((arg) => arg && !arg.startsWith("-") && !/\.(exe|app)$/i.test(arg));
}

/**
 * Calls onOpen with file paths the OS asks Scribe to open: files dropped on the window,
 * files passed on the command line at launch (e.g. double-clicking an associated .md),
 * and files forwarded later by the single-instance plugin.
 */
export function useOpenFileRequests(onOpen: (paths: string[]) => void) {
  const onOpenRef = useRef(onOpen);
  onOpenRef.current = onOpen;

  useEffect(() => {
    const unlisteners: Promise<() => void>[] = [];

    unlisteners.push(
      getCurrentWindow().onDragDropEvent((event) => {
        if (event.payload.type !== "drop") return;
        const paths = event.payload.paths.filter((p) => MARKDOWN_FILE.test(p));
        if (paths.length > 0) onOpenRef.current(paths);
      }),
    );

    invoke<string[]>("get_cli_args")
      .then((args) => {
        const paths = pathsFromArgs(args.slice(1));
        if (paths.length > 0) onOpenRef.current(paths);
      })
      .catch((err) => console.error("Failed to get CLI args:", err));

    unlisteners.push(
      listen<string[]>("open-file-argument", (event) => {
        if (!Array.isArray(event.payload)) return;
        const paths = pathsFromArgs(event.payload.slice(1));
        if (paths.length > 0) onOpenRef.current(paths);
      }),
    );

    return () => {
      for (const unlisten of unlisteners) void unlisten.then((fn) => fn());
    };
  }, []);
}
