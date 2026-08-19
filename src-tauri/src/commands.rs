//! Tauri-команды, доступные фронтенду.

use serde::Serialize;
use serde_json::Value;
use std::fs;
use std::sync::Mutex;
use std::time::{SystemTime, UNIX_EPOCH};
use tauri::{AppHandle, Manager, State};
use tauri_plugin_dialog::{DialogExt, FilePath};

use crate::{hotkeys, overlay, profile, OVERLAY_LABEL};

#[derive(Serialize, Clone)]
pub struct ProfileMeta {
    pub id: String,
    pub name: String,
}

#[derive(Serialize)]
pub struct MonitorInfo {
    pub index: usize,
    pub name: String,
    pub width: u32,
    pub height: u32,
}

fn timestamp() -> u128 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis()
}

fn file_path_to_buf(fp: FilePath) -> Option<std::path::PathBuf> {
    match fp {
        FilePath::Path(p) => Some(p),
        FilePath::Url(u) => u.to_file_path().ok(),
    }
}

/* ================= Настройки ================= */

#[tauri::command]
pub async fn get_state(state: State<'_, Mutex<Value>>) -> Result<Value, String> {
    Ok(state.lock().unwrap().clone())
}

#[tauri::command]
pub async fn save_state(
    app: AppHandle,
    state: State<'_, Mutex<Value>>,
    payload: Value,
) -> Result<(), String> {
    *state.lock().unwrap() = payload.clone();
    profile::save_settings_file(&app, &payload)?;
    overlay::apply_position(&app);

    let hk = hotkeys::read_hotkeys(&payload);
    *app.state::<Mutex<hotkeys::Hotkeys>>().lock().unwrap() = hk.clone();
    hotkeys::apply(&app, &hk);
    Ok(())
}

/* ================= Профили ================= */

fn read_profiles(app: &AppHandle) -> Vec<ProfileMeta> {
    let mut out = Vec::new();
    if let Ok(entries) = fs::read_dir(profile::profiles_dir(app)) {
        let mut files: Vec<_> = entries
            .flatten()
            .filter(|e| e.path().extension().is_some_and(|x| x == "json"))
            .collect();
        files.sort_by_key(|e| e.file_name());
        for e in files {
            let id = e
                .path()
                .file_stem()
                .unwrap_or_default()
                .to_string_lossy()
                .to_string();
            if id.is_empty() {
                continue;
            }
            let name = fs::read_to_string(e.path())
                .ok()
                .and_then(|t| serde_json::from_str::<Value>(&t).ok())
                .and_then(|v| v.get("name").and_then(|n| n.as_str()).map(String::from))
                .unwrap_or_else(|| id.clone());
            out.push(ProfileMeta { id, name });
        }
    }
    out
}

#[tauri::command]
pub async fn list_profiles(app: AppHandle) -> Vec<ProfileMeta> {
    read_profiles(&app)
}

#[tauri::command]
pub async fn load_profile(app: AppHandle, id: String) -> Result<Value, String> {
    let id = profile::sanitize_id(&id);
    if id.is_empty() {
        return Err("Некорректный идентификатор профиля".into());
    }
    let path = profile::profiles_dir(&app).join(format!("{id}.json"));
    let text = fs::read_to_string(path).map_err(|e| format!("Профиль не найден: {e}"))?;
    serde_json::from_str(&text).map_err(|e| format!("Повреждённый профиль: {e}"))
}

fn save_profile_inner(
    app: &AppHandle,
    id: Option<String>,
    name: String,
    mut data: Value,
) -> Result<ProfileMeta, String> {
    if name.is_empty() {
        return Err("Имя профиля не может быть пустым".into());
    }
    let file_id = match id {
        Some(i) if !profile::sanitize_id(&i).is_empty() => profile::sanitize_id(&i),
        _ => format!("{}_{}", profile::sanitize_id(&name), timestamp()),
    };
    if let Some(obj) = data.as_object_mut() {
        obj.insert("name".into(), Value::String(name.clone()));
    }
    let path = profile::profiles_dir(app).join(format!("{file_id}.json"));
    let pretty = serde_json::to_string_pretty(&data).map_err(|e| e.to_string())?;
    fs::write(path, pretty).map_err(|e| format!("Не удалось записать профиль: {e}"))?;
    Ok(ProfileMeta { id: file_id, name })
}

#[tauri::command]
pub async fn save_profile(
    app: AppHandle,
    id: Option<String>,
    name: String,
    data: Value,
) -> Result<ProfileMeta, String> {
    save_profile_inner(&app, id, name.trim().to_string(), data)
}

#[tauri::command]
pub async fn delete_profile(
    app: AppHandle,
    state: State<'_, Mutex<Value>>,
    id: String,
) -> Result<(), String> {
    let id = profile::sanitize_id(&id);
    let path = profile::profiles_dir(&app).join(format!("{id}.json"));
    fs::remove_file(path).map_err(|e| format!("Не удалось удалить профиль: {e}"))?;

    // Если удалили активный профиль — сбрасываем ссылку
    let mut v = state.lock().unwrap();
    if v.get("profile").and_then(|p| p.as_str()) == Some(id.as_str()) {
        if let Some(obj) = v.as_object_mut() {
            obj.insert("profile".into(), Value::String("default".into()));
        }
        let snapshot = v.clone();
        drop(v);
        let _ = profile::save_settings_file(&app, &snapshot);
    }
    Ok(())
}

#[tauri::command]
pub async fn rename_profile(app: AppHandle, id: String, name: String) -> Result<ProfileMeta, String> {
    let id = profile::sanitize_id(&id);
    let name = name.trim().to_string();
    if name.is_empty() {
        return Err("Имя не может быть пустым".into());
    }
    let path = profile::profiles_dir(&app).join(format!("{id}.json"));
    let text = fs::read_to_string(&path).map_err(|e| format!("Профиль не найден: {e}"))?;
    let mut doc: Value = serde_json::from_str(&text).map_err(|e| e.to_string())?;
    if let Some(obj) = doc.as_object_mut() {
        obj.insert("name".into(), Value::String(name.clone()));
    }
    let pretty = serde_json::to_string_pretty(&doc).map_err(|e| e.to_string())?;
    fs::write(&path, pretty).map_err(|e| e.to_string())?;
    Ok(ProfileMeta { id, name })
}

#[tauri::command]
pub async fn import_profile(app: AppHandle) -> Result<ProfileMeta, String> {
    let picked = app
        .dialog()
        .file()
        .add_filter("Профиль CrosshairZ", &["json"])
        .blocking_pick_file();
    let path = file_path_to_buf(picked.ok_or("Файл не выбран")?).ok_or("Некорректный путь")?;
    let text = fs::read_to_string(path).map_err(|e| format!("Не удалось прочитать файл: {e}"))?;
    let doc: Value =
        serde_json::from_str(&text).map_err(|_| "Файл не является корректным профилем")?;
    if doc.get("crosshair").is_none() {
        return Err("В файле нет настроек прицела".into());
    }
    let name = doc
        .get("name")
        .and_then(|n| n.as_str())
        .unwrap_or("Импортированный")
        .to_string();
    save_profile_inner(&app, None, name, doc)
}

#[tauri::command]
pub async fn export_profile(app: AppHandle, id: String) -> Result<(), String> {
    let id = profile::sanitize_id(&id);
    let src = profile::profiles_dir(&app).join(format!("{id}.json"));
    let text = fs::read_to_string(src).map_err(|e| format!("Профиль не найден: {e}"))?;
    let picked = app
        .dialog()
        .file()
        .add_filter("JSON", &["json"])
        .set_file_name(format!("{id}.json"))
        .blocking_save_file();
    let dst = file_path_to_buf(picked.ok_or("Сохранение отменено")?).ok_or("Некорректный путь")?;
    fs::write(dst, text).map_err(|e| format!("Не удалось записать файл: {e}"))
}

/* ================= Изображения ================= */

#[tauri::command]
pub async fn import_image(app: AppHandle) -> Result<String, String> {
    let picked = app
        .dialog()
        .file()
        .add_filter("Изображения", &["png", "svg", "gif", "jpg", "jpeg", "webp", "bmp"])
        .blocking_pick_file();
    let path = file_path_to_buf(picked.ok_or("Файл не выбран")?).ok_or("Некорректный путь")?;
    let ext = path
        .extension()
        .map(|e| e.to_string_lossy().to_lowercase())
        .unwrap_or_else(|| "png".into());
    let dst = profile::images_dir(&app).join(format!("img_{}.{}", timestamp(), ext));
    fs::copy(&path, &dst).map_err(|e| format!("Не удалось скопировать файл: {e}"))?;
    Ok(dst.to_string_lossy().to_string())
}

/* ================= Мониторы ================= */

#[tauri::command]
pub async fn list_monitors(app: AppHandle) -> Vec<MonitorInfo> {
    let Some(win) = app.get_webview_window(OVERLAY_LABEL) else {
        return vec![];
    };
    win.available_monitors()
        .unwrap_or_default()
        .iter()
        .enumerate()
        .map(|(i, m)| MonitorInfo {
            index: i,
            name: m.name().cloned().unwrap_or_else(|| format!("Монитор {}", i + 1)),
            width: m.size().width,
            height: m.size().height,
        })
        .collect()
}

/* ================= Автозапуск ================= */

#[tauri::command]
pub async fn get_autostart() -> Result<bool, String> {
    use winreg::enums::HKEY_CURRENT_USER;
    use winreg::RegKey;
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    let run = hkcu
        .open_subkey("Software\\Microsoft\\Windows\\CurrentVersion\\Run")
        .map_err(|e| e.to_string())?;
    Ok(run.get_value::<String, _>("CrosshairZ").is_ok())
}

#[tauri::command]
pub async fn set_autostart(enabled: bool) -> Result<(), String> {
    use winreg::enums::HKEY_CURRENT_USER;
    use winreg::RegKey;
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    let (run, _) = hkcu
        .create_subkey("Software\\Microsoft\\Windows\\CurrentVersion\\Run")
        .map_err(|e| e.to_string())?;
    if enabled {
        let exe = std::env::current_exe().map_err(|e| e.to_string())?;
        run.set_value("CrosshairZ", &exe.to_string_lossy().to_string())
            .map_err(|e| e.to_string())?;
    } else {
        let _ = run.delete_value("CrosshairZ");
    }
    Ok(())
}

/* ================= Game Bar ================= */

#[tauri::command]
pub async fn get_gamebar_status() -> Result<bool, String> {
    let output = std::process::Command::new("powershell")
        .args(&[
            "-NoProfile",
            "-Command",
            "Get-AppxPackage -Name '*CrosshairZ*' | Select-Object -ExpandProperty PackageFullName",
        ])
        .output()
        .map_err(|e| e.to_string())?;

    let text = String::from_utf8_lossy(&output.stdout);
    Ok(!text.trim().is_empty())
}

pub fn find_manifest_path() -> Option<std::path::PathBuf> {
    if let Ok(exe) = std::env::current_exe() {
        if let Some(parent) = exe.parent() {
            let candidate = parent.join("gamebar-widget").join("AppxManifest.xml");
            if candidate.exists() {
                return Some(candidate);
            }
            if let Some(p) = parent.parent() {
                let c2 = p.join("gamebar-widget").join("AppxManifest.xml");
                if c2.exists() {
                    return Some(c2);
                }
            }
        }
    }

    if let Ok(cwd) = std::env::current_dir() {
        let candidate = cwd.join("gamebar-widget").join("AppxManifest.xml");
        if candidate.exists() {
            return Some(candidate);
        }
    }

    None
}

#[tauri::command]
pub async fn install_gamebar_widget() -> Result<String, String> {
    let manifest = find_manifest_path().ok_or_else(|| {
        "Файл gamebar-widget/AppxManifest.xml не найден рядом с приложением.".to_string()
    })?;

    let manifest_path_str = manifest.to_string_lossy();
    let cmd_str = format!(
        "$pkg = Get-AppxPackage -Name '*CrosshairZ*'; \
         if ($pkg) {{ Remove-AppxPackage $pkg.PackageFullName -ErrorAction SilentlyContinue }}; \
         Add-AppxPackage -Register '{manifest_path_str}' -ForceApplicationShutdown; \
         $newPkg = Get-AppxPackage -Name '*CrosshairZ*'; \
         if ($newPkg) {{ & CheckNetIsolation.exe LoopbackExempt -a \"-n=$($newPkg.PackageFamilyName)\" -ErrorAction SilentlyContinue }}; \
         Get-Process -Name '*GameBar*','*XboxGamingOverlay*' -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue"
    );

    let output = std::process::Command::new("powershell")
        .args(&["-NoProfile", "-Command", &cmd_str])
        .output()
        .map_err(|e| format!("Ошибка выполнения PowerShell: {e}"))?;

    // Проверяем факт успешной регистрации пакета
    let check = std::process::Command::new("powershell")
        .args(&[
            "-NoProfile",
            "-Command",
            "Get-AppxPackage -Name '*CrosshairZ*' | Select-Object -ExpandProperty PackageFullName",
        ])
        .output();

    if let Ok(ch) = check {
        let text = String::from_utf8_lossy(&ch.stdout);
        if !text.trim().is_empty() {
            return Ok("Виджет успешно установлен и зарегистрирован в Game Bar!".into());
        }
    }

    let err = String::from_utf8_lossy(&output.stderr);
    if !err.trim().is_empty() {
        return Err(format!("Не удалось установить виджет: {err}"));
    }

    Ok("Виджет успешно установлен и зарегистрирован в Game Bar!".into())
}

#[tauri::command]
pub async fn sync_gamebar_widget(
    _app: AppHandle,
    state: State<'_, Mutex<Value>>,
) -> Result<(), String> {
    let v = state.lock().unwrap().clone();
    profile::sync_gamebar_settings(&v);
    Ok(())
}

#[tauri::command]
pub async fn uninstall_gamebar_widget() -> Result<(), String> {
    let cmd_str = "Get-AppxPackage -Name '*CrosshairZ*' | Remove-AppxPackage -ErrorAction SilentlyContinue; Get-Process -Name '*GameBar*','*XboxGamingOverlay*' -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue";
    let _ = std::process::Command::new("powershell")
        .args(&["-NoProfile", "-Command", cmd_str])
        .output();
    Ok(())
}

#[tauri::command]
pub async fn open_gamebar() -> Result<(), String> {
    let _ = std::process::Command::new("powershell")
        .args(&["-NoProfile", "-Command", "Start-Process 'explorer.exe' 'ms-gamebarwidget:'"])
        .spawn();
    Ok(())
}
