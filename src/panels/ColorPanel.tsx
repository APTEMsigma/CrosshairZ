import { ColorField } from "../components/ColorPicker";
import { Card, Slider, Switch } from "../components/ui";
import { useSettings } from "../store/settings";
import { getTranslation } from "../lib/i18n";

export function ColorPanel() {
  const settings = useSettings((s) => s.settings);
  const update = useSettings((s) => s.update);
  const c = settings.crosshair;
  const lang = settings.ui.language ?? "ru";
  const t = getTranslation(lang);

  return (
    <div className="flex flex-col gap-4">
      <Card title={t.linesCardTitle}>
        <ColorField
          label={t.lineColorLabel}
          value={c.color}
          onChange={(hex) => update((d) => void (d.crosshair.color = hex))}
        />
        <Slider
          label={t.opacityLabel}
          min={0.05}
          max={1}
          step={0.05}
          decimals={2}
          value={c.opacity}
          onChange={(v) => update((d) => void (d.crosshair.opacity = v))}
        />
      </Card>

      <Card title={t.outlineCardTitle}>
        <Switch
          label={t.enableOutline}
          checked={c.outline.enabled}
          onChange={(v) => update((d) => void (d.crosshair.outline.enabled = v))}
        />
        <div style={c.outline.enabled ? undefined : { opacity: 0.4, pointerEvents: "none" }}>
          <Slider
            label={t.outlineThicknessLabel}
            unit=" px"
            min={0.2}
            max={12}
            step={0.2}
            decimals={1}
            value={c.outline.thickness}
            onChange={(v) => update((d) => void (d.crosshair.outline.thickness = v))}
          />
          <ColorField
            label={t.outlineColorLabel}
            value={c.outline.color}
            onChange={(hex) => update((d) => void (d.crosshair.outline.color = hex))}
          />
          <Slider
            label={t.outlineOpacityLabel}
            min={0.05}
            max={1}
            step={0.05}
            decimals={2}
            value={c.outline.opacity}
            onChange={(v) => update((d) => void (d.crosshair.outline.opacity = v))}
          />
        </div>
      </Card>

      <Card title={t.centerDotColorCardTitle}>
        <div style={c.centerDot.enabled ? undefined : { opacity: 0.4, pointerEvents: "none" }}>
          <ColorField
            label={t.dotColorLabel}
            value={c.centerDot.color}
            onChange={(hex) => update((d) => void (d.crosshair.centerDot.color = hex))}
          />
        </div>
        {!c.centerDot.enabled && (
          <div className="hint">{t.dotDisabledHint}</div>
        )}
      </Card>
    </div>
  );
}
