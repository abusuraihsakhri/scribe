use tauri::{Emitter, Manager};

mod atomic_write;

#[cfg(windows)]
mod windows_assoc;

#[tauri::command]
fn get_cli_args() -> Vec<String> {
    std::env::args().collect()
}

#[tauri::command]
fn write_text_file_atomic(path: String, contents: String) -> Result<(), String> {
    atomic_write::write_atomic(std::path::Path::new(&path), &contents).map_err(|e| e.to_string())
}

#[tauri::command]
fn exit_app(app: tauri::AppHandle) {
    app.exit(0);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|_app| {
            #[cfg(windows)]
            windows_assoc::register_file_associations();
            Ok(())
        })
        .plugin(tauri_plugin_single_instance::init(|app, argv, _cwd| {
            let _ = app.emit("open-file-argument", argv);
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.unminimize();
                let _ = window.set_focus();
            }
        }))
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .invoke_handler(tauri::generate_handler![get_cli_args, write_text_file_atomic, exit_app])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
