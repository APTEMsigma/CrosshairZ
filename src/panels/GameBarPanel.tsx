import { useEffect, useState } from "react";
import { Card } from "../components/ui";
import { useSettings } from "../store/settings";
import { getTranslation } from "../lib/i18n";
import { tauriApi } from "../lib/tauri";
import { IconCheck, IconWarning, IconTrash, IconRefresh } from "../components/icons";

export function GameBarPanel() {
  const settings = useSettings((s) => s.settings);
  const lang = settings.ui.language ?? "ru";
  const t = getTranslation(lang);

  const [isInstalled, setIsInstalled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const checkStatus = async () => {
    try {
      const status = await tauriApi.getGameBarStatus();
      setIsInstalled(status);
    } catch {
      setIsInstalled(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const handleSync = async () => {
    setLoading(true);
    setMsg(null);
    try {
      await tauriApi.syncGameBarWidget();
      setMsg(t.gameBarSyncSuccess);
    } catch (e: any) {
      setMsg(String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleInstall = async () => {
    setLoading(true);
    setMsg(null);
    try {
      await tauriApi.installGameBarWidget();
      setMsg(t.gameBarInstallSuccess);
      await checkStatus();
    } catch (e: any) {
      setMsg(String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleUninstall = async () => {
    setLoading(true);
    setMsg(null);
    try {
      await tauriApi.uninstallGameBarWidget();
      setMsg(t.gameBarUninstallSuccess);
      await checkStatus();
    } catch (e: any) {
      setMsg(String(e));
    } finally {
      setLoading(false);
    }
  };

  const handleOpenGameBar = async () => {
    try {
      await tauriApi.openGameBar();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card title={t.gameBarCardTitle}>
        <div className="flex items-center justify-between" style={{ padding: "4px 0 10px" }}>
          <div className="setting-label" style={{ fontSize: 13, fontWeight: 500 }}>
            {t.gameBarStatusLabel}
          </div>
          <div className="flex items-center gap-2">
            {isInstalled ? (
              <span className="flex items-center gap-1.5" style={{ color: "var(--color-success, #00e676)", fontSize: 12.5, fontWeight: 600 }}>
                <IconCheck style={{ width: 14, height: 14 }} />
                {t.gameBarInstalled}
              </span>
            ) : (
              <span className="flex items-center gap-1.5" style={{ color: "var(--text-tertiary)", fontSize: 12.5 }}>
                <IconWarning style={{ width: 14, height: 14, color: "#ff9800" }} />
                {t.gameBarNotInstalled}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2" style={{ marginTop: 6 }}>
          {isInstalled && (
            <button
              type="button"
              className="btn-primary flex items-center justify-center gap-2"
              disabled={loading}
              onClick={handleSync}
              style={{ width: "100%", padding: "9px 14px", fontSize: 13, fontWeight: 600 }}
            >
              <IconRefresh style={{ width: 15, height: 15 }} />
              {t.gameBarSyncBtn}
            </button>
          )}

          <button
            type="button"
            className={isInstalled ? "btn-secondary flex items-center justify-center gap-2" : "btn-primary flex items-center justify-center gap-2"}
            disabled={loading}
            onClick={handleInstall}
            style={{ width: "100%", padding: "8px 14px", fontSize: 12.5, fontWeight: 500 }}
          >
            {loading ? "..." : isInstalled ? (lang === "ru" ? "Переустановить виджет" : "Reinstall Widget") : t.gameBarInstallBtn}
          </button>

          {isInstalled && (
            <div className="flex gap-2" style={{ marginTop: 2 }}>
              <div
                className="flex-1 flex items-center justify-center gap-2"
                style={{
                  padding: "7px 12px",
                  fontSize: 12,
                  borderRadius: 8,
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  color: "var(--text-secondary)",
                  userSelect: "none",
                  cursor: "default",
                }}
              >
                {t.gameBarOpenBtn}
              </div>
              <button
                type="button"
                className="btn-secondary flex items-center justify-center gap-1.5"
                disabled={loading}
                onClick={handleUninstall}
                title={t.gameBarUninstallBtn}
                style={{ padding: "7px 12px", fontSize: 12, color: "#ff5252" }}
              >
                <IconTrash style={{ width: 13, height: 13 }} />
                {t.gameBarUninstallBtn}
              </button>
            </div>
          )}
        </div>

        {msg && (
          <div
            style={{
              marginTop: 10,
              padding: "8px 12px",
              borderRadius: 6,
              fontSize: 12,
              background: "rgba(255, 255, 255, 0.05)",
              color: "var(--text-secondary)",
            }}
          >
            {msg}
          </div>
        )}
      </Card>

      <Card title={t.gameBarInstructionsTitle}>
        <div className="flex flex-col gap-2.5" style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>
          <div className="flex gap-2">
            <span style={{ color: "var(--accent)", fontWeight: 700 }}>1.</span>
            <span>{t.gameBarStep1}</span>
          </div>
          <div className="flex gap-2">
            <span style={{ color: "var(--accent)", fontWeight: 700 }}>2.</span>
            <span>{t.gameBarStep2}</span>
          </div>
          <div className="flex gap-2">
            <span style={{ color: "var(--accent)", fontWeight: 700 }}>3.</span>
            <span>{t.gameBarStep3}</span>
          </div>
          <div className="flex gap-2">
            <span style={{ color: "var(--accent)", fontWeight: 700 }}>4.</span>
            <span>{t.gameBarStep4}</span>
          </div>
        </div>

        <div
          style={{
            marginTop: 14,
            padding: "10px 12px",
            borderRadius: 8,
            fontSize: 11.5,
            background: "rgba(0, 230, 118, 0.08)",
            border: "1px solid rgba(0, 230, 118, 0.2)",
            color: "var(--text-primary)",
            lineHeight: 1.45,
          }}
        >
          {t.gameBarHintFullscreen}
        </div>
      </Card>
    </div>
  );
}
