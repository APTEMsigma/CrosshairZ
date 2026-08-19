import { CSSProperties, ReactElement } from "react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { CenterDotConfig, CrosshairConfig, ImageConfig } from "../lib/types";

/** Область отрисовки в «единицах» = физическим пикселям окна оверлея. */
const VIEW = 640;

type Prim =
  | { kind: "rect"; x: number; y: number; w: number; h: number; rx: number; rot?: number; py?: number }
  | { kind: "disc"; r: number }
  | { kind: "ring"; r: number }
  | { kind: "square"; half: number; rx: number };

function shapePrims(c: CrosshairConfig): Prim[] {
  const t = Math.max(0.1, Number.isFinite(c.thickness) ? c.thickness : 2);
  const gap = Math.max(0, Number.isFinite(c.gap) ? c.gap : 6);
  const len = Math.max(0.1, Number.isFinite(c.length) ? c.length : 14);
  const round = Math.max(0, Math.min(100, Number.isFinite(c.roundness) ? c.roundness : 0)) / 100;
  const size = Math.max(0.5, Number.isFinite(c.size) ? c.size : 24);

  switch (c.shape) {
    case "dot":
      return [{ kind: "disc", r: size / 2 }];

    case "circle":
      return [{ kind: "ring", r: Math.max(0.5, size / 2 - t / 2) }];

    case "square": {
      const half = Math.max(0.5, size / 2 - t / 2);
      return [{ kind: "square", half, rx: round * half }];
    }

    case "chevron": {
      const rx = round * (t / 2);
      // Apex of chevron points exactly at (0, 0)
      return [
        { kind: "rect", x: -t / 2, y: gap, w: t, h: len, rx, rot: -45, py: 0 },
        { kind: "rect", x: -t / 2, y: gap, w: t, h: len, rx, rot: 45, py: 0 },
      ];
    }

    case "t": {
      const rx = round * (t / 2);
      // Esports T-crosshair: Left, Right, Bottom arms centered symmetrically around (0, 0)
      return [
        { kind: "rect", x: -(gap + len), y: -t / 2, w: len, h: t, rx },
        { kind: "rect", x: gap, y: -t / 2, w: len, h: t, rx },
        { kind: "rect", x: -t / 2, y: gap, w: t, h: len, rx },
      ];
    }

    case "cross":
    default: {
      const rx = round * (t / 2);
      return [
        { kind: "rect", x: -t / 2, y: -(gap + len), w: t, h: len, rx },
        { kind: "rect", x: -t / 2, y: gap, w: t, h: len, rx },
        { kind: "rect", x: -(gap + len), y: -t / 2, w: len, h: t, rx },
        { kind: "rect", x: gap, y: -t / 2, w: len, h: t, rx },
      ];
    }
  }
}

function renderPrim(
  p: Prim,
  key: string,
  opts: { color: string; thickness: number; o: number },
): ReactElement {
  const { color, thickness: t, o } = opts;
  switch (p.kind) {
    case "rect":
      return (
        <rect
          key={key}
          x={p.x - o}
          y={p.y - o}
          width={Math.max(0.1, p.w + 2 * o)}
          height={Math.max(0.1, p.h + 2 * o)}
          rx={Math.max(0, p.rx + o)}
          fill={color}
          transform={p.rot !== undefined ? `rotate(${p.rot} 0 ${p.py ?? 0})` : undefined}
        />
      );
    case "disc":
      return <circle key={key} r={Math.max(0.1, p.r + o)} fill={color} />;
    case "ring":
      return (
        <circle key={key} r={p.r} fill="none" stroke={color} strokeWidth={Math.max(0.1, t + 2 * o)} />
      );
    case "square":
      return (
        <rect
          key={key}
          x={-p.half}
          y={-p.half}
          width={2 * p.half}
          height={2 * p.half}
          rx={Math.max(0, p.rx + o)}
          fill="none"
          stroke={color}
          strokeWidth={Math.max(0.1, t + 2 * o)}
        />
      );
  }
}

function renderDot(
  dot: CenterDotConfig,
  key: string,
  color: string,
  o: number,
): ReactElement {
  const half = Math.max(0.25, (dot.size || 4) / 2);
  if (dot.shape === "square") {
    const h = half + o;
    return <rect key={key} x={-h} y={-h} width={2 * h} height={2 * h} rx={o > 0 ? o : 0} fill={color} />;
  }
  return <circle key={key} r={half + o} fill={color} />;
}

export interface CrosshairProps {
  crosshair: CrosshairConfig;
  image?: ImageConfig | null;
  className?: string;
  style?: CSSProperties;
  /** Размер области отрисовки в юнитах (по умолчанию 640 — окно оверлея). */
  view?: number;
}

/**
 * Чистый рендерер прицела. Один и тот же компонент работает
 * в окне предпросмотра и в прозрачном окне оверлея (1 юнит = 1 физ. px оверлея).
 */
export function Crosshair({ crosshair: c, image, className, style, view = VIEW }: CrosshairProps) {
  if (image?.enabled && image.src) {
    const src = /^(asset:|https?:|data:)/.test(image.src) ? image.src : convertFileSrc(image.src);
    const imgOpacity = Math.max(0.01, Math.min(1, Number.isFinite(image.opacity) ? image.opacity : 1));
    return (
      <div className={className} style={{ position: "relative", width: "100%", height: "100%", ...style }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: imgOpacity,
          }}
        >
          <img
            src={src}
            alt=""
            draggable={false}
            style={{
              width: `${256 * (image.scale || 1)}px`,
              maxWidth: "none",
              transform: `translate(${image.offsetX || 0}px, ${image.offsetY || 0}px) rotate(${image.angle || 0}deg)`,
              pointerEvents: "none",
              userSelect: "none",
            }}
          />
        </div>
      </div>
    );
  }

  const prims = shapePrims(c);
  const t = Math.max(0.1, Number.isFinite(c.thickness) ? c.thickness : 2);
  const o = c.outline?.enabled ? Math.max(0.1, c.outline.thickness || 2) : 0;
  const dot = c.centerDot?.enabled ? c.centerDot : null;
  const mainOpacity = Math.max(0.01, Math.min(1, Number.isFinite(c.opacity) ? c.opacity : 1));
  const outlineOpacity = Math.max(0, Math.min(1, Number.isFinite(c.outline?.opacity) ? c.outline.opacity : 0.75));

  return (
    <svg
      viewBox={`${-view / 2} ${-view / 2} ${view} ${view}`}
      shapeRendering="geometricPrecision"
      className={className}
      style={{ width: "100%", height: "100%", display: "block", overflow: "visible", ...style }}
    >
      <g transform={c.rotation ? `rotate(${c.rotation})` : undefined}>
        {o > 0 && (
          <g opacity={outlineOpacity}>
            {prims.map((p, i) => renderPrim(p, `o${i}`, { color: c.outline.color || "#000000", thickness: t, o }))}
            {dot && renderDot(dot, "od", c.outline.color || "#000000", o)}
          </g>
        )}
        <g opacity={mainOpacity}>
          {prims.map((p, i) => renderPrim(p, `m${i}`, { color: c.color || "#00e676", thickness: t, o: 0 }))}
          {dot && renderDot(dot, "md", c.color || "#ffffff", 0)}
        </g>
      </g>
    </svg>
  );
}
