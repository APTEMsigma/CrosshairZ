import { useEffect, useState } from "react";
import { prettyCombo } from "../lib/hotkeys";
import { Language } from "../lib/types";
import { getTranslation } from "../lib/i18n";

const MODIFIER_CODES = new Set([
  "ControlLeft",
  "ControlRight",
  "AltLeft",
  "AltRight",
  "ShiftLeft",
  "ShiftRight",
  "MetaLeft",
  "MetaRight",
]);

export function HotkeyCapture({
  value,
  language = "ru",
  onChange,
}: {
  value: string;
  language?: Language;
  onChange: (combo: string) => void;
}) {
  const [listening, setListening] = useState(false);
  const t = getTranslation(language);

  useEffect(() => {
    if (!listening) return;
    const onKey = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.code === "Escape") {
        setListening(false);
        return;
      }
      if (e.code === "Backspace") {
        onChange("");
        setListening(false);
        return;
      }
      if (MODIFIER_CODES.has(e.code)) return; // ждём основную клавишу
      const mods: string[] = [];
      if (e.ctrlKey) mods.push("Control");
      if (e.altKey) mods.push("Alt");
      if (e.shiftKey) mods.push("Shift");
      if (e.metaKey) mods.push("Super");
      onChange([...mods, e.code].join("+"));
      setListening(false);
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [listening, onChange]);

  return (
    <button
      type="button"
      className="field hotkey-capture"
      style={{
        minWidth: 140,
        textAlign: "center",
        cursor: "pointer",
        fontFamily: "var(--font-mono)",
        borderColor: listening ? "var(--accent)" : undefined,
        background: listening ? "var(--accent-subtle)" : undefined,
        color: listening ? "var(--accent)" : undefined,
      }}
      data-listening={listening}
      onClick={() => setListening((v) => !v)}
      title={t.hotkeyHint1}
    >
      {listening ? t.hotkeyPressPrompt : prettyCombo(value) || t.hotkeyClearPrompt}
    </button>
  );
}
