const ARROWS: Record<string, string> = {
  Left: "←",
  Right: "→",
  Up: "↑",
  Down: "↓",
};

/** «Control+Shift+KeyF» → «Ctrl + Shift + F» */
export function prettyCombo(combo: string): string {
  if (!combo) return "";
  return combo
    .split("+")
    .filter(Boolean)
    .map((part) => {
      switch (part) {
        case "Control":
          return "Ctrl";
        case "Alt":
          return "Alt";
        case "Shift":
          return "Shift";
        case "Super":
          return "Win";
        default:
          if (part.startsWith("Key")) return part.slice(3);
          if (part.startsWith("Digit")) return part.slice(5);
          if (part.startsWith("Numpad")) return "Num" + part.slice(6);
          if (part.startsWith("Arrow")) return ARROWS[part.slice(5)] ?? part;
          return part;
      }
    })
    .join(" + ");
}
