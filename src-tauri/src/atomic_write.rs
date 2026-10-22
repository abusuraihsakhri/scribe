use std::fs;
use std::io::{self, Write};
use std::path::{Component, Path};

/// Mirrors the deny list on the fs plugin permissions in capabilities/default.json,
/// since this command bypasses that scope.
const DENIED_DIRS: [&str; 3] = [".ssh", ".aws", ".gnupg"];

fn is_denied(path: &Path) -> bool {
    path.components().any(|c| match c {
        Component::Normal(name) => DENIED_DIRS.iter().any(|d| name.eq_ignore_ascii_case(d)),
        _ => false,
    })
}

/// Writes `contents` to a temporary file beside `path`, flushes it to disk, then renames it
/// over `path`. A crash or power loss leaves either the old file or the new one, never a
/// truncated mix.
pub fn write_atomic(path: &Path, contents: &str) -> io::Result<()> {
    // Write through symlinks to the real file instead of replacing the link itself.
    let target = fs::canonicalize(path).unwrap_or_else(|_| path.to_path_buf());
    if is_denied(&target) {
        return Err(io::Error::new(io::ErrorKind::PermissionDenied, "Permission denied: protected folder"));
    }
    let (Some(dir), Some(name)) = (target.parent(), target.file_name()) else {
        return Err(io::Error::new(io::ErrorKind::InvalidInput, "Not a file path"));
    };
    let tmp = dir.join(format!(".{}.scribe-tmp", name.to_string_lossy()));

    let result = (|| {
        let mut file = fs::File::create(&tmp)?;
        file.write_all(contents.as_bytes())?;
        file.sync_all()?;
        drop(file);
        if let Ok(meta) = fs::metadata(&target) {
            fs::set_permissions(&tmp, meta.permissions())?;
        }
        fs::rename(&tmp, &target)
    })();

    if result.is_err() {
        let _ = fs::remove_file(&tmp);
    }
    result
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::path::PathBuf;

    fn scratch_dir(name: &str) -> PathBuf {
        let dir = std::env::temp_dir().join(format!("scribe-atomic-{}-{}", name, std::process::id()));
        let _ = fs::remove_dir_all(&dir);
        fs::create_dir_all(&dir).unwrap();
        dir
    }

    #[test]
    fn creates_a_new_file() {
        let dir = scratch_dir("create");
        let path = dir.join("new.md");
        write_atomic(&path, "# Hello").unwrap();
        assert_eq!(fs::read_to_string(&path).unwrap(), "# Hello");
    }

    #[test]
    fn replaces_existing_content_and_leaves_no_temp_file() {
        let dir = scratch_dir("replace");
        let path = dir.join("notes.md");
        fs::write(&path, "a much longer original body").unwrap();
        write_atomic(&path, "short").unwrap();
        assert_eq!(fs::read_to_string(&path).unwrap(), "short");
        assert_eq!(fs::read_dir(&dir).unwrap().count(), 1);
    }

    #[test]
    fn refuses_protected_folders() {
        let dir = scratch_dir("denied").join(".ssh");
        fs::create_dir_all(&dir).unwrap();
        let err = write_atomic(&dir.join("authorized_keys"), "x").unwrap_err();
        assert_eq!(err.kind(), io::ErrorKind::PermissionDenied);
        assert!(!dir.join("authorized_keys").exists());
    }
}
