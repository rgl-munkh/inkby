import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
import { Spinner } from "@/components/icons/spinner";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const collageImages = [
  {
    src: "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=600&q=100",
    alt: "Tattoo artist at work",
  },
  {
    src: "https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?w=600&q=100",
    alt: "Tattoo studio supplies",
  },
  {
    src: "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=800&q=100",
    alt: "Clients at a tattoo studio",
  },
];

export function LogoIcon() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="36" height="36" rx="8" fill="#1a1a1a" />
      <path
        d="M18 7C18 7 11 15.5 11 21a7 7 0 0 0 14 0c0-5.5-7-14-7-14Z"
        fill="#f5e642"
      />
    </svg>
  );
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M1 9s3-5.5 8-5.5S17 9 17 9s-3 5.5-8 5.5S1 9 1 9Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path
        d="M1 9s3-5.5 8-5.5S17 9 17 9s-3 5.5-8 5.5S1 9 1 9Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <line
        x1="2"
        y1="2"
        x2="16"
        y2="16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-screen bg-background">
      <div className="hidden lg:grid lg:w-1/2 grid-cols-2 grid-rows-2 gap-1 p-1">
        <div className="relative row-span-2 overflow-hidden rounded-xl">
          <Image src={collageImages[2].src} alt={collageImages[2].alt} fill className="object-cover" />
        </div>
        <div className="relative overflow-hidden rounded-xl">
          <Image src={collageImages[1].src} alt={collageImages[1].alt} fill className="object-cover" />
        </div>
        <div className="relative overflow-hidden rounded-xl">
          <Image src={collageImages[0].src} alt={collageImages[0].alt} fill className="object-cover" />
        </div>
      </div>

      <div className="relative flex flex-1 items-center justify-center px-5 py-10 sm:px-6">
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
          <ThemeToggle />
        </div>
        <div className="flex w-full max-w-sm flex-col items-center gap-6">
          <LogoIcon />
          <div className="text-center">
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-5 text-muted-foreground">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}

export function GoogleAuthButton({
  loading,
  onClick,
}: {
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="h-12 w-full rounded-full border border-border bg-card px-5 text-sm font-semibold text-foreground shadow-sm hover:bg-muted"
    >
      <GoogleIcon />
      {loading ? "Redirecting..." : "Continue with Google"}
    </Button>
  );
}

export function AuthTextInput({ className, ...props }: React.ComponentProps<typeof Input>) {
  return (
    <Input
      {...props}
      className={cn(
        "h-14 rounded-xl border-border bg-card px-4 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-2",
        className,
      )}
    />
  );
}

export function AuthPasswordInput({
  showPassword,
  onTogglePassword,
  ...props
}: React.ComponentProps<typeof Input> & {
  showPassword: boolean;
  onTogglePassword: () => void;
}) {
  return (
    <div className="relative">
      <AuthTextInput
        {...props}
        type={showPassword ? "text" : "password"}
        className="h-14 rounded-xl border-border bg-card px-4 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus-visible:ring-2"
      />
      <button
        type="button"
        onClick={onTogglePassword}
        className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        <EyeIcon open={showPassword} />
      </button>
    </div>
  );
}

export function AuthError({ message }: { message: string }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-xs font-medium text-destructive"
    >
      {message}
    </div>
  );
}

export function AuthSubmitButton({
  loading,
  children,
}: {
  loading: boolean;
  children: ReactNode;
}) {
  return (
    <Button
      type="submit"
      disabled={loading}
      className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-4 text-xs font-bold uppercase tracking-widest text-card hover:bg-foreground/90"
    >
      {loading && <Spinner />}
      {children}
    </Button>
  );
}

export function AuthSwitchLink({
  label,
  href,
  linkText,
}: {
  label: string;
  href: string;
  linkText: string;
}) {
  return (
    <p className="text-xs text-muted-foreground">
      {label}{" "}
      <Link href={href} className="font-medium text-foreground underline underline-offset-4">
        {linkText}
      </Link>
    </p>
  );
}
