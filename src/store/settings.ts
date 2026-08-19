import { create } from "zustand";
import { emitTo } from "@tauri-apps/api/event";
import { AppSettings, CrosshairConfig, ImageConfig, normalizeSettings, DEFAULT_SETTINGS } from "../lib/types";
import { tauriApi } from "../lib/tauri";

interface SettingsStore {
  settings: AppSettings;
  loaded: boolean;
  hydrate: () => Promise<void>;
  update: (fn: (draft: AppSettings) => void) => void;
  applyCrosshair: (crosshair: CrosshairConfig, image?: ImageConfig) => void;
}

let latestOverlayPayload: { crosshair: CrosshairConfig; image?: ImageConfig } | null = null;
let emitScheduled = false;

function pushToOverlay(settings: AppSettings) {
  latestOverlayPayload = {
    crosshair: settings.crosshair,
    image: settings.image,
  };
  if (emitScheduled) return;
  emitScheduled = true;
  requestAnimationFrame(() => {
    emitScheduled = false;
    if (latestOverlayPayload) {
      emitTo("overlay", "crosshair:update", latestOverlayPayload).catch(() => undefined);
    }
  });
}

let latestPersistSettings: AppSettings | null = null;
let persistScheduled: ReturnType<typeof setTimeout> | null = null;

function schedulePersist(settings: AppSettings) {
  latestPersistSettings = settings;
  if (persistScheduled) clearTimeout(persistScheduled);
  persistScheduled = setTimeout(() => {
    persistScheduled = null;
    if (latestPersistSettings) {
      tauriApi.saveState(latestPersistSettings).catch((e) => console.error("save_state failed:", e));
    }
  }, 250);
}

export const useSettings = create<SettingsStore>((set, get) => ({
  settings: structuredClone(DEFAULT_SETTINGS),
  loaded: false,

  hydrate: async () => {
    if (get().loaded) return;
    try {
      const raw = await tauriApi.getState();
      set({ settings: normalizeSettings(raw), loaded: true });
    } catch (e) {
      console.error("get_state failed:", e);
      set({ loaded: true });
    }
  },

  update: (fn) => {
    set((state) => {
      const next = structuredClone(state.settings);
      fn(next);
      pushToOverlay(next);
      schedulePersist(next);
      return { settings: next };
    });
  },

  applyCrosshair: (crosshair, image) => {
    get().update((d) => {
      d.crosshair = structuredClone(crosshair);
      if (image) d.image = structuredClone(image);
    });
  },
}));
