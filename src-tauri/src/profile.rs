//! Хранение настроек и профилей в %APPDATA%\crosshairZ.

use serde_json::{json, Value};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

pub fn data_dir(app: &AppHandle) -> PathBuf {
    let dir = app
        .path()
        .app_data_dir()
        .expect("не удалось определить каталог данных приложения");
    let _ = fs::create_dir_all(&dir);
    dir
}

pub fn settings_path(app: &AppHandle) -> PathBuf {
    data_dir(app).join("settings.json")
}

pub fn profiles_dir(app: &AppHandle) -> PathBuf {
    let dir = data_dir(app).join("profiles");
    let _ = fs::create_dir_all(&dir);
    dir
}

pub fn images_dir(app: &AppHandle) -> PathBuf {
    let dir = data_dir(app).join("images");
    let _ = fs::create_dir_all(&dir);
    dir
}

pub fn default_settings() -> Value {
    json!({
        "version": 1,
        "profile": "default",
        "crosshair": {
            "shape": "cross",
            "size": 24,
            "thickness": 2,
            "gap": 6,
            "length": 14,
            "roundness": 0,
            "rotation": 0,
            "opacity": 1.0,
            "color": "#00e676",
            "outline": { "enabled": true, "thickness": 2, "color": "#000000", "opacity": 0.75 },
            "centerDot": { "enabled": false, "size": 4, "shape": "circle", "color": "#ffffff" }
        },
        "image": { "enabled": false, "src": "", "scale": 1.0, "angle": 0, "opacity": 1.0, "offsetX": 0, "offsetY": 0 },
        "position": { "offsetX": 0, "offsetY": 0, "monitor": 0 },
        "hotkeys": { "toggleOverlay": "F8", "toggleSettings": "F9" },
        "ui": { "theme": "glass", "accentColor": "#4c8dff", "language": "ru", "previewBg": "grid", "previewImage": "" }
    })
}

pub fn load_settings(app: &AppHandle) -> Value {
    match fs::read_to_string(settings_path(app)) {
        Ok(text) => serde_json::from_str(&text).unwrap_or_else(|_| default_settings()),
        Err(_) => default_settings(),
    }
}

pub fn save_settings_file(app: &AppHandle, v: &Value) -> Result<(), String> {
    let pretty = serde_json::to_string_pretty(v).map_err(|e| e.to_string())?;
    fs::write(settings_path(app), pretty).map_err(|e| format!("Не удалось записать настройки: {e}"))?;
    sync_gamebar_settings(v);
    Ok(())
}

pub fn file_to_data_uri(path_str: &str) -> Option<String> {
    let path = std::path::Path::new(path_str);
    if !path.exists() {
        return None;
    }
    let ext = path.extension()?.to_string_lossy().to_lowercase();
    let mime = match ext.as_str() {
        "png" => "image/png",
        "svg" => "image/svg+xml",
        "gif" => "image/gif",
        "jpg" | "jpeg" => "image/jpeg",
        "webp" => "image/webp",
        "bmp" => "image/bmp",
        _ => "image/png",
    };
    let bytes = std::fs::read(path).ok()?;
    use base64::Engine;
    let b64 = base64::engine::general_purpose::STANDARD.encode(&bytes);
    Some(format!("data:{mime};base64,{b64}"))
}

pub fn prepare_gamebar_json(v: &Value) -> Value {
    let mut prepared = v.clone();
    if let Some(img) = prepared.get_mut("image").and_then(|i| i.as_object_mut()) {
        let enabled = img.get("enabled").and_then(|e| e.as_bool()).unwrap_or(false);
        if enabled {
            if let Some(src) = img.get("src").and_then(|s| s.as_str()) {
                if !src.starts_with("data:") && !src.starts_with("http") && !src.is_empty() {
                    if let Some(data_uri) = file_to_data_uri(src) {
                        img.insert("src".to_string(), Value::String(data_uri));
                    }
                }
            }
        }
    }
    prepared
}

pub fn sync_gamebar_settings(v: &Value) {
    let prepared = prepare_gamebar_json(v);
    if let Ok(local_app_data) = std::env::var("LOCALAPPDATA") {
        let packages_dir = std::path::Path::new(&local_app_data).join("Packages");
        if let Ok(entries) = fs::read_dir(&packages_dir) {
            for entry in entries.flatten() {
                let name = entry.file_name().to_string_lossy().to_lowercase();
                if name.starts_with("crosshairz.gamebarwidget") {
                    let local_state = entry.path().join("LocalState");
                    let _ = fs::create_dir_all(&local_state);
                    let file_path = local_state.join("crosshair.json");
                    if let Ok(pretty) = serde_json::to_string_pretty(&prepared) {
                        let _ = fs::write(file_path, pretty);
                    }
                }
            }
        }
    }
}

/// Идентификатор профиля = имя файла: только безопасные символы.
pub fn sanitize_id(id: &str) -> String {
    id.chars()
        .filter(|c| c.is_ascii_alphanumeric() || *c == '-' || *c == '_')
        .collect()
}
