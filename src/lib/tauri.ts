import { invoke } from "@tauri-apps/api/core";
import { AppSettings } from "./types";

export interface ProfileMeta {
  id: string;
  name: string;
}

export interface MonitorInfo {
  index: number;
  name: string;
  width: number;
  height: number;
}

export const tauriApi = {
  getState: () => invoke<unknown>("get_state"),
  saveState: (payload: AppSettings) => invoke<void>("save_state", { payload }),
  listProfiles: () => invoke<ProfileMeta[]>("list_profiles"),
  loadProfile: (id: string) => invoke<unknown>("load_profile", { id }),
  saveProfile: (id: string | null, name: string, data: unknown) =>
    invoke<ProfileMeta>("save_profile", { id, name, data }),
  deleteProfile: (id: string) => invoke<void>("delete_profile", { id }),
  renameProfile: (id: string, name: string) => invoke<ProfileMeta>("rename_profile", { id, name }),
  importProfile: () => invoke<ProfileMeta>("import_profile"),
  exportProfile: (id: string) => invoke<void>("export_profile", { id }),
  importImage: () => invoke<string>("import_image"),
  listMonitors: () => invoke<MonitorInfo[]>("list_monitors"),
  getAutostart: () => invoke<boolean>("get_autostart"),
  setAutostart: (enabled: boolean) => invoke<void>("set_autostart", { enabled }),
  getGameBarStatus: () => invoke<boolean>("get_gamebar_status"),
  installGameBarWidget: () => invoke<string>("install_gamebar_widget"),
  syncGameBarWidget: () => invoke<void>("sync_gamebar_widget"),
  uninstallGameBarWidget: () => invoke<void>("uninstall_gamebar_widget"),
  openGameBar: () => invoke<void>("open_gamebar"),
};

