import { HotkeyCapture } from "../components/HotkeyCapture";
import { Card } from "../components/ui";
import { useSettings } from "../store/settings";
import { getTranslation } from "../lib/i18n";

export function HotkeysPanel() {
  const settings = useSettings((s) => s.settings);
  const update = useSettings((s) => s.update);
  const lang = settings.ui.language ?? "ru";
  const t = getTranslation(lang);

  return (
    <div className="flex flex-col gap-4">
      {/* Hotkeys settings */}
      <Card title={t.hotkeysCardTitle}>
        <div className="setting-row">
          <div className="setting-label" style={{ flex: 1 }}>{t.toggleOverlayLabel}</div>
          <HotkeyCapture
            value={settings.hotkeys.toggleOverlay}
            language={lang}
            onChange={(combo) => update((d) => void (d.hotkeys.toggleOverlay = combo))}
          />
        </div>
        <div className="setting-row">
          <div className="setting-label" style={{ flex: 1 }}>{t.toggleSettingsLabel}</div>
          <HotkeyCapture
            value={settings.hotkeys.toggleSettings}
            language={lang}
            onChange={(combo) => update((d) => void (d.hotkeys.toggleSettings = combo))}
          />
        </div>
      </Card>

      <Card title={t.hotkeyHintsTitle}>
        <div className="hint">
          {t.hotkeyHint1}
        </div>
        <div className="hint" style={{ marginTop: 8 }}>
          {t.hotkeyHint2}
        </div>
      </Card>
    </div>
  );
}
