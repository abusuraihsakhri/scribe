#[cfg(windows)]
pub fn register_file_associations() {
    use winreg::enums::HKEY_CURRENT_USER;
    use winreg::RegKey;

    let current_exe = match std::env::current_exe() {
        Ok(path) => path,
        Err(e) => {
            eprintln!("[Scribe] Failed to resolve current executable path: {e}");
            return;
        }
    };

    let exe_path_str = current_exe.to_string_lossy();
    let open_command = format!("\"{exe_path_str}\" \"%1\"");
    let icon_path = format!("\"{exe_path_str}\",0");

    let hkcu = RegKey::predef(HKEY_CURRENT_USER);

    let exe_name = current_exe
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("scribe.exe");

    // Fast path: if already registered with the current executable path, skip to avoid redundant writes
    if let Ok(cmd_key) = hkcu.open_subkey(format!(r"Software\Classes\Applications\{exe_name}\shell\open\command")) {
        if let Ok(val) = cmd_key.get_value::<String, _>("") {
            if val == open_command {
                return;
            }
        }
    }

    // 1. Register ProgID: HKCU\Software\Classes\Scribe.md
    let prog_id = "Scribe.md";
    let (prog_key, _) = match hkcu.create_subkey(format!(r"Software\Classes\{prog_id}")) {
        Ok(k) => k,
        Err(e) => {
            eprintln!("[Scribe] Failed to create ProgID key: {e}");
            return;
        }
    };
    let _ = prog_key.set_value("", &"Markdown Document");
    let _ = prog_key.set_value("FriendlyTypeName", &"Markdown Document");

    if let Ok((icon_key, _)) = hkcu.create_subkey(format!(r"Software\Classes\{prog_id}\DefaultIcon")) {
        let _ = icon_key.set_value("", &icon_path);
    }

    if let Ok((cmd_key, _)) = hkcu.create_subkey(format!(r"Software\Classes\{prog_id}\shell\open\command")) {
        let _ = cmd_key.set_value("", &open_command);
    }

    // 2. Extensions to register
    let extensions = [".md", ".markdown", ".mdown", ".mkd"];

    for ext in extensions {
        // Register OpenWithProgids so Scribe appears in "Open with"
        if let Ok((ow_key, _)) = hkcu.create_subkey(format!(r"Software\Classes\{ext}\OpenWithProgids")) {
            let _ = ow_key.set_value(prog_id, &"");
        }
    }

    // 3. Register Applications\scribe.exe
    let (app_key, _) = match hkcu.create_subkey(format!(r"Software\Classes\Applications\{exe_name}")) {
        Ok(k) => k,
        Err(e) => {
            eprintln!("[Scribe] Failed to create Applications key: {e}");
            return;
        }
    };
    let _ = app_key.set_value("FriendlyAppName", &"Scribe");

    if let Ok((app_cmd_key, _)) = hkcu.create_subkey(format!(r"Software\Classes\Applications\{exe_name}\shell\open\command")) {
        let _ = app_cmd_key.set_value("", &open_command);
    }

    if let Ok((supported_key, _)) = hkcu.create_subkey(format!(r"Software\Classes\Applications\{exe_name}\SupportedTypes")) {
        for ext in extensions {
            let _ = supported_key.set_value(ext, &"");
        }
    }

    // 4. Register Capabilities for Windows Default Apps (Settings -> Default apps)
    let (cap_key, _) = match hkcu.create_subkey(r"Software\Scribe\Capabilities") {
        Ok(k) => k,
        Err(e) => {
            eprintln!("[Scribe] Failed to create Capabilities key: {e}");
            return;
        }
    };
    let _ = cap_key.set_value("ApplicationName", &"Scribe");
    let _ = cap_key.set_value("ApplicationDescription", &"A fast, native Markdown editor and viewer.");

    if let Ok((file_assoc_key, _)) = hkcu.create_subkey(r"Software\Scribe\Capabilities\FileAssociations") {
        for ext in extensions {
            let _ = file_assoc_key.set_value(ext, &prog_id);
        }
    }

    // 5. Register in RegisteredApplications
    if let Ok((reg_apps_key, _)) = hkcu.create_subkey(r"Software\RegisteredApplications") {
        let _ = reg_apps_key.set_value("Scribe", &r"Software\Scribe\Capabilities");
    }

    // 6. Notify the Windows Shell of the file association changes
    #[link(name = "shell32")]
    extern "system" {
        fn SHChangeNotify(
            w_event_id: i32,
            u_flags: u32,
            dw_item1: *const std::ffi::c_void,
            dw_item2: *const std::ffi::c_void,
        );
    }

    const SHCNE_ASSOCCHANGED: i32 = 0x0800_0000;
    const SHCNF_IDLIST: u32 = 0x0000;

    unsafe {
        SHChangeNotify(SHCNE_ASSOCCHANGED, SHCNF_IDLIST, std::ptr::null(), std::ptr::null());
    }
}
