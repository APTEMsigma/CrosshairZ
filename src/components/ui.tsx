import { CSSProperties, ReactNode, useEffect, useRef, useState } from "react";

/* ============ Кнопка ============ */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "tonal" | "ghost" | "danger";
  size?: "sm" | "md";
}

export function Button({
  variant = "default",
  size,
  className,
  children,
  ...rest
}: ButtonProps) {
  const variantClass =
    variant === "primary"
      ? "btn-primary"
      : variant === "tonal"
      ? "btn-tonal"
      : variant === "ghost"
      ? "btn-ghost"
      : variant === "danger"
      ? "btn-danger"
      : "";
  const sizeClass = size === "sm" ? "btn-sm" : "";
  return (
    <button className={`btn ${variantClass} ${sizeClass} ${className ?? ""}`} {...rest}>
      {children}
    </button>
  );
}

/* ============ Карточка / Секция ============ */
export function Card({
  title,
  children,
  className,
  style,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={`section-card ${className ?? ""}`} style={style}>
      {title && <div className="card-title">{title}</div>}
      {children}
    </div>
  );
}

/* ============ Редактируемое числовое значение ============ */
export function EditableValue({
  value,
  min,
  max,
  step = 1,
  decimals = 0,
  unit = "",
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  step?: number;
  decimals?: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const clampV = (n: number) => Math.min(max, Math.max(min, n));

  const commit = () => {
    const parsed = parseFloat(text.replace(",", "."));
    if (Number.isFinite(parsed)) onChange(clampV(parsed));
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        ref={inputRef}
        className="field-value-input"
        value={text}
        inputMode="decimal"
        spellCheck={false}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            commit();
          } else if (e.key === "Escape") {
            e.preventDefault();
            setEditing(false);
          } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            e.preventDefault();
            const delta = (e.key === "ArrowUp" ? 1 : -1) * step * (e.shiftKey ? 10 : 1);
            const base = parseFloat(text.replace(",", "."));
            const cur = Number.isFinite(base) ? base : value;
            setText(clampV(cur + delta).toFixed(decimals));
          }
        }}
      />
    );
  }

  return (
    <div
      className="setting-value"
      onClick={() => {
        setText(value.toFixed(decimals));
        setEditing(true);
      }}
      title="Нажмите, чтобы ввести значение"
    >
      {value.toFixed(decimals)}
      {unit}
    </div>
  );
}

/* ============ Слайдер ============ */
export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  disabled,
  decimals = 0,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  disabled?: boolean;
  decimals?: number;
  onChange: (v: number) => void;
}) {
  const clamped = Math.min(max, Math.max(min, value));
  const pct = max === min ? 0 : ((clamped - min) / (max - min)) * 100;
  return (
    <div className="setting-row" style={disabled ? { opacity: 0.4, pointerEvents: "none" } : undefined}>
      <div className="setting-label">{label}</div>
      <input
        type="range"
        className="slider"
        style={{ "--val": `${pct}%` } as CSSProperties}
        min={min}
        max={max}
        step={step}
        value={clamped}
        onChange={(e) => {
          const val = parseFloat(e.target.value);
          if (Number.isFinite(val)) {
            onChange(Math.min(max, Math.max(min, val)));
          }
        }}
      />
      <EditableValue
        value={clamped}
        min={min}
        max={max}
        step={step}
        decimals={decimals}
        unit={unit}
        onChange={onChange}
      />
    </div>
  );
}

/* ============ Переключатель (Switch) ============ */
export function Switch({
  label,
  checked,
  onChange,
}: {
  label?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="setting-row">
      {label && <div className="setting-label" style={{ flex: 1 }}>{label}</div>}
      <button
        type="button"
        className="switch"
        data-on={checked}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
      />
    </div>
  );
}

/* ============ Вкладки навигации ============ */
export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
}

export function Tabs({
  items,
  active,
  onChange,
}: {
  items: TabItem[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="nav-tabs">
      {items.map((t) => (
        <button
          key={t.id}
          className="nav-tab-item"
          data-active={active === t.id}
          onClick={() => onChange(t.id)}
        >
          {t.icon}
          <span>{t.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ============ Выпадающий список (Select) ============ */
export function Select<T extends string | number>({
  label,
  value,
  options,
  onChange,
}: {
  label?: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="setting-row">
      {label && <div className="setting-label">{label}</div>}
      <select
        className="field"
        style={{ flex: 1 }}
        value={String(value)}
        onChange={(e) => {
          const raw = e.target.value;
          const found = options.find((o) => String(o.value) === raw);
          if (found) onChange(found.value);
        }}
      >
        {options.map((o) => (
          <option key={String(o.value)} value={String(o.value)}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ============ Числовое поле ============ */
export function NumberField({
  label,
  value,
  min = -10000,
  max = 10000,
  step = 1,
  unit = " px",
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  const [text, setText] = useState(() => String(value ?? 0));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setText(String(value ?? 0));
    }
  }, [value, focused]);

  const clampV = (n: number) => Math.min(max, Math.max(min, n));

  const commit = (valStr: string) => {
    let parsed = parseInt(valStr, 10);
    if (isNaN(parsed)) parsed = 0;
    const clamped = clampV(parsed);
    setText(String(clamped));
    onChange(clamped);
  };

  return (
    <div className="setting-row">
      <div className="setting-label">{label}</div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9\-]*"
          className="field"
          style={{ flex: 1, fontFamily: "var(--font-mono)", textAlign: "right" }}
          value={text}
          onFocus={(e) => {
            setFocused(true);
            e.target.select();
          }}
          onBlur={() => {
            setFocused(false);
            commit(text);
          }}
          onChange={(e) => {
            const raw = e.target.value;
            if (raw === "" || raw === "-") {
              setText(raw);
              return;
            }
            if (/^-?\d*$/.test(raw)) {
              setText(raw);
              const parsed = parseInt(raw, 10);
              if (!isNaN(parsed)) {
                onChange(clampV(parsed));
              }
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              commit(text);
              (e.target as HTMLInputElement).blur();
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              const cur = parseInt(text, 10) || 0;
              const next = clampV(cur + step * (e.shiftKey ? 10 : 1));
              setText(String(next));
              onChange(next);
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              const cur = parseInt(text, 10) || 0;
              const next = clampV(cur - step * (e.shiftKey ? 10 : 1));
              setText(String(next));
              onChange(next);
            }
          }}
        />
        {unit && <span style={{ fontSize: 12, color: "var(--text-tertiary)", minWidth: 20 }}>{unit}</span>}
      </div>
    </div>
  );
}
