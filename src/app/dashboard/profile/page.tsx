"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

type Artist = {
  id: string;
  slug: string | null;
  displayName: string | null;
  instagramUsername: string | null;
  avatarUrl: string | null;
  bio: string | null;
  depositAmount: string | null;
  studioLocation: string | null;
};

const PERIOD_TABS = ["TODAY", "WEEK", "MONTH", "YEAR"] as const;
type Period = (typeof PERIOD_TABS)[number];

function ExternalLinkIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 3h6v6M10 14L21 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PayoutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M2 10h20" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function ProfileSkeleton() {
  return (
    <div className="max-w-lg mx-auto px-4 pt-6 flex flex-col gap-4">
      <div className="flex flex-col items-center gap-3 py-4">
        <Skeleton className="w-20 h-20 rounded-full" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-9 flex-1 rounded-full" />
        <Skeleton className="h-9 flex-1 rounded-full" />
      </div>
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
      <Skeleton className="h-20 w-full rounded-2xl" />
    </div>
  );
}

export default function DashboardProfilePage() {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activePeriod, setActivePeriod] = useState<Period>("MONTH");
  const [earnings, setEarnings] = useState<number | null>(null);
  const [earningsLoading, setEarningsLoading] = useState(false);

  useEffect(() => {
    fetch("/api/artist/profile")
      .then((r) => r.json())
      .then((data) => setArtist(data.artist ?? null))
      .catch(() => setArtist(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadEarnings() {
      setEarningsLoading(true);
      try {
        const r = await fetch(`/api/artist/earnings?period=${activePeriod.toLowerCase()}`);
        const data = await r.json();
        if (!cancelled) setEarnings(data.total ?? 0);
      } catch {
        if (!cancelled) setEarnings(0);
      } finally {
        if (!cancelled) setEarningsLoading(false);
      }
    }
    loadEarnings();
    return () => { cancelled = true; };
  }, [activePeriod]);

  function handleCopyLink() {
    const handle = artist?.slug ?? artist?.instagramUsername ?? "";
    const url = `${window.location.origin}/@${handle}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  if (loading) return (
    <div className="min-h-screen bg-inkby-canvas">
      <ProfileSkeleton />
    </div>
  );

  if (!artist) return (
    <div className="min-h-screen flex items-center justify-center bg-inkby-canvas">
      <p className="text-sm text-inkby-fg-muted">Profile not found.</p>
    </div>
  );

  const handle = artist.slug ?? artist.instagramUsername ?? "";
  const displayName = artist.displayName ?? (handle ? `@${handle}` : "Artist");
  const initials = displayName.replace("@", "").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen pb-24 lg:pb-8 bg-inkby-canvas">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="flex items-center px-4 pt-5 pb-2 relative">
          <Link
            href="/dashboard"
            className="absolute left-4 w-8 h-8 flex items-center justify-center rounded-full transition-opacity hover:opacity-70 text-inkby-fg"
            aria-label="Back"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <p className="text-sm font-semibold mx-auto text-inkby-fg">Profile</p>
        </div>

        <div className="px-4 flex flex-col gap-4 pt-3">

          {/* Artist identity */}
          <div className="flex flex-col items-center gap-2 pt-2 pb-1">
            <div className="relative w-20 h-20 rounded-full overflow-hidden shrink-0 bg-inkby-border">
              {artist.avatarUrl ? (
                <Image src={artist.avatarUrl} alt={displayName} fill className="object-cover" unoptimized />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg font-semibold text-inkby-fg-muted">
                  {initials}
                </div>
              )}
            </div>
            <p className="text-base font-bold text-inkby-fg">{displayName}</p>
            {handle && (
              <a
                href={`/@${handle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs transition-opacity hover:opacity-70 text-inkby-fg-subtle"
              >
                venue.inkl/@{handle}
                <ExternalLinkIcon />
              </a>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Link
              href="/dashboard/profile/edit"
              className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-full text-xs font-semibold tracking-wide transition-opacity hover:opacity-80"
              style={{ background: "var(--inkby-fg)", color: "var(--inkby-surface)" }}
            >
              <EditIcon />
              EDIT PROFILE
            </Link>
            <button
              onClick={handleCopyLink}
              className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-full text-xs font-semibold tracking-wide transition-opacity hover:opacity-80 cursor-pointer"
              style={{
                background: copied ? "var(--inkby-success)" : "var(--inkby-border)",
                color: copied ? "var(--inkby-surface)" : "var(--inkby-fg)",
              }}
            >
              <LinkIcon />
              {copied ? "COPIED!" : "COPY BOOKING LINK"}
            </button>
          </div>

          {/* Earnings card */}
          <div className="rounded-2xl p-5 flex flex-col gap-4 bg-inkby-surface">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-inkby-fg-placeholder">
                Earnings
              </p>
              <p className="text-[10px] font-semibold tracking-widest uppercase text-inkby-fg-placeholder">
                {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase()}
              </p>
            </div>

            <div>
              {earningsLoading ? (
                <Skeleton className="h-9 w-36 rounded-lg" />
              ) : (
                <p className="text-3xl font-bold text-inkby-fg">
                  ₮{Number(earnings ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              )}
            </div>

            <Link
              href="/dashboard/transactions"
              className="flex items-center gap-1.5 text-xs font-semibold self-start px-3 h-8 rounded-full transition-opacity hover:opacity-80"
              style={{ background: "var(--inkby-surface-soft)", color: "var(--inkby-fg)" }}
            >
              SEE TRANSACTIONS
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>

            {/* Period tabs */}
            <div
              className="flex rounded-xl overflow-hidden bg-inkby-surface-soft"
            >
              {PERIOD_TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActivePeriod(tab)}
                  className="flex-1 h-9 text-[10px] font-bold tracking-widest transition-all cursor-pointer"
                  style={{
                    background: activePeriod === tab ? "var(--inkby-fg)" : "transparent",
                    color: activePeriod === tab ? "var(--inkby-surface)" : "var(--inkby-fg-muted)",
                    borderRadius: activePeriod === tab ? "0.75rem" : "0",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Get ready to get paid */}
          <div className="rounded-2xl p-5 flex flex-col gap-3 bg-inkby-surface">
            <div>
              <p className="text-sm font-semibold text-inkby-fg">Get ready to get paid</p>
              <p className="text-xs mt-1 leading-relaxed text-inkby-fg-muted">
                We partner with QPAY for secure payments.
              </p>
            </div>
            <Button
              disabled
              className="w-full rounded-full h-10 text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 opacity-80"
              style={{ background: "var(--inkby-fg)", color: "var(--inkby-surface)" }}
            >
              <PayoutIcon />
              REQUEST PAYOUT
            </Button>
          </div>

          {/* Artist Chargeback Protection */}
          <div className="rounded-2xl p-5 flex items-start gap-4 bg-inkby-surface">
            <div className="shrink-0 mt-0.5 text-inkby-fg-placeholder">
              <ShieldIcon />
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-inkby-fg">
                Artist Chargeback Protection
              </p>
              <p className="text-xs mt-1.5 leading-relaxed text-inkby-fg-muted">
                We&apos;ve got your back. If your client files a chargeback on eligible deposits and payments, we cover the cost.{" "}
                <a href="#" className="underline text-inkby-fg-muted">Learn more</a>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
