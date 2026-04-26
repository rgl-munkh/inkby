import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-inkby-canvas px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-5xl font-bold text-inkby-fg-muted">404</p>
        <div>
          <h2 className="text-base font-semibold text-inkby-fg">Page not found</h2>
          <p className="text-sm text-inkby-fg-muted mt-1">
            The page you&apos;re looking for doesn&apos;t exist
          </p>
        </div>
        <Link
          href="/"
          className="rounded-full border px-5 py-2.5 text-xs font-semibold tracking-wide uppercase transition-opacity hover:opacity-70"
          style={{ borderColor: "var(--inkby-border-strong)", color: "var(--inkby-fg)" }}
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
