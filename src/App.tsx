import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { Preview } from "./components/Preview";
import { Tabs } from "./components/ui";
import { AccentColorPicker } from "./components/ColorPicker";
import { ShapePanel } from "./panels/ShapePanel";
import { SizePanel } from "./panels/SizePanel";
import { ColorPanel } from "./panels/ColorPanel";
import { ImagePanel } from "./panels/ImagePanel";
import { HotkeysPanel } from "./panels/HotkeysPanel";
import { ProfilesPanel } from "./panels/ProfilesPanel";
import { GameBarPanel } from "./panels/GameBarPanel";
import { useSettings } from "./store/settings";
import { applyAccentToDom } from "./lib/theme";
import { getTranslation } from "./lib/i18n";
import { tauriApi } from "./lib/tauri";
import {
  IconCrosshair,
  IconGlobe,
  IconTabColor,
  IconTabHotkeys,
  IconTabImage,
  IconTabProfiles,
  IconTabShape,
  IconTabSize,
  IconTabGameBar,
} from "./components/icons";

export default function App() {
  const settings = useSettings((s) => s.settings);
  const loaded = useSettings((s) => s.loaded);
  const update = useSettings((s) => s.update);
  const hydrate = useSettings((s) => s.hydrate);
  const [tab, setTab] = useState("shape");
  const [autostart, setAutostart] = useState(false);
  const [isWindowVisible, setIsWindowVisible] = useState(true);

  const lang = settings.ui.language ?? "ru";
  const accent = settings.ui.accentColor ?? "#4c8dff";
  const t = getTranslation(lang);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    document.documentElement.dataset.theme = "glass";
  }, []);

  useEffect(() => {
    applyAccentToDom(accent);
  }, [accent]);

  useEffect(() => {
    tauriApi.getAutostart().then(setAutostart).catch(() => undefined);
  }, []);

  useEffect(() => {
    const unlisten = listen<boolean>("app:visibility", (event) => {
      setIsWindowVisible(event.payload);
    });
    return () => {
      unlisten.then((f) => f()).catch(() => undefined);
    };
  }, []);

  const toggleAutostart = async () => {
    try {
      const next = !autostart;
      await tauriApi.setAutostart(next);
      setAutostart(next);
    } catch (e) {
      console.error("Autostart toggle failed:", e);
    }
  };

  // When hidden in tray, unmount and stop all DOM/React rendering completely
  if (!isWindowVisible) {
    return null;
  }

  if (!loaded) {
    return (
      <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "var(--text-tertiary)", fontSize: 13 }}>Loading CrosshairZ…</div>
      </div>
    );
  }

  const tabItems = [
    { id: "shape", label: t.tabShape, icon: <IconTabShape /> },
    { id: "size", label: t.tabSize, icon: <IconTabSize /> },
    { id: "color", label: t.tabColor, icon: <IconTabColor /> },
    { id: "image", label: t.tabImage, icon: <IconTabImage /> },
    { id: "hotkeys", label: t.tabHotkeys, icon: <IconTabHotkeys /> },
    { id: "profiles", label: t.tabProfiles, icon: <IconTabProfiles /> },
    { id: "gamebar", label: t.tabGameBar, icon: <IconTabGameBar /> },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="app-header">
        <div className="brand-badge">
          <div className="brand-icon-box">
            <IconCrosshair style={{ width: 18, height: 18 }} />
          </div>
          <div>
            <div className="app-logo">CrosshairZ</div>
          </div>
          <div className="app-subtitle">{t.appSubtitle}</div>
        </div>

        <div className="header-actions">
          {/* Autostart button */}
          <button
            type="button"
            className="icon-action-btn"
            data-active={autostart}
            title={t.autostartLabel}
            onClick={toggleAutostart}
          >
            <svg
              style={{ width: 14, height: 14 }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
              <line x1="12" y1="2" x2="12" y2="12" />
            </svg>
            <span style={{ fontSize: 11.5 }}>{t.autostartBtn}</span>
          </button>

          {/* Accent Color Palette Picker */}
          <AccentColorPicker
            value={accent}
            language={lang}
            onChange={(hex) => update((d) => void (d.ui.accentColor = hex))}
          />

          {/* Language Switcher */}
          <button
            type="button"
            className="icon-action-btn"
            title={t.languageSelect}
            onClick={() => update((d) => void (d.ui.language = lang === "ru" ? "en" : "ru"))}
          >
            <IconGlobe style={{ width: 14, height: 14 }} />
            <span style={{ fontWeight: 700, fontSize: 11 }}>{lang.toUpperCase()}</span>
          </button>
        </div>
      </header>

      {/* Main workspace */}
      <main className="flex gap-4 flex-1 min-h-0" style={{ padding: "14px 18px 18px" }}>
        {/* Left column: Live Crosshair Preview & Canvas background controls */}
        <section className="card flex-1 min-w-0 p-4 flex flex-col gap-2">
          <Preview />
        </section>

        {/* Right column: Settings Panels */}
        <section className="card flex flex-col min-h-0" style={{ width: 440, flex: "none", padding: 14 }}>
          <Tabs items={tabItems} active={tab} onChange={setTab} />
          <div className="flex-1 overflow-y-auto" style={{ marginTop: 14, paddingRight: 4 }}>
            {tab === "shape" && <ShapePanel />}
            {tab === "size" && <SizePanel />}
            {tab === "color" && <ColorPanel />}
            {tab === "image" && <ImagePanel />}
            {tab === "hotkeys" && <HotkeysPanel />}
            {tab === "profiles" && <ProfilesPanel />}
            {tab === "gamebar" && <GameBarPanel />}
          </div>
        </section>
      </main>
    </div>
  );
}
