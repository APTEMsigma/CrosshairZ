import { CSSProperties } from "react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { useSettings } from "../store/settings";
import { Crosshair } from "./Crosshair";
import { PreviewBg } from "../lib/types";
import { tauriApi } from "../lib/tauri";
import { getTranslation } from "../lib/i18n";
import { IconUpload } from "./icons";

const BG_CLASSES: Record<PreviewBg, string> = {
  grid: "preview-bg-grid",
  dark: "preview-bg-dark",
  light: "preview-bg-light",
  image: "preview-bg-image",
};

export function Preview() {
  const settings = useSettings((s) => s.settings);
  const update = useSettings((s) => s.update);
  const bg = settings.ui.previewBg;
  const lang = settings.ui.language ?? "ru";
  const t = getTranslation(lang);

  const style: CSSProperties | undefined =
    bg === "image" && settings.ui.previewImage
      ? { backgroundImage: `url(${convertFileSrc(settings.ui.previewImage)})` }
      : undefined;

  const setBg = (next: PreviewBg) => update((d) => void (d.ui.previewBg = next));

  const pickScreenshot = async () => {
    if (settings.ui.previewImage) {
      update((d) => void (d.ui.previewBg = "image"));
      return;
    }
    try {
      const path = await tauriApi.importImage();
      update((d) => {
        d.ui.previewImage = path;
        d.ui.previewBg = "image";
      });
    } catch {
      /* отмена выбора */
    }
  };

  const chips: { id: PreviewBg; label: string; onClick: () => void }[] = [
    { id: "grid", label: t.bgGrid, onClick: () => setBg("grid") },
    { id: "dark", label: t.bgDark, onClick: () => setBg("dark") },
    { id: "light", label: t.bgLight, onClick: () => setBg("light") },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-3" style={{ height: "100%" }}>
      <div className={`preview-canvas flex-1 ${BG_CLASSES[bg]}`} style={style}>
        {/* Subtle center alignment guide crosshair ticks */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0.15,
          }}
        >
          <div style={{ position: "absolute", width: "100%", height: 1, background: "rgba(255,255,255,0.4)" }} />
          <div style={{ position: "absolute", height: "100%", width: 1, background: "rgba(255,255,255,0.4)" }} />
        </div>

        {/* Crosshair Viewport */}
        <div style={{ width: "min(86%, 440px)", aspectRatio: "1 / 1", position: "relative", zIndex: 2 }}>
          <Crosshair crosshair={settings.crosshair} image={settings.image} />
        </div>

        {/* Floating status tag */}
        <div
          style={{
            position: "absolute",
            bottom: 12,
            left: 12,
            padding: "4px 10px",
            borderRadius: "var(--radius-pill)",
            background: "rgba(0, 0, 0, 0.55)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            fontSize: 11,
            color: "var(--text-secondary)",
            fontFamily: "var(--font-mono)",
            display: "flex",
            gap: 8,
          }}
        >
          <span>X: {settings.position.offsetX}px</span>
          <span>Y: {settings.position.offsetY}px</span>
          <span>{settings.crosshair.opacity * 100}%</span>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap items-center">
        {chips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            className="bg-chip"
            data-active={bg === chip.id}
            onClick={chip.onClick}
          >
            {chip.label}
          </button>
        ))}
        <button
          type="button"
          className="bg-chip"
          data-active={bg === "image"}
          onClick={pickScreenshot}
          title={t.screenshotTooltip}
          style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
        >
          <IconUpload style={{ width: 13, height: 13 }} />
          {t.bgScreenshot}
        </button>
      </div>
    </div>
  );
}
