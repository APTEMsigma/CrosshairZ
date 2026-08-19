import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import "./overlay.css";
import { Crosshair } from "../components/Crosshair";
import { CrosshairConfig, ImageConfig, normalizeSettings } from "../lib/types";

interface OverlayPayload {
  crosshair: CrosshairConfig;
  image: ImageConfig;
}

function OverlayRoot() {
  const [cfg, setCfg] = useState<OverlayPayload | null>(null);

  useEffect(() => {
    invoke<unknown>("get_state")
      .then((raw) => {
        const norm = normalizeSettings(raw);
        setCfg({ crosshair: norm.crosshair, image: norm.image });
      })
      .catch(console.error);

    const unlisten = listen<OverlayPayload>("crosshair:update", (event) => {
      const norm = normalizeSettings(event.payload as unknown);
      setCfg({ crosshair: norm.crosshair, image: norm.image });
    });

    return () => {
      unlisten.then((f) => f()).catch(() => undefined);
    };
  }, []);

  if (!cfg) return null;

  return (
    <div className="overlay-root">
      <Crosshair crosshair={cfg.crosshair} image={cfg.image} />
    </div>
  );
}

createRoot(document.getElementById("root")!).render(<OverlayRoot />);
