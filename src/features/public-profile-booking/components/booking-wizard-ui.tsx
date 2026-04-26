import type { ReactNode } from "react";

export function SmileyIcon({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <circle cx="40" cy="40" r="38" stroke="#c8c4bc" strokeWidth="2" fill="#e8e4dc" />
      <circle cx="30" cy="34" r="3" fill="#b0aca6" />
      <circle cx="50" cy="34" r="3" fill="#b0aca6" />
      <path d="M28 48c3 5 21 5 24 0" stroke="#b0aca6" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-8 h-8 rounded-full transition-colors hover:opacity-70 cursor-pointer"
      style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
      aria-label="Back"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

export function PillSelect({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className="rounded-full px-3 py-1.5 text-xs font-medium border transition-all cursor-pointer"
          style={{
            background: value === opt ? "var(--foreground)" : "transparent",
            color: value === opt ? "var(--card)" : "var(--muted-foreground)",
            borderColor: value === opt ? "var(--foreground)" : "var(--border)",
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export function QuestionCard({
  index,
  total,
  title,
  description,
  children,
}: {
  index: number;
  total: number;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl p-5 bg-card">
      <p className="text-[10px] font-semibold tracking-widest uppercase mb-2 text-muted-foreground">
        Question {index}/{total}
      </p>
      <h3 className="text-sm font-semibold mb-1 text-foreground">{title}</h3>
      {description && (
        <p className="text-xs mb-3 text-muted-foreground">{description}</p>
      )}
      {children}
    </div>
  );
}
