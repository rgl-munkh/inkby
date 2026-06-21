import type { SizeOption } from "../constants";

export function SizeSelect({
  options,
  value,
  onChange,
}: {
  options: readonly SizeOption[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div role="radiogroup" className="flex flex-col gap-2">
      {options.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className="flex items-center gap-3 w-full rounded-xl px-3.5 py-3 text-left border transition-all cursor-pointer"
            style={{
              background: selected ? "var(--muted)" : "transparent",
              borderColor: selected ? "var(--foreground)" : "var(--border)",
            }}
          >
            <span
              className="flex items-center justify-center w-5 h-5 rounded-full border shrink-0 transition-colors"
              style={{
                borderColor: selected ? "var(--foreground)" : "var(--border)",
              }}
              aria-hidden="true"
            >
              {selected && (
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: "var(--foreground)" }}
                />
              )}
            </span>
            <span className="text-sm font-medium text-foreground">
              {opt.label} {opt.emoji}
            </span>
          </button>
        );
      })}
    </div>
  );
}
