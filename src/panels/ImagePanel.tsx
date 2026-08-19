import { Card, Slider, Switch, Button } from "../components/ui";
import { useSettings } from "../store/settings";
import { tauriApi } from "../lib/tauri";
import { getTranslation } from "../lib/i18n";
import { IconUpload } from "../components/icons";

export function ImagePanel() {
  const settings = useSettings((s) => s.settings);
  const update = useSettings((s) => s.update);
  const img = settings.image;
  const lang = settings.ui.language ?? "ru";
  const t = getTranslation(lang);

  const pickFile = async () => {
    try {
      const path = await tauriApi.importImage();
      update((d) => {
        d.image.src = path;
        d.image.enabled = true;
      });
    } catch {
      /* отмена выбора файла */
    }
  };

  const fileName = img.src ? img.src.split(/[\\/]/).pop() ?? "" : "";

  return (
    <div className="flex flex-col gap-4">
      <Card title={t.imageCardTitle}>
        <Switch
          label={t.enableImage}
          checked={img.enabled && !!img.src}
          onChange={(v) => update((d) => void (d.image.enabled = v))}
        />
        <div className="setting-row">
          <div className="setting-label">{t.fileLabel}</div>
          <Button size="sm" variant="tonal" onClick={pickFile}>
            <IconUpload style={{ width: 13, height: 13 }} />
            {t.chooseFileBtn}
          </Button>
          <div
            className="hint"
            style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            title={img.src}
          >
            {fileName || t.noFileSelected}
          </div>
        </div>
        <div className="hint" style={{ marginTop: 2 }}>
          {t.imageFormatHint}
        </div>
      </Card>

      <Card title={t.imageAdjustCardTitle}>
        <div style={img.enabled && img.src ? undefined : { opacity: 0.4, pointerEvents: "none" }}>
          <Slider
            label={t.imageScaleLabel}
            min={0.1}
            max={3}
            step={0.05}
            decimals={2}
            value={img.scale}
            onChange={(v) => update((d) => void (d.image.scale = v))}
          />
          <Slider
            label={t.imageRotationLabel}
            unit="°"
            min={0}
            max={360}
            value={img.angle}
            onChange={(v) => update((d) => void (d.image.angle = v))}
          />
          <Slider
            label={t.imageOpacityLabel}
            min={0.05}
            max={1}
            step={0.05}
            decimals={2}
            value={img.opacity}
            onChange={(v) => update((d) => void (d.image.opacity = v))}
          />
          <Slider
            label={t.imageShiftXLabel}
            unit=" px"
            min={-200}
            max={200}
            value={img.offsetX}
            onChange={(v) => update((d) => void (d.image.offsetX = Math.round(v)))}
          />
          <Slider
            label={t.imageShiftYLabel}
            unit=" px"
            min={-200}
            max={200}
            value={img.offsetY}
            onChange={(v) => update((d) => void (d.image.offsetY = Math.round(v)))}
          />
        </div>
      </Card>
    </div>
  );
}
