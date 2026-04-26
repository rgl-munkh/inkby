import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center gap-4 text-center">
        <p className="text-5xl font-bold text-muted-foreground">404</p>
        <div>
          <h2 className="text-base font-semibold text-foreground">Page not found</h2>
          <p className="text-sm text-muted-foreground mt-1">
            The page you&apos;re looking for doesn&apos;t exist
          </p>
        </div>
        <Link
          href="/"
          className="rounded-full border px-5 py-2.5 text-xs font-semibold tracking-wide uppercase transition-opacity hover:opacity-70"
          style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
