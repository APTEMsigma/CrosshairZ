import { useEffect, useState } from "react";
import { Card, NumberField, Select, Slider } from "../components/ui";
import { useSettings } from "../store/settings";
import { MonitorInfo, tauriApi } from "../lib/tauri";
import { getTranslation } from "../lib/i18n";
import { IconWarning } from "../components/icons";

export function SizePanel() {
  const settings = useSettings((s) => s.settings);
  const update = useSettings((s) => s.update);
  const c = settings.crosshair;
  const lang = settings.ui.language ?? "ru";
  const t = getTranslation(lang);

  const [monitors, setMonitors] = useState<MonitorInfo[]>([
    { index: 0, name: t.monitorPrimary, width: 0, height: 0 },
  ]);

  useEffect(() => {
    tauriApi
      .listMonitors()
      .then((list) => {
        if (list.length > 0) setMonitors(list);
      })
      .catch(() => undefined);
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <Card title={t.geometryCardTitle}>
        <Slider
          label={t.thicknessLabel}
          unit=" px"
          min={0.5}
          max={40}
          step={0.5}
          decimals={1}
          value={c.thickness}
          onChange={(v) => update((d) => void (d.crosshair.thickness = v))}
        />
        <Slider
          label={t.gapLabel}
          unit=" px"
          min={0}
          max={80}
          step={0.5}
          decimals={1}
          value={c.gap}
          onChange={(v) => update((d) => void (d.crosshair.gap = v))}
        />
        <Slider
          label={t.lengthLabel}
          unit=" px"
          min={0.5}
          max={150}
          step={0.5}
          decimals={1}
          value={c.length}
          onChange={(v) => update((d) => void (d.crosshair.length = v))}
        />
        <Slider
          label={t.sizeLabel}
          unit=" px"
          min={1}
          max={200}
          step={0.5}
          decimals={1}
          value={c.size}
          onChange={(v) => update((d) => void (d.crosshair.size = v))}
        />
        <div className="hint" style={{ marginTop: -2, marginBottom: 6, paddingLeft: 132 }}>
          {t.sizeHint}
        </div>
        <Slider
          label={t.roundnessLabel}
          unit=" %"
          min={0}
          max={100}
          step={1}
          decimals={0}
          value={c.roundness}
          onChange={(v) => update((d) => void (d.crosshair.roundness = v))}
        />
      </Card>

      <Card title={t.screenPosCardTitle}>
        <NumberField
          label={t.offsetXLabel}
          min={-2000}
          max={2000}
          step={1}
          value={settings.position.offsetX}
          onChange={(v) => update((d) => void (d.position.offsetX = Math.round(v)))}
        />
        <NumberField
          label={t.offsetYLabel}
          min={-2000}
          max={2000}
          step={1}
          value={settings.position.offsetY}
          onChange={(v) => update((d) => void (d.position.offsetY = Math.round(v)))}
        />
        <Select<number>
          label={t.monitorLabel}
          value={settings.position.monitor}
          options={monitors.map((m) => ({
            value: m.index,
            label:
              m.width > 0
                ? `${m.name} (${m.width}×${m.height})`
                : m.name,
          }))}
          onChange={(v) => update((d) => void (d.position.monitor = v))}
        />
        <div className="hint" style={{ marginTop: 4 }}>
          {t.positionHint}
        </div>
      </Card>

      <div className="hint-warning">
        <IconWarning style={{ width: 16, height: 16, flexShrink: 0, marginTop: 1 }} />
        <span>{t.borderlessWarning}</span>
      </div>
    </div>
  );
}
