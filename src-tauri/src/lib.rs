//! CrosshairZ — настраиваемый оверлей-прицел для игр (Windows).

mod commands;
mod hotkeys;
mod overlay;
mod profile;

use std::sync::Mutex;

use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    Emitter, Manager,
};
use tauri_plugin_global_shortcut::{Builder as ShortcutBuilder, ShortcutState};

pub const MAIN_LABEL: &str = "main";
pub const OVERLAY_LABEL: &str = "overlay";

pub fn trim_memory() {
    unsafe {
        use windows::Win32::System::Threading::{GetCurrentProcess, SetProcessWorkingSetSize};
        let _ = SetProcessWorkingSetSize(GetCurrentProcess(), usize::MAX, usize::MAX);
    }
}

pub fn show_main(app: &tauri::AppHandle) {
    if let Some(w) = app.get_webview_window(MAIN_LABEL) {
        let _ = w.show();
        let _ = w.unminimize();
        let _ = w.set_focus();
        let _ = app.emit_to(MAIN_LABEL, "app:visibility", true);
    }
}

fn spawn_gamebar_http_server(app: tauri::AppHandle) {
    std::thread::spawn(move || {
        use std::io::{Read, Write};
        use std::net::TcpListener;
        use std::time::Duration;
        let listener = match TcpListener::bind("127.0.0.1:23851") {
            Ok(l) => l,
            Err(_) => return,
        };
        for stream in listener.incoming().flatten() {
            let app_handle = app.clone();
            std::thread::spawn(move || {
                let _ = stream.set_read_timeout(Some(Duration::from_millis(150)));
                let _ = stream.set_write_timeout(Some(Duration::from_millis(150)));
                let mut stream = stream;
                let mut buf = [0u8; 1024];
                let _ = stream.read(&mut buf);

                let json_str = {
                    if let Some(state) = app_handle.try_state::<Mutex<serde_json::Value>>() {
                        let v = state.lock().unwrap();
                        let prepared = profile::prepare_gamebar_json(&*v);
                        serde_json::to_string(&prepared).unwrap_or_default()
                    } else {
                        "{}".to_string()
                    }
                };

                let response = format!(
                    "HTTP/1.1 200 OK\r\n\
                     Content-Type: application/json; charset=utf-8\r\n\
                     Access-Control-Allow-Origin: *\r\n\
                     Access-Control-Allow-Methods: GET, OPTIONS\r\n\
                     Access-Control-Allow-Headers: *\r\n\
                     Content-Length: {}\r\n\
                     Connection: close\r\n\r\n\
                     {}",
                    json_str.len(),
                    json_str
                );
                let _ = stream.write_all(response.as_bytes());
                let _ = stream.flush();
                let _ = stream.shutdown(std::net::Shutdown::Both);
            });
        }
    });
}

fn auto_ensure_gamebar_registration(app: tauri::AppHandle) {
    std::thread::spawn(move || {
        if let Some(manifest) = commands::find_manifest_path() {
            let manifest_dir = manifest.parent().unwrap_or(&manifest).to_string_lossy().to_string();
            let manifest_path_str = manifest.to_string_lossy().to_string();
            let ps_script = format!(
                "$pkg = Get-AppxPackage -Name '*CrosshairZ*'; \
                 if ($pkg) {{ \
                     $loc = $pkg.InstallLocation; \
                     $targetDir = '{manifest_dir}'; \
                     if ($loc -and (Resolve-Path $loc).Path -ne (Resolve-Path $targetDir).Path) {{ \
                         Remove-AppxPackage $pkg.PackageFullName -ErrorAction SilentlyContinue; \
                         Add-AppxPackage -Register '{manifest_path_str}' -ForceApplicationShutdown; \
                         $newPkg = Get-AppxPackage -Name '*CrosshairZ*'; \
                         if ($newPkg) {{ & CheckNetIsolation.exe LoopbackExempt -a \"-n=$($newPkg.PackageFamilyName)\" -ErrorAction SilentlyContinue }}; \
                         Get-Process -Name '*GameBar*','*XboxGamingOverlay*' -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue; \
                     }} else {{ \
                         & CheckNetIsolation.exe LoopbackExempt -a \"-n=$($pkg.PackageFamilyName)\" -ErrorAction SilentlyContinue; \
                     }} \
                 }}",
                manifest_dir = manifest_dir.replace("'", "''"),
                manifest_path_str = manifest_path_str.replace("'", "''")
            );
            let _ = std::process::Command::new("powershell")
                .args(&["-NoProfile", "-Command", &ps_script])
                .output();

            if let Some(state) = app.try_state::<Mutex<serde_json::Value>>() {
                if let Ok(v) = state.lock() {
                    profile::sync_gamebar_settings(&*v);
                }
            }
        }
    });
}

fn build_tray(app: &tauri::App) -> tauri::Result<()> {
    let lang = {
        if let Some(state) = app.try_state::<Mutex<serde_json::Value>>() {
            if let Ok(v) = state.lock() {
                v.get("ui")
                    .and_then(|u| u.get("language"))
                    .and_then(|l| l.as_str())
                    .unwrap_or("ru")
                    .to_string()
            } else {
                "ru".to_string()
            }
        } else {
            "ru".to_string()
        }
    };
    let (t_overlay, t_settings, t_quit) = if lang == "en" {
        ("Toggle Crosshair", "Settings", "Exit")
    } else {
        ("Показать/скрыть прицел", "Настройки", "Выход")
    };

    let toggle_overlay =
        MenuItem::with_id(app, "toggle_overlay", t_overlay, true, None::<&str>)?;
    let toggle_settings = MenuItem::with_id(app, "toggle_settings", t_settings, true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", t_quit, true, None::<&str>)?;
    let menu = Menu::with_items(app, &[&toggle_overlay, &toggle_settings, &quit])?;

    TrayIconBuilder::with_id("tray")
        .icon(app.default_window_icon().expect("нет иконки приложения").clone())
        .tooltip("CrosshairZ")
        .menu(&menu)
        .show_menu_on_left_click(true)
        .on_menu_event(|app, event| match event.id.as_ref() {
            "toggle_overlay" => overlay::toggle_overlay(app),
            "toggle_settings" => show_main(app),
            "quit" => app.exit(0),
            _ => {}
        })
        .build(app)?;
    Ok(())
}

pub fn run() {
    // Оптимизация памяти: объединение рендереров окон в один процесс и отключение лишних служб
    std::env::set_var(
        "WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS",
        "--renderer-process-limit=1 \
         --process-per-site \
         --disable-gpu-shader-disk-cache \
         --disable-background-networking \
         --disable-component-update \
         --disable-features=TranslateUI,Autofill,MediaRouter \
         --no-pings \
         --no-first-run",
    );

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            ShortcutBuilder::new()
                .with_handler(|app, shortcut, event| {
                    if event.state == ShortcutState::Pressed {
                        hotkeys::handle_shortcut(app, shortcut);
                    }
                })
                .build(),
        )
        .setup(|app| {
            let handle = app.handle().clone();

            // Настройки
            let settings = profile::load_settings(&handle);
            profile::sync_gamebar_settings(&settings);
            app.manage(Mutex::new(settings.clone()));

            // HTTP-сервер синхронизации для Game Bar виджета (порт 23851)
            spawn_gamebar_http_server(handle.clone());

            // Автоматическая проверка пути виджета Game Bar и сетевой изоляции
            auto_ensure_gamebar_registration(handle.clone());

            // Горячие клавиши
            let hk = hotkeys::read_hotkeys(&settings);
            app.manage(Mutex::new(hk.clone()));
            hotkeys::apply(&handle, &hk);

            // Окно оверлея: Win32-стили, физический размер, позиция
            if let Some(ov) = app.get_webview_window(OVERLAY_LABEL) {
                overlay::init_overlay_window(&ov);
            }
            overlay::apply_position(&handle);
            overlay::spawn_topmost_keeper(handle.clone());

            // Крестик в главном окне скрывает его в трей, а не закрывает приложение
            if let Some(main) = app.get_webview_window(MAIN_LABEL) {
                let h = handle.clone();
                main.on_window_event(move |event| {
                    if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                        api.prevent_close();
                        if let Some(w) = h.get_webview_window(MAIN_LABEL) {
                            let _ = w.hide();
                            let _ = h.emit_to(MAIN_LABEL, "app:visibility", false);
                            trim_memory();
                        }
                    }
                });
            }

            // Фоновый сброс начальных буферов инициализации
            std::thread::spawn(|| {
                std::thread::sleep(std::time::Duration::from_millis(2000));
                trim_memory();
            });

            build_tray(app)?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_state,
            commands::save_state,
            commands::list_profiles,
            commands::load_profile,
            commands::save_profile,
            commands::delete_profile,
            commands::rename_profile,
            commands::import_profile,
            commands::export_profile,
            commands::import_image,
            commands::list_monitors,
            commands::get_autostart,
            commands::set_autostart,
            commands::get_gamebar_status,
            commands::install_gamebar_widget,
            commands::sync_gamebar_widget,
            commands::uninstall_gamebar_widget,
            commands::open_gamebar,
        ])
        .run(tauri::generate_context!())
        .expect("ошибка запуска tauri");
}
