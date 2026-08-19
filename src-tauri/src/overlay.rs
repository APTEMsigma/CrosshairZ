//! Движок окна-оверлея: click-through, topmost, позиционирование.

use std::sync::Mutex;
use std::time::Duration;

use raw_window_handle::{HasWindowHandle, RawWindowHandle};
use serde_json::Value;
use tauri::{AppHandle, Manager, PhysicalPosition, PhysicalSize, WebviewWindow};
use windows::Win32::Foundation::HWND;
use windows::Win32::UI::WindowsAndMessaging::{
    GetWindowLongPtrW, SetWindowLongPtrW, SetWindowPos, GWL_EXSTYLE, HWND_TOPMOST,
    SWP_NOACTIVATE, SWP_NOMOVE, SWP_NOSIZE, WS_EX_LAYERED, WS_EX_NOACTIVATE, WS_EX_TOOLWINDOW,
    WS_EX_TRANSPARENT,
};

use crate::OVERLAY_LABEL;

/// Физический размер окна оверлея (px). Совпадает с viewBox рендерера,
/// поэтому 1 единица геометрии прицела = 1 физический пиксель экрана.
pub const OVERLAY_PHYSICAL: u32 = 640;

fn hwnd_of(win: &WebviewWindow) -> Option<HWND> {
    match win.window_handle().ok()?.as_raw() {
        RawWindowHandle::Win32(h) => Some(HWND(h.hwnd.get() as *mut core::ffi::c_void)),
        _ => None,
    }
}

fn raise_topmost(win: &WebviewWindow) {
    if let Some(h) = hwnd_of(win) {
        unsafe {
            let _ = SetWindowPos(
                h,
                Some(HWND_TOPMOST),
                0,
                0,
                0,
                0,
                SWP_NOMOVE | SWP_NOSIZE | SWP_NOACTIVATE,
            );
        }
    }
}

/// Классические стили оверлея: клики проходят сквозь окно в игру,
/// окно не активируется, не видно в Alt-Tab и всегда поверх.
pub fn init_overlay_window(win: &WebviewWindow) {
    let _ = win.set_ignore_cursor_events(true);
    if let Some(h) = hwnd_of(win) {
        unsafe {
            let style = GetWindowLongPtrW(h, GWL_EXSTYLE);
            let style = style
                | WS_EX_LAYERED.0 as isize
                | WS_EX_TRANSPARENT.0 as isize
                | WS_EX_TOOLWINDOW.0 as isize
                | WS_EX_NOACTIVATE.0 as isize;
            SetWindowLongPtrW(h, GWL_EXSTYLE, style);
        }
    }
    // Точный физический размер независимо от DPI-масштабирования
    let _ = win.set_size(PhysicalSize::new(OVERLAY_PHYSICAL, OVERLAY_PHYSICAL));
    raise_topmost(win);
}

pub fn read_position(v: &Value) -> (i32, i32, usize) {
    let ox = v.pointer("/position/offsetX").and_then(|x| x.as_i64()).unwrap_or(0) as i32;
    let oy = v.pointer("/position/offsetY").and_then(|x| x.as_i64()).unwrap_or(0) as i32;
    let m = v.pointer("/position/monitor").and_then(|x| x.as_u64()).unwrap_or(0) as usize;
    (ox, oy, m)
}

/// Центрирование окна оверлея на выбранном мониторе + смещение в физических px.
pub fn apply_position(app: &AppHandle) {
    let Some(win) = app.get_webview_window(OVERLAY_LABEL) else {
        return;
    };
    let (ox, oy, mon_idx) = {
        let state = app.state::<Mutex<Value>>();
        let v = state.lock().unwrap();
        read_position(&v)
    };

    let monitors = win.available_monitors().unwrap_or_default();
    let (mp, ms) = monitors
        .get(mon_idx)
        .map(|m| (*m.position(), *m.size()))
        .unwrap_or((PhysicalPosition::new(0, 0), PhysicalSize::new(1920, 1080)));

    let win_w = OVERLAY_PHYSICAL as i32;
    let win_h = OVERLAY_PHYSICAL as i32;
    let _ = win.set_size(PhysicalSize::new(OVERLAY_PHYSICAL, OVERLAY_PHYSICAL));

    let x = mp.x + (ms.width as i32 - win_w) / 2 + ox;
    let y = mp.y + (ms.height as i32 - win_h) / 2 + oy;
    let _ = win.set_position(PhysicalPosition::new(x, y));
}

/// Периодически подтверждаем topmost: некоторые игры поднимают себя поверх.
pub fn spawn_topmost_keeper(app: AppHandle) {
    std::thread::spawn(move || loop {
        std::thread::sleep(Duration::from_millis(1500));
        if let Some(win) = app.get_webview_window(OVERLAY_LABEL) {
            if win.is_visible().unwrap_or(false) {
                raise_topmost(&win);
            }
        }
    });
}

pub fn toggle_overlay(app: &AppHandle) {
    if let Some(win) = app.get_webview_window(OVERLAY_LABEL) {
        if win.is_visible().unwrap_or(false) {
            let _ = win.hide();
        } else {
            let _ = win.show();
            raise_topmost(&win);
        }
    }
}
