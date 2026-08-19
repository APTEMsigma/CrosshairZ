//! Глобальные горячие клавиши (tauri-plugin-global-shortcut).

use serde_json::Value;
use std::str::FromStr;
use std::sync::Mutex;

use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut};

use crate::{overlay, MAIN_LABEL};

pub const DEFAULT_TOGGLE_OVERLAY: &str = "F8";
pub const DEFAULT_TOGGLE_SETTINGS: &str = "F9";

#[derive(Clone)]
pub struct Hotkeys {
    pub toggle_overlay: String,
    pub toggle_settings: String,
}

pub fn read_hotkeys(v: &Value) -> Hotkeys {
    Hotkeys {
        toggle_overlay: v
            .pointer("/hotkeys/toggleOverlay")
            .and_then(|x| x.as_str())
            .unwrap_or(DEFAULT_TOGGLE_OVERLAY)
            .to_string(),
        toggle_settings: v
            .pointer("/hotkeys/toggleSettings")
            .and_then(|x| x.as_str())
            .unwrap_or(DEFAULT_TOGGLE_SETTINGS)
            .to_string(),
    }
}

/// Перерегистрация всех хоткеев (вызывается при старте и при изменении настроек).
pub fn apply(app: &AppHandle, hk: &Hotkeys) {
    let gs = app.global_shortcut();
    let _ = gs.unregister_all();
    for combo in [&hk.toggle_overlay, &hk.toggle_settings] {
        if combo.is_empty() {
            continue;
        }
        match Shortcut::from_str(combo) {
            Ok(sc) => {
                if let Err(e) = gs.register(sc) {
                    eprintln!("Не удалось зарегистрировать хоткей «{combo}»: {e:?}");
                }
            }
            Err(e) => eprintln!("Некорректная комбинация «{combo}»: {e:?}"),
        }
    }
}

pub fn handle_shortcut(app: &AppHandle, shortcut: &Shortcut) {
    let hk = app.state::<Mutex<Hotkeys>>().lock().unwrap().clone();

    if let Ok(x) = Shortcut::from_str(&hk.toggle_overlay) {
        if x == *shortcut {
            overlay::toggle_overlay(app);
            return;
        }
    }
    if let Ok(x) = Shortcut::from_str(&hk.toggle_settings) {
        if x == *shortcut {
            if let Some(w) = app.get_webview_window(MAIN_LABEL) {
                if w.is_visible().unwrap_or(false) {
                    let _ = w.hide();
                    let _ = app.emit_to(MAIN_LABEL, "app:visibility", false);
                    crate::trim_memory();
                } else {
                    crate::show_main(app);
                }
            }
        }
    }
}
