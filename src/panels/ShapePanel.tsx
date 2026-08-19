import { Crosshair } from "../components/Crosshair";
import { Card, Select, Slider, Switch } from "../components/ui";
import { useSettings } from "../store/settings";
import { CrosshairConfig, CrosshairShape, DEFAULT_CROSSHAIR, SHAPE_LIST } from "../lib/types";
import { getShapeLabel, getTranslation } from "../lib/i18n";

const MINI_VIEW = 64;

function miniConfig(shape: CrosshairShape, color: string): CrosshairConfig {
  const c = structuredClone(DEFAULT_CROSSHAIR);
  c.shape = shape;
  c.color = color;
  c.outline.enabled = false;
  c.centerDot.enabled = false;
  c.thickness = 6;
  c.gap = 8;
  c.length = 16;
  c.size = 16;
  switch (shape) {
    case "dot":
      c.size = 14;
      break;
    case "circle":
      c.size = 30;
      c.thickness = 5;
      break;
    case "square":
      c.size = 30;
      c.thickness = 5;
      break;
    case "chevron":
      c.thickness = 5;
      c.gap = 4;
      c.length = 14;
      break;
    case "t":
      c.thickness = 5;
      c.gap = 6;
      c.length = 12;
      break;
  }
  return c;
}

export function ShapePanel() {
  const settings = useSettings((s) => s.settings);
  const update = useSettings((s) => s.update);
  const c = settings.crosshair;
  const lang = settings.ui.language ?? "ru";
  const accent = settings.ui.accentColor ?? "#4c8dff";
  const t = getTranslation(lang);

  return (
    <div className="flex flex-col gap-4">
      <Card title={t.shapeCardTitle}>
        <div className="shape-grid">
          {SHAPE_LIST.map((shape) => {
            const active = c.shape === shape;
            return (
              <button
                key={shape}
                type="button"
                className="shape-btn"
                data-active={active}
                onClick={() => update((d) => void (d.crosshair.shape = shape))}
              >
                <div style={{ width: 38, height: 38 }}>
                  <Crosshair
                    crosshair={miniConfig(shape, active ? accent : "var(--text-secondary)")}
                    view={MINI_VIEW}
                  />
                </div>
                <span>{getShapeLabel(shape, lang)}</span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card title={t.rotationCardTitle}>
        <Slider
          label={t.angleLabel}
          unit="°"
          min={0}
          max={359}
          value={c.rotation}
          onChange={(v) => update((d) => void (d.crosshair.rotation = v))}
        />
      </Card>

      <Card title={t.centerDotCardTitle}>
        <Switch
          label={t.enableCenterDot}
          checked={c.centerDot.enabled}
          onChange={(v) => update((d) => void (d.crosshair.centerDot.enabled = v))}
        />
        <Slider
          label={t.dotSizeLabel}
          unit=" px"
          min={0.5}
          max={30}
          step={0.5}
          decimals={1}
          disabled={!c.centerDot.enabled}
          value={c.centerDot.size}
          onChange={(v) => update((d) => void (d.crosshair.centerDot.size = v))}
        />
        <div style={c.centerDot.enabled ? undefined : { opacity: 0.4, pointerEvents: "none" }}>
          <Select<string>
            label={t.dotShapeLabel}
            value={c.centerDot.shape}
            options={[
              { value: "circle", label: t.dotShapeCircle },
              { value: "square", label: t.dotShapeSquare },
            ]}
            onChange={(v) => update((d) => void (d.crosshair.centerDot.shape = v as "circle" | "square"))}
          />
        </div>
      </Card>
    </div>
  );
}
