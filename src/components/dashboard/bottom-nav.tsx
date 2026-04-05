"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Artist = {
  slug: string | null;
  displayName: string | null;
  avatarUrl: string | null;
};

function InboxIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M22 12h-6l-2 3h-4l-2-3H2" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FlashIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth={active ? 2 : 1.5} />
      <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" />
    </svg>
  );
}

function ChatIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShareIcon({ active }: { active?: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" stroke="currentColor" strokeWidth={active ? 2 : 1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const NAV_ITEMS = [
  { href: "/dashboard", icon: InboxIcon, label: "Inbox" },
  { href: "/dashboard/flashbook", icon: FlashIcon, label: "Flashbook" },
  { href: "/dashboard/calendar", icon: CalendarIcon, label: "Calendar" },
  { href: "/dashboard/clients", icon: ChatIcon, label: "Clients" },
  { href: "/dashboard/booking-links", icon: ShareIcon, label: "Share" },
];

export function BottomNav({ artist }: { artist: Artist }) {
  const pathname = usePathname();

  return (
    <div className="flex lg:hidden fixed bottom-4 left-0 right-0 z-50 items-end justify-center px-4 gap-3">
      {/* Nav pill */}
      <div
        className="flex items-center gap-1 rounded-full px-4 py-3 flex-1 justify-between max-w-xs shadow-lg"
        style={{ background: "var(--inkby-surface)" }}
      >
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              aria-label={label}
              className="flex items-center justify-center w-9 h-9 rounded-full transition-colors"
              style={{ color: isActive ? "var(--inkby-fg)" : "var(--inkby-fg-placeholder)" }}
            >
              <Icon active={isActive} />
            </Link>
          );
        })}
      </div>

      {/* FAB */}
      <Link
        href="/dashboard/new"
        aria-label="New booking"
        className="flex items-center justify-center w-12 h-12 rounded-full shadow-lg shrink-0 transition-opacity hover:opacity-90"
        style={{ background: "var(--inkby-fg)", color: "var(--inkby-surface)" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </Link>
    </div>
  );
}
