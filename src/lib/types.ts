export type CrosshairShape = "cross" | "dot" | "circle" | "chevron" | "t" | "square";
export type DotShape = "circle" | "square";
export type ThemeStyle = "material" | "glass";
export type Language = "ru" | "en";
export type PreviewBg = "grid" | "dark" | "light" | "image";

export interface UiConfig {
  theme: ThemeStyle;
  accentColor: string;
  language: Language;
  previewBg: PreviewBg;
  previewImage: string;
}

export interface OutlineConfig {
  enabled: boolean;
  thickness: number;
  color: string;
  opacity: number;
}

export interface CenterDotConfig {
  enabled: boolean;
  size: number;
  shape: DotShape;
  color: string;
}

export interface CrosshairConfig {
  shape: CrosshairShape;
  /** Диаметр для dot / круга / квадрата */
  size: number;
  thickness: number;
  gap: number;
  /** Длина лучей для cross / chevron / t */
  length: number;
  /** 0..100 — скругление концов линий */
  roundness: number;
  rotation: number;
  opacity: number;
  color: string;
  outline: OutlineConfig;
  centerDot: CenterDotConfig;
}

export interface ImageConfig {
  enabled: boolean;
  src: string;
  scale: number;
  angle: number;
  opacity: number;
  offsetX: number;
  offsetY: number;
}

export interface AppSettings {
  version: 1;
  profile: string;
  crosshair: CrosshairConfig;
  image: ImageConfig;
  position: { offsetX: number; offsetY: number; monitor: number };
  hotkeys: { toggleOverlay: string; toggleSettings: string };
  ui: UiConfig;
}

export const DEFAULT_CROSSHAIR: CrosshairConfig = {
  shape: "cross",
  size: 24,
  thickness: 2,
  gap: 6,
  length: 14,
  roundness: 0,
  rotation: 0,
  opacity: 1,
  color: "#00e676",
  outline: { enabled: true, thickness: 2, color: "#000000", opacity: 0.75 },
  centerDot: { enabled: false, size: 4, shape: "circle", color: "#ffffff" },
};

export const DEFAULT_SETTINGS: AppSettings = {
  version: 1,
  profile: "default",
  crosshair: structuredClone(DEFAULT_CROSSHAIR),
  image: {
    enabled: false,
    src: "",
    scale: 1,
    angle: 0,
    opacity: 1,
    offsetX: 0,
    offsetY: 0,
  },
  position: { offsetX: 0, offsetY: 0, monitor: 0 },
  hotkeys: { toggleOverlay: "F8", toggleSettings: "F9" },
  ui: {
    theme: "glass",
    accentColor: "#4c8dff",
    language: "ru",
    previewBg: "grid",
    previewImage: "",
  },
};

/** Восстановление полной структуры из JSON с диска (устойчиво к старым файлам). */
export function normalizeSettings(raw: unknown): AppSettings {
  const d = structuredClone(DEFAULT_SETTINGS);
  if (typeof raw !== "object" || raw === null) return d;
  const r = raw as Record<string, unknown>;
  if (typeof r.profile === "string") d.profile = r.profile;
  if (r.crosshair) {
    const c = r.crosshair as Record<string, unknown>;
    const t = d.crosshair;
    if (typeof c.shape === "string" && (SHAPE_LIST as string[]).includes(c.shape))
      t.shape = c.shape as CrosshairShape;
    for (const k of ["size", "thickness", "gap", "length", "roundness", "rotation", "opacity"] as const) {
      if (typeof c[k] === "number" && Number.isFinite(c[k])) t[k] = c[k];
    }
    if (typeof c.color === "string") t.color = c.color;
    if (c.outline) {
      const o = c.outline as Record<string, unknown>;
      if (typeof o.enabled === "boolean") t.outline.enabled = o.enabled;
      if (typeof o.thickness === "number") t.outline.thickness = o.thickness;
      if (typeof o.color === "string") t.outline.color = o.color;
      if (typeof o.opacity === "number") t.outline.opacity = o.opacity;
    }
    if (c.centerDot) {
      const cd = c.centerDot as Record<string, unknown>;
      if (typeof cd.enabled === "boolean") t.centerDot.enabled = cd.enabled;
      if (typeof cd.size === "number") t.centerDot.size = cd.size;
      if (cd.shape === "circle" || cd.shape === "square") t.centerDot.shape = cd.shape;
      if (typeof cd.color === "string") t.centerDot.color = cd.color;
    }
  }
  if (r.image) {
    const i = r.image as Record<string, unknown>;
    if (typeof i.enabled === "boolean") d.image.enabled = i.enabled;
    if (typeof i.src === "string") d.image.src = i.src;
    for (const k of ["scale", "angle", "opacity", "offsetX", "offsetY"] as const) {
      if (typeof i[k] === "number" && Number.isFinite(i[k])) d.image[k] = i[k];
    }
  }
  if (r.position) {
    const p = r.position as Record<string, unknown>;
    if (typeof p.offsetX === "number") d.position.offsetX = p.offsetX;
    if (typeof p.offsetY === "number") d.position.offsetY = p.offsetY;
    if (typeof p.monitor === "number") d.position.monitor = p.monitor;
  }
  if (r.hotkeys) {
    const h = r.hotkeys as Record<string, unknown>;
    if (typeof h.toggleOverlay === "string") d.hotkeys.toggleOverlay = h.toggleOverlay;
    if (typeof h.toggleSettings === "string") d.hotkeys.toggleSettings = h.toggleSettings;
  }
  if (r.ui) {
    const u = r.ui as Record<string, unknown>;
    if (u.theme === "material" || u.theme === "glass") d.ui.theme = u.theme;
    if (typeof u.accentColor === "string" && /^#[0-9a-fA-F]{3,8}$/.test(u.accentColor))
      d.ui.accentColor = u.accentColor;
    if (u.language === "ru" || u.language === "en") d.ui.language = u.language;
    if (u.previewBg === "grid" || u.previewBg === "dark" || u.previewBg === "light" || u.previewBg === "image")
      d.ui.previewBg = u.previewBg;
    if (typeof u.previewImage === "string") d.ui.previewImage = u.previewImage;
  }
  return d;
}

export const SHAPE_LIST: readonly CrosshairShape[] = [
  "cross",
  "dot",
  "circle",
  "chevron",
  "t",
  "square",
];

export const SHAPE_LABELS: Record<CrosshairShape, string> = {
  cross: "Перекрестие",
  dot: "Точка",
  circle: "Круг",
  chevron: "Шеврон",
  t: "Т-прицел",
  square: "Квадрат",
};
