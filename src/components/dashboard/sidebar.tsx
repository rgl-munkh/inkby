"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";

type Artist = {
  slug: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  instagramUsername: string | null;
};

function InboxIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22 12h-6l-2 3h-4l-2-3H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FlashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="1" y="4" width="22" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M1 10h22" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function GiftIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <polyline points="20 12 20 22 4 22 4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="2" y="7" width="20" height="5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const NAV_TOP = [
  { label: "INBOX", href: "/dashboard", icon: InboxIcon },
  { label: "FLASHBOOK", href: "/dashboard/flashbook", icon: FlashIcon },
  { label: "CALENDAR", href: "/dashboard/calendar", icon: CalendarIcon },
  { label: "CLIENTS", href: "/dashboard/clients", icon: UsersIcon },
];

const NAV_BOTTOM = [
  { label: "BOOKING LINKS", href: "/dashboard/booking-links", icon: LinkIcon },
  { label: "EVENTS", href: "/dashboard/events", icon: StarIcon },
  { label: "TRANSACTIONS", href: "/dashboard/transactions", icon: CreditCardIcon },
  { label: "PROFILE", href: "/dashboard/profile", icon: UserIcon },
  { label: "REFERRALS", href: "/dashboard/referrals", icon: GiftIcon },
];

export function Sidebar({ artist }: { artist: Artist }) {
  const pathname = usePathname();
  const router = useRouter();

  const displayName = artist.displayName ?? (artist.instagramUsername ? `@${artist.instagramUsername}` : artist.slug ?? "Artist");
  const initials = displayName.replace("@", "").slice(0, 2).toUpperCase();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <aside
      className="hidden lg:flex flex-col w-44 min-h-screen shrink-0 py-3 px-2 gap-1"
      style={{ background: "var(--inkby-border)" }}
    >
      {/* Artist card */}
      <Link
        href="/dashboard/profile"
        className="flex flex-col items-center gap-1.5 rounded-xl p-3 mb-1 transition-opacity hover:opacity-80 cursor-pointer"
        style={{ background: "var(--inkby-chip)" }}
      >
        <Avatar className="size-12">
          {artist.avatarUrl && <AvatarImage src={artist.avatarUrl} alt={displayName} />}
          <AvatarFallback
            className="text-sm font-semibold"
            style={{ background: "var(--inkby-border-strong)", color: "var(--inkby-fg-secondary)" }}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="text-center">
          <p className="text-xs font-semibold leading-tight text-inkby-fg">
            {displayName}
          </p>
          <p className="text-xs mt-0.5 text-inkby-fg-subtle">₮0.00</p>
        </div>
      </Link>

      {/* Top nav */}
      {NAV_TOP.map(({ label, href, icon: Icon }) => {
        const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
            style={{
              background: isActive ? "var(--inkby-nav-active)" : "transparent",
              color: isActive ? "var(--inkby-fg)" : "var(--inkby-fg-secondary)",
            }}
            suppressHydrationWarning
          >
            <Icon />
            {label}
          </Link>
        );
      })}

      <div className="my-1 px-3">
        <Separator style={{ background: "var(--inkby-border-strong)" }} />
      </div>

      {/* Bottom nav */}
      {NAV_BOTTOM.map(({ label, href, icon: Icon }) => {
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-colors"
            style={{
              background: isActive ? "var(--inkby-fg)" : "transparent",
              color: isActive ? "var(--inkby-surface)" : "var(--inkby-fg-secondary)",
            }}
            suppressHydrationWarning
          >
            <Icon />
            {label}
          </Link>
        );
      })}

      {/* Logout at bottom */}
      <div className="mt-auto pt-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium w-full transition-colors hover:opacity-70 cursor-pointer text-inkby-fg-muted"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          LOGOUT
        </button>
      </div>
    </aside>
  );
}
