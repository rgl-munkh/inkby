"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useClipboardCopy } from "@/hooks/use-clipboard-copy";
import { useArtistProfile } from "./hooks/use-artist-profile";
import { useArtistEarnings } from "./hooks/use-artist-earnings";
import { AvailabilitySection } from "./components/availability-section";
import { ProfileSkeleton } from "./components/profile-skeleton";
import {
  ExternalLinkIcon,
  EditIcon,
  LinkIcon,
  ShieldIcon,
  PayoutIcon,
} from "./components/profile-icons";
import { PERIOD_TABS, type Period } from "./types";

export default function DashboardProfilePage() {
  const { artist, loading } = useArtistProfile();
  const { copied, copy: copyToClipboard } = useClipboardCopy();
  const [activePeriod, setActivePeriod] = useState<Period>("MONTH");
  const { earnings, earningsLoading } = useArtistEarnings(activePeriod);

  function handleCopyLink() {
    const handle = artist?.slug ?? artist?.instagramUsername ?? "";
    const url = `${window.location.origin}/@${handle}`;
    copyToClipboard(url);
  }

  if (loading) return (
    <div className="min-h-screen bg-background">
      <ProfileSkeleton />
    </div>
  );

  if (!artist) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <p className="text-sm text-muted-foreground">Profile not found.</p>
    </div>
  );

  const handle = artist.slug ?? artist.instagramUsername ?? "";
  const displayName = artist.displayName ?? (handle ? `@${handle}` : "Artist");
  const initials = displayName.replace("@", "").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen pb-[calc(6rem+env(safe-area-inset-bottom))] lg:pb-8 bg-background">
      <div className="max-w-lg mx-auto">

        <div className="flex items-center px-4 pt-5 pb-2 relative">
          <Link
            href="/dashboard"
            className="absolute left-4 w-8 h-8 flex items-center justify-center rounded-full transition-opacity hover:opacity-70 text-foreground"
            aria-label="Back"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <p className="text-sm font-semibold mx-auto text-foreground">Profile</p>
        </div>

        <div className="px-4 flex flex-col gap-4 pt-3">

          <div className="flex flex-col items-center gap-2 pt-2 pb-1">
            <div className="relative w-20 h-20 rounded-full overflow-hidden shrink-0 bg-card border border-border">
              {artist.avatarUrl ? (
                <Image src={artist.avatarUrl} alt={displayName} fill sizes="80px" className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg font-semibold text-muted-foreground">
                  {initials}
                </div>
              )}
            </div>
            <p className="text-base font-bold text-foreground">{displayName}</p>
            {handle && (
              <a
                href={`/@${handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs transition-opacity hover:opacity-70 text-muted-foreground"
              >
                venue.inkl/@{handle}
                <ExternalLinkIcon />
              </a>
            )}
          </div>

          <div className="flex gap-2">
            <Link
              href="/dashboard/profile/edit"
              className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-full text-xs font-semibold tracking-wide transition-opacity hover:opacity-80"
              style={{ background: "var(--foreground)", color: "var(--card)" }}
            >
              <EditIcon />
              EDIT PROFILE
            </Link>
            <button
              onClick={handleCopyLink}
              className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-full text-xs font-semibold tracking-wide transition-opacity hover:opacity-80 cursor-pointer"
              style={{
                background: copied ? "#22c55e" : "var(--border)",
                color: copied ? "var(--card)" : "var(--foreground)",
              }}
            >
              <LinkIcon />
              {copied ? "COPIED!" : "COPY BOOKING LINK"}
            </button>
          </div>

          <AvailabilitySection />

          <div className="rounded-xl border border-border p-5 flex flex-col gap-4 bg-card">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                Earnings
              </p>
              <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground">
                {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase()}
              </p>
            </div>

            <div>
              {earningsLoading ? (
                <Skeleton className="h-9 w-36 rounded-lg" />
              ) : (
                <p className="text-3xl font-bold text-foreground">
                  ₮{Number(earnings ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              )}
            </div>

            <Link
              href="/dashboard/transactions"
              className="flex items-center gap-1.5 text-xs font-semibold self-start px-3 h-8 rounded-full transition-opacity hover:opacity-80"
              style={{ background: "var(--muted)", color: "var(--foreground)" }}
            >
              SEE TRANSACTIONS
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>

            <div
              className="flex rounded-xl overflow-hidden bg-muted"
            >
              {PERIOD_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActivePeriod(tab)}
                  className="flex-1 h-9 text-[10px] font-bold tracking-widest transition-all cursor-pointer"
                  style={{
                    background: activePeriod === tab ? "var(--foreground)" : "transparent",
                    color: activePeriod === tab ? "var(--card)" : "var(--muted-foreground)",
                    borderRadius: activePeriod === tab ? "0.75rem" : "0",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border p-5 flex flex-col gap-3 bg-card">
            <div>
              <p className="text-sm font-semibold text-foreground">Get ready to get paid</p>
              <p className="text-xs mt-1 leading-relaxed text-muted-foreground">
                We partner with QPAY for secure payments.
              </p>
            </div>
            <Button
              disabled
              className="w-full rounded-full h-10 text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 opacity-80"
              style={{ background: "var(--foreground)", color: "var(--card)" }}
            >
              <PayoutIcon />
              REQUEST PAYOUT
            </Button>
          </div>

          <div className="rounded-xl border border-border p-5 flex items-start gap-4 bg-card">
            <div className="shrink-0 mt-0.5 text-muted-foreground">
              <ShieldIcon />
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-foreground">
                Artist Chargeback Protection
              </p>
              <p className="text-xs mt-1.5 leading-relaxed text-muted-foreground">
                We&apos;ve got your back. If your client files a chargeback on eligible deposits and payments, we cover the cost.{" "}
                <a href="#" className="underline text-muted-foreground">Learn more</a>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
