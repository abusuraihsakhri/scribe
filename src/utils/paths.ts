/** True for "C:\..." / "C:/..." and "/..." paths. UNC paths ("\\server") are not treated as absolute. */
export function isAbsolutePath(path: string): boolean {
  return /^[a-zA-Z]:[\\/]/.test(path) || /^\/(?!\/)/.test(path);
}

export function dirname(path: string): string {
  return path.replace(/[\\/][^\\/]*$/, "");
}

/**
 * Resolves a relative path (which may contain "." and "..") against a directory,
 * using the directory's separator. Returns null if it would climb above the root.
 */
export function resolveRelativePath(baseDir: string, relative: string): string | null {
  const separator = baseDir.includes("\\") ? "\\" : "/";
  const [root, ...rest] = baseDir.split(/[\\/]/);
  const parts = rest.filter(Boolean);
  for (const segment of relative.split(/[\\/]/)) {
    if (segment === "" || segment === ".") continue;
    if (segment === "..") {
      if (parts.length === 0) return null;
      parts.pop();
    } else {
      parts.push(segment);
    }
  }
  return [root, ...parts].join(separator);
}
