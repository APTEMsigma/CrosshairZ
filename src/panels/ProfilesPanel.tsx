import { useCallback, useEffect, useState } from "react";
import { Button, Card, Switch } from "../components/ui";
import { useSettings } from "../store/settings";
import { ProfileMeta, tauriApi } from "../lib/tauri";
import { normalizeSettings } from "../lib/types";
import { CROSSHAIR_PRESETS, applyPreset, getPresetName } from "../lib/presets";
import { getTranslation } from "../lib/i18n";
import {
  IconDownload,
  IconEdit,
  IconPlus,
  IconRefresh,
  IconTrash,
  IconUpload,
} from "../components/icons";

type Editing = { mode: "create" | "rename"; id?: string; value: string } | null;

export function ProfilesPanel() {
  const settings = useSettings((s) => s.settings);
  const update = useSettings((s) => s.update);
  const applyCrosshair = useSettings((s) => s.applyCrosshair);
  const lang = settings.ui.language ?? "ru";
  const t = getTranslation(lang);

  const [profiles, setProfiles] = useState<ProfileMeta[]>([]);
  const [editing, setEditing] = useState<Editing>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      setProfiles(await tauriApi.listProfiles());
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const load = async (id: string) => {
    try {
      const raw = (await tauriApi.loadProfile(id)) as Record<string, unknown>;
      const norm = normalizeSettings({ crosshair: raw.crosshair, image: raw.image });
      applyCrosshair(norm.crosshair, norm.image);
      update((d) => void (d.profile = id));
      setError("");
    } catch (e) {
      setError(String(e));
    }
  };

  const saveCurrent = async (id: string | null, name: string) => {
    try {
      const meta = await tauriApi.saveProfile(id, name, {
        crosshair: settings.crosshair,
        image: settings.image,
      });
      await refresh();
      update((d) => void (d.profile = meta.id));
      setError("");
    } catch (e) {
      setError(String(e));
    }
  };

  const current = profiles.find((p) => p.id === settings.profile);

  return (
    <div className="flex flex-col gap-4">
      <Card title={t.profilesCardTitle}>
        <div className="flex gap-2 flex-wrap" style={{ marginBottom: 10 }}>
          <Button
            size="sm"
            variant="primary"
            onClick={() =>
              saveCurrent(current ? current.id : null, current ? current.name : t.defaultProfileName)
            }
          >
            <IconRefresh style={{ width: 13, height: 13 }} />
            {t.saveCurrentBtn}
          </Button>
          <Button
            size="sm"
            variant="tonal"
            onClick={() => setEditing({ mode: "create", value: "" })}
          >
            <IconPlus style={{ width: 13, height: 13 }} />
            {t.newProfileBtn}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={async () => {
              try {
                const meta = await tauriApi.importProfile();
                await refresh();
                await load(meta.id);
              } catch {
                /* отмена выбора файла */
              }
            }}
          >
            <IconUpload style={{ width: 13, height: 13 }} />
            {t.importBtn}
          </Button>
        </div>

        {editing && (
          <div className="setting-row" style={{ gap: 8, marginBottom: 8 }}>
            <input
              className="field"
              style={{ flex: 1 }}
              autoFocus
              placeholder={t.profileNamePlaceholder}
              value={editing.value}
              onChange={(e) => setEditing({ ...editing, value: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const name = editing.value.trim();
                  if (name) {
                    if (editing.mode === "create") saveCurrent(null, name);
                    else if (editing.id) {
                      tauriApi
                        .renameProfile(editing.id, name)
                        .then(refresh)
                        .catch((err) => setError(String(err)));
                    }
                  }
                  setEditing(null);
                } else if (e.key === "Escape") {
                  setEditing(null);
                }
              }}
            />
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                const name = editing.value.trim();
                if (name) {
                  if (editing.mode === "create") saveCurrent(null, name);
                  else if (editing.id) {
                    tauriApi
                      .renameProfile(editing.id, name)
                      .then(refresh)
                      .catch((err) => setError(String(err)));
                  }
                }
                setEditing(null);
              }}
            >
              {t.saveBtn}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>
              {t.cancelBtn}
            </Button>
          </div>
        )}

        <div className="flex flex-col gap-1">
          {profiles.length === 0 && (
            <div className="hint" style={{ padding: "8px 0" }}>
              {t.noProfilesYet}
            </div>
          )}
          {profiles.map((p) => {
            const isActive = p.id === settings.profile;
            return (
              <div
                key={p.id}
                className="profile-item"
                data-active={isActive}
              >
                <div style={{ flex: 1, minWidth: 0 }} onClick={() => load(p.id)}>
                  <div
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontSize: 13,
                    }}
                  >
                    {p.name}
                  </div>
                </div>

                {confirmDelete === p.id ? (
                  <div className="flex gap-1 items-center">
                    <span style={{ fontSize: 11, color: "var(--danger)" }}>{t.deleteConfirmTitle}</span>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={async () => {
                        try {
                          await tauriApi.deleteProfile(p.id);
                          await refresh();
                        } catch (e) {
                          setError(String(e));
                        }
                        setConfirmDelete(null);
                      }}
                    >
                      {t.deleteBtn}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(null)}>
                      {t.cancelBtn}
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      title={t.overwriteTooltip}
                      onClick={() => saveCurrent(p.id, p.name)}
                    >
                      <IconRefresh style={{ width: 13, height: 13 }} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      title={t.renameTooltip}
                      onClick={() => setEditing({ mode: "rename", id: p.id, value: p.name })}
                    >
                      <IconEdit style={{ width: 13, height: 13 }} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      title={t.exportTooltip}
                      onClick={() => tauriApi.exportProfile(p.id).catch(() => undefined)}
                    >
                      <IconDownload style={{ width: 13, height: 13 }} />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      title={t.deleteTooltip}
                      onClick={() => setConfirmDelete(p.id)}
                    >
                      <IconTrash style={{ width: 13, height: 13 }} />
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {error && (
          <div className="hint" style={{ color: "var(--danger)", marginTop: 6 }}>
            {error}
          </div>
        )}
      </Card>

      <Card title={t.quickPresetsCardTitle}>
        <div className="grid grid-cols-2 gap-2">
          {CROSSHAIR_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className="btn btn-sm"
              style={{ justifyContent: "flex-start", padding: "8px 12px" }}
              onClick={() => {
                const { crosshair, image } = applyPreset(preset.patch);
                applyCrosshair(crosshair, image);
              }}
            >
              <span>{getPresetName(preset, lang)}</span>
            </button>
          ))}
        </div>
        <div className="hint" style={{ marginTop: 8 }}>
          {t.quickPresetsHint}
        </div>
      </Card>

      <Card title={t.autostartBtn}>
        <AutostartToggle label={t.autostartLabel} />
      </Card>
    </div>
  );
}

function AutostartToggle({ label }: { label: string }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    tauriApi.getAutostart().then(setActive).catch(() => undefined);
  }, []);

  const toggle = async (v: boolean) => {
    try {
      await tauriApi.setAutostart(v);
      setActive(v);
    } catch (e) {
      console.error(e);
    }
  };

  return <Switch label={label} checked={active} onChange={toggle} />;
}
