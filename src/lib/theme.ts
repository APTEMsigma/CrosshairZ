import { hexToRgb, rgbToHex } from "./color";
import { Language } from "./types";

export interface AccentPreset {
  id: string;
  nameRu: string;
  nameEn: string;
  hex: string;
}

export const ACCENT_PRESETS: AccentPreset[] = [
  { id: "blue", nameRu: "Электрик синий", nameEn: "Electric Blue", hex: "#4c8dff" },
  { id: "cyan", nameRu: "Неоновый циан", nameEn: "Neon Cyan", hex: "#00d2ff" },
  { id: "emerald", nameRu: "Изумрудный", nameEn: "Emerald Mint", hex: "#00e676" },
  { id: "lime", nameRu: "Лаймовый", nameEn: "Toxic Lime", hex: "#76ff03" },
  { id: "purple", nameRu: "Кибер фиолетовый", nameEn: "Cyber Violet", hex: "#a855f7" },
  { id: "magenta", nameRu: "Неоновая роза", nameEn: "Neon Pink", hex: "#f43f5e" },
  { id: "crimson", nameRu: "Алый рубин", nameEn: "Ruby Red", hex: "#ff334b" },
  { id: "amber", nameRu: "Янтарный", nameEn: "Amber Gold", hex: "#f59e0b" },
  { id: "sunset", nameRu: "Закатный оранж", nameEn: "Sunset Orange", hex: "#ff7043" },
  { id: "teal", nameRu: "Морская волна", nameEn: "Teal Aqua", hex: "#14b8a6" },
  { id: "white", nameRu: "Чистый белый", nameEn: "Pure White", hex: "#f8fafc" },
];

function adjustBrightness(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex);
  const factor = 1 + percent / 100;
  const nr = Math.min(255, Math.max(0, Math.round(r * factor)));
  const ng = Math.min(255, Math.max(0, Math.round(g * factor)));
  const nb = Math.min(255, Math.max(0, Math.round(b * factor)));
  return rgbToHex({ r: nr, g: ng, b: nb });
}

function getLuminance(r: number, g: number, b: number): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

export function applyAccentToDom(accentHex: string) {
  const root = document.documentElement;
  const rgb = hexToRgb(accentHex);
  const { r, g, b } = rgb;
  const lum = getLuminance(r, g, b);
  const fg = lum > 0.65 ? "#0a0c10" : "#ffffff";

  const hoverHex = adjustBrightness(accentHex, 14);
  const pressHex = adjustBrightness(accentHex, -14);

  root.style.setProperty("--accent", accentHex);
  root.style.setProperty("--accent-rgb", `${r}, ${g}, ${b}`);
  root.style.setProperty("--accent-hover", hoverHex);
  root.style.setProperty("--accent-press", pressHex);
  root.style.setProperty("--accent-fg", fg);
  root.style.setProperty("--accent-subtle", `rgba(${r}, ${g}, ${b}, 0.12)`);
  root.style.setProperty("--accent-subtle-hover", `rgba(${r}, ${g}, ${b}, 0.22)`);
  root.style.setProperty("--accent-subtle-strong", `rgba(${r}, ${g}, ${b}, 0.32)`);
  root.style.setProperty("--accent-glow", `rgba(${r}, ${g}, ${b}, 0.42)`);
  root.style.setProperty("--accent-glow-strong", `rgba(${r}, ${g}, ${b}, 0.65)`);
  root.style.setProperty("--accent-border", `rgba(${r}, ${g}, ${b}, 0.35)`);
}

export function getAccentPresetName(preset: AccentPreset, lang: Language): string {
  return lang === "ru" ? preset.nameRu : preset.nameEn;
}
