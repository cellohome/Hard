// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            commands::get_system_metrics,
            commands::detect_mole_cli,
            commands::execute_mole_cli,
            commands::send_to_recycle_bin,
            commands::query_installed_apps,
            commands::query_startup_apps,
            commands::flush_dns_cache,
            commands::rebuild_icon_cache
        ])
        .run(tauri::generate_context!())
        .expect("error while running Hard desktop application");
}
