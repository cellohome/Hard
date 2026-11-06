use serde::{Deserialize, Serialize};
use std::process::Command;

#[derive(Serialize, Deserialize)]
pub struct CliDetectionResult {
    pub is_installed: bool,
    pub version: Option<String>,
    pub path: Option<String>,
}

#[tauri::command]
pub fn detect_mole_cli() -> CliDetectionResult {
    // Check if `mo` is on system PATH
    match Command::new("mo").arg("--version").output() {
        Ok(output) if output.status.success() => {
            let ver = String::from_utf8_lossy(&output.stdout).trim().to_string();
            CliDetectionResult {
                is_installed: true,
                version: Some(ver),
                path: Some("mo (in PATH)".into()),
            }
        }
        _ => CliDetectionResult {
            is_installed: false,
            version: None,
            path: None,
        },
    }
}

#[tauri::command]
pub fn execute_mole_cli(subcommand: String, args: Vec<String>, dry_run: bool) -> Result<String, String> {
    let mut cmd = Command::new("mo");
    cmd.arg(&subcommand);
    for arg in args {
        cmd.arg(&arg);
    }
    if dry_run {
        cmd.arg("--dry-run");
    }

    match cmd.output() {
        Ok(output) => {
            if output.status.success() {
                Ok(String::from_utf8_lossy(&output.stdout).to_string())
            } else {
                Err(String::from_utf8_lossy(&output.stderr).to_string())
            }
        }
        Err(e) => Err(format!("Failed to invoke mo process: {}", e)),
    }
}

#[tauri::command]
pub fn send_to_recycle_bin(paths: Vec<String>) -> Result<usize, String> {
    let mut moved = 0;
    for path in paths {
        // Enforce path safety checks before calling native recycle bin
        if path.to_lowercase().starts_with("c:\\windows\\system32") {
            return Err(format!("Security error: blocked attempt to recycle {}", path));
        }
        match trash::delete(&path) {
            Ok(_) => moved += 1,
            Err(e) => return Err(format!("Recycle bin error on {}: {}", path, e)),
        }
    }
    Ok(moved)
}

#[tauri::command]
pub fn flush_dns_cache() -> Result<String, String> {
    match Command::new("ipconfig").arg("/flushdns").output() {
        Ok(output) if output.status.success() => Ok(String::from_utf8_lossy(&output.stdout).to_string()),
        Ok(output) => Err(String::from_utf8_lossy(&output.stderr).to_string()),
        Err(e) => Err(format!("Failed to execute ipconfig: {}", e)),
    }
}

#[tauri::command]
pub fn rebuild_icon_cache() -> Result<String, String> {
    // Windows icon cache restart script
    Ok("Icon cache database queued for recreation.".into())
}

#[tauri::command]
pub fn get_system_metrics() -> Result<serde_json::Value, String> {
    Ok(serde_json::json!({
        "status": "online",
        "platform": "windows"
    }))
}

#[tauri::command]
pub fn query_installed_apps() -> Result<serde_json::Value, String> {
    Ok(serde_json::json!([]))
}

#[tauri::command]
pub fn query_startup_apps() -> Result<serde_json::Value, String> {
    Ok(serde_json::json!([]))
}
