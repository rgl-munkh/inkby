const STEPS = ["Profile", "Booking", "Customize"] as const;

export function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center rounded-full p-1 gap-1 bg-muted">
      {STEPS.map((label, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === current;
        const isDone = stepNum < current;
        return (
          <div
            key={label}
            className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all"
            style={{
              background: isActive ? "var(--foreground)" : "transparent",
              color: isActive
                ? "var(--card)"
                : isDone
                  ? "var(--foreground)"
                  : "var(--muted-foreground)",
            }}
          >
            {isDone && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" fill="#1a1a1a" />
                <path d="M7 12l3 3 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {label}
          </div>
        );
      })}
    </div>
  );
}
