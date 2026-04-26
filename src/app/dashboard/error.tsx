"use client";

export default function DashboardError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-20">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-12 h-12 rounded-full bg-inkby-surface-neutral flex items-center justify-center">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" stroke="var(--inkby-fg-muted)" strokeWidth="1.5" />
            <path d="M12 8v4M12 16h.01" stroke="var(--inkby-fg-muted)" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <h2 className="text-base font-semibold text-inkby-fg">Something went wrong</h2>
          <p className="text-sm text-inkby-fg-muted mt-1">We couldn&apos;t load this page</p>
        </div>
        <button
          onClick={reset}
          className="rounded-full border px-5 py-2.5 text-xs font-semibold tracking-wide uppercase transition-opacity hover:opacity-70 cursor-pointer"
          style={{ borderColor: "var(--inkby-border-strong)", color: "var(--inkby-fg)" }}
        >
          Try again
        </button>
      </div>
    </div>
  );
}
