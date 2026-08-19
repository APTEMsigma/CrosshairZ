import { CrosshairConfig, DEFAULT_CROSSHAIR, ImageConfig, Language } from "./types";
import { getTranslation } from "./i18n";

export interface CrosshairPreset {
  id: string;
  nameRu: string;
  nameEn: string;
  patch: Partial<CrosshairConfig>;
}

export const CROSSHAIR_PRESETS: CrosshairPreset[] = [
  {
    id: "classic",
    nameRu: "Классика",
    nameEn: "Classic",
    patch: {
      shape: "cross", size: 24, thickness: 2, gap: 6, length: 14,
      roundness: 0, rotation: 0, color: "#00e676",
      centerDot: { enabled: false, size: 4, shape: "circle", color: "#ffffff" },
    },
  },
  {
    id: "dot",
    nameRu: "Точка",
    nameEn: "Dot",
    patch: {
      shape: "dot", size: 6, color: "#4fc3f7",
      centerDot: { enabled: false, size: 4, shape: "circle", color: "#ffffff" },
    },
  },
  {
    id: "circle",
    nameRu: "Круг",
    nameEn: "Circle",
    patch: { shape: "circle", size: 28, thickness: 2, color: "#ffffff" },
  },
  {
    id: "chevron",
    nameRu: "Шеврон",
    nameEn: "Chevron",
    patch: { shape: "chevron", length: 18, thickness: 3, gap: 4, rotation: 0, color: "#ff5252" },
  },
  {
    id: "t",
    nameRu: "Т-прицел",
    nameEn: "T-Cross",
    patch: { shape: "t", length: 16, thickness: 3, gap: 5, color: "#ffd740" },
  },
  {
    id: "square",
    nameRu: "Квадрат",
    nameEn: "Square",
    patch: { shape: "square", size: 26, thickness: 2, color: "#e040fb" },
  },
  {
    id: "tactical",
    nameRu: "Тактический",
    nameEn: "Tactical",
    patch: {
      shape: "cross", size: 24, thickness: 1, gap: 10, length: 9, color: "#00e676",
      centerDot: { enabled: true, size: 3, shape: "circle", color: "#00e676" },
    },
  },
  {
    id: "largeDot",
    nameRu: "Крупный + точка",
    nameEn: "Large + Dot",
    patch: {
      shape: "cross", size: 24, thickness: 4, gap: 12, length: 22, roundness: 60, color: "#4fc3f7",
      centerDot: { enabled: true, size: 4, shape: "circle", color: "#ffffff" },
    },
  },
];

export function getPresetName(preset: CrosshairPreset, lang: Language): string {
  return lang === "ru" ? preset.nameRu : preset.nameEn;
}

export function applyPreset(patch: Partial<CrosshairConfig>): { crosshair: CrosshairConfig; image: ImageConfig } {
  const base = structuredClone(DEFAULT_CROSSHAIR);
  return {
    crosshair: { ...base, ...structuredClone(patch) } as CrosshairConfig,
    image: { enabled: false, src: "", scale: 1, angle: 0, opacity: 1, offsetX: 0, offsetY: 0 },
  };
}

export const COLOR_PRESETS: string[] = [
  "#00e676", "#4fc3f7", "#ff5252", "#ffd740",
  "#e040fb", "#ff9800", "#ffffff", "#212121",
  "#69f0ae", "#80d8ff", "#ff8a80", "#b0bec5",
];
