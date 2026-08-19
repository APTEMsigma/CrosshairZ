import { CSSProperties, PointerEvent as ReactPointerEvent, useEffect, useRef, useState } from "react";
import { COLOR_PRESETS } from "../lib/presets";
import { clamp, hexToHsv, hexToRgb, hsvToHex, isValidHex, normalizeHex } from "../lib/color";
import { ACCENT_PRESETS, getAccentPresetName } from "../lib/theme";
import { Language } from "../lib/types";
import { getTranslation } from "../lib/i18n";
import { IconCheck, IconPalette } from "./icons";

/* ============================================================
   COLOR FIELD (For crosshair line/outline/dot settings)
   ============================================================ */
export function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  return (
    <div className="setting-row" ref={rootRef} style={{ position: "relative" }}>
      <div className="setting-label">{label}</div>
      <button
        type="button"
        className="swatch"
        style={{ background: normalizeHex(value) }}
        onClick={() => setOpen((v) => !v)}
        title="Изменить цвет"
      />
      <div style={{ flex: 1, textAlign: "right", fontSize: 12.5, fontVariantNumeric: "tabular-nums" }}>
        {normalizeHex(value)}
      </div>
      {open && (
        <div className="color-popover" style={{ top: "calc(100% + 6px)", left: 0 }}>
          <PickerControls hex={normalizeHex(value)} onChange={onChange} />
        </div>
      )}
    </div>
  );
}

/* ============================================================
   ACCENT COLOR PICKER (For header / global theme accent)
   ============================================================ */
export function AccentColorPicker({
  value,
  language,
  onChange,
}: {
  value: string;
  language: Language;
  onChange: (hex: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const t = getTranslation(language);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  return (
    <div ref={rootRef} style={{ position: "relative" }}>
      <button
        type="button"
        className="icon-action-btn"
        data-active={open}
        onClick={() => setOpen((v) => !v)}
        title={t.accentPalette}
      >
        <span
          style={{
            width: 14,
            height: 14,
            borderRadius: "50%",
            background: value,
            boxShadow: "0 0 6px var(--accent-glow)",
            display: "inline-block",
          }}
        />
        <IconPalette style={{ width: 14, height: 14 }} />
      </button>

      {open && (
        <div
          className="color-popover"
          style={{ right: 0, top: "calc(100% + 8px)", width: 350, maxHeight: "82vh", overflowY: "auto" }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--text-tertiary)", marginBottom: 10 }}>
            {t.accentPalette}
          </div>

          {/* Quick presets grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 7, marginBottom: 14 }}>
            {ACCENT_PRESETS.map((p) => {
              const active = value.toLowerCase() === p.hex.toLowerCase();
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onChange(p.hex)}
                  title={getAccentPresetName(p, language)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 5,
                    padding: "8px 4px",
                    borderRadius: "var(--radius-md)",
                    border: active ? "1.5px solid var(--accent)" : "1px solid var(--border)",
                    background: active ? "var(--accent-subtle)" : "var(--surface-container)",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: p.hex,
                      boxShadow: active ? "0 0 10px var(--accent-glow)" : "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {active && <IconCheck style={{ width: 13, height: 13, color: "#fff" }} />}
                  </span>
                  <span
                    style={{
                      fontSize: 10.5,
                      color: active ? "var(--accent)" : "var(--text-secondary)",
                      fontWeight: active ? 600 : 400,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "100%",
                      textAlign: "center",
                    }}
                  >
                    {getAccentPresetName(p, language)}
                  </span>
                </button>
              );
            })}
          </div>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10 }}>
            <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 8 }}>
              {t.customAccent}
            </div>
            <PickerControls hex={normalizeHex(value)} onChange={onChange} />
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   INNER PICKER CONTROLS (HSV Plane + Hue bar + Hex input)
   ============================================================ */
function PickerControls({ hex, onChange }: { hex: string; onChange: (h: string) => void }) {
  const [hsv, setHsv] = useState(() => hexToHsv(hex));
  const [hexText, setHexText] = useState(hex);
  const svRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);

  // Sync internal state when hex prop changes externally
  useEffect(() => {
    setHsv(hexToHsv(hex));
    setHexText(hex);
  }, [hex]);

  const rgb = hexToRgb(hsvToHex(hsv));

  const commit = (patch: Partial<{ h: number; s: number; v: number }>) => {
    const next = { ...hsv, ...patch };
    setHsv(next);
    const hx = hsvToHex(next);
    setHexText(hx);
    onChange(hx);
  };

  const fromEvent = (el: HTMLElement | null, e: ReactPointerEvent) => {
    if (!el) return { fx: 0, fy: 0 };
    const r = el.getBoundingClientRect();
    return {
      fx: clamp((e.clientX - r.left) / r.width, 0, 1),
      fy: clamp((e.clientY - r.top) / r.height, 0, 1),
    };
  };

  const svDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const { fx, fy } = fromEvent(svRef.current, e);
    commit({ s: fx, v: 1 - fy });
  };
  const svMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.buttons === 0) return;
    const { fx, fy } = fromEvent(svRef.current, e);
    commit({ s: fx, v: 1 - fy });
  };

  const hueDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const { fx } = fromEvent(hueRef.current, e);
    commit({ h: fx * 360 });
  };
  const hueMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.buttons === 0) return;
    const { fx } = fromEvent(hueRef.current, e);
    commit({ h: fx * 360 });
  };

  const applyHex = (text: string) => {
    setHexText(text);
    if (isValidHex(text)) {
      const norm = normalizeHex(text);
      setHsv(hexToHsv(norm));
      onChange(norm);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div
        className="sv-area"
        ref={svRef}
        style={{ "--hue": hsv.h } as CSSProperties}
        onPointerDown={svDown}
        onPointerMove={svMove}
      >
        <div className="sv-cursor" style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%` }} />
      </div>

      <div className="hue-strip" ref={hueRef} onPointerDown={hueDown} onPointerMove={hueMove}>
        <div className="hue-cursor" style={{ left: `${(hsv.h / 360) * 100}%`, background: hsvToHex({ ...hsv, s: 1, v: 1 }) }} />
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 4, alignItems: "center" }}>
        <span style={{ color: "var(--text-tertiary)", fontSize: 12 }}>HEX</span>
        <input
          className="field"
          style={{ width: 86, padding: "4px 8px", fontSize: 12.5, fontFamily: "var(--font-mono)" }}
          value={hexText}
          spellCheck={false}
          onChange={(e) => applyHex(e.target.value)}
        />
      </div>

      <div className="hint" style={{ marginTop: 2 }}>
        RGB {Math.round(rgb.r)}, {Math.round(rgb.g)}, {Math.round(rgb.b)} · HSV {Math.round(hsv.h)}°,{" "}
        {Math.round(hsv.s * 100)}%, {Math.round(hsv.v * 100)}%
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
        {COLOR_PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            className="preset-swatch"
            style={{ background: p }}
            title={p}
            onClick={() => applyHex(p)}
          />
        ))}
      </div>
    </div>
  );
}
