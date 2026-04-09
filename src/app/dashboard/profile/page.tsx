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

type AvailableDate = {
  date: string;       // "YYYY-MM-DD"
  startTime: string;  // "HH:mm"
  endTime: string;    // "HH:mm"
};

function formatDateLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatTimeLabel(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function ClockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function TrashSmIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 6V4h6v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AvailabilitySection() {
  const [dates, setDates] = useState<AvailableDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Add-row local state
  const [addDate, setAddDate] = useState("");
  const [addStart, setAddStart] = useState("10:00");
  const [addEnd, setAddEnd] = useState("18:00");
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/artist/availability")
      .then((r) => r.json())
      .then((data) => {
        if (data.availableDates) {
          setDates(
            (data.availableDates as AvailableDate[]).map((r) => ({
              date: r.date,
              startTime: r.startTime,
              endTime: r.endTime,
            }))
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function handleAdd() {
    setAddError(null);
    if (!addDate) { setAddError("Pick a date"); return; }
    if (addEnd <= addStart) { setAddError("End time must be after start time"); return; }
    if (dates.some((d) => d.date === addDate)) { setAddError("Date already added"); return; }
    setDates((prev) =>
      [...prev, { date: addDate, startTime: addStart, endTime: addEnd }]
        .sort((a, b) => a.date.localeCompare(b.date))
    );
    setAddDate("");
  }

  function handleRemove(dateStr: string) {
    setDates((prev) => prev.filter((d) => d.date !== dateStr));
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const res = await fetch("/api/artist/availability", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dates),
      });
      if (!res.ok) {
        const data = await res.json();
        setSaveError(data.error ?? "Failed to save");
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      setSaveError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl p-5 flex flex-col gap-4 bg-inkby-surface">
      <div className="flex items-center gap-2">
        <span className="text-inkby-fg-placeholder"><ClockIcon /></span>
        <p className="text-xs font-bold tracking-widest uppercase text-inkby-fg">
          Available Dates
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-11 w-full rounded-xl" />)}
        </div>
      ) : (
        <>
          {/* Saved date list */}
          {dates.length === 0 ? (
            <p className="text-xs text-inkby-fg-muted text-center py-2">
              No available dates yet. Add one below.
            </p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {dates.map((row) => (
                <div
                  key={row.date}
                  className="flex items-center gap-3 rounded-xl px-3 h-11"
                  style={{ background: "var(--inkby-surface-soft)" }}
                >
                  <span className="flex-1 text-xs font-semibold text-inkby-fg truncate">
                    {formatDateLabel(row.date)}
                  </span>
                  <span className="text-xs text-inkby-fg-muted shrink-0">
                    {formatTimeLabel(row.startTime)} – {formatTimeLabel(row.endTime)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemove(row.date)}
                    aria-label={`Remove ${row.date}`}
                    className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full transition-opacity hover:opacity-60 cursor-pointer text-inkby-fg-muted"
                  >
                    <TrashSmIcon />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add row */}
          <div className="flex flex-col gap-2 pt-1">
            <p className="text-[10px] font-semibold tracking-widest uppercase text-inkby-fg-muted">
              Add a day
            </p>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={addDate}
                min={todayStr()}
                onChange={(e) => { setAddDate(e.target.value); setAddError(null); }}
                className="flex-1 h-9 rounded-xl px-3 text-xs outline-none min-w-0 cursor-pointer"
                style={{
                  background: "var(--inkby-surface-soft)",
                  color: "var(--inkby-fg)",
                  border: "1px solid var(--inkby-border)",
                }}
              />
              <input
                type="time"
                value={addStart}
                onChange={(e) => setAddStart(e.target.value)}
                className="w-24 h-9 rounded-xl px-2 text-xs outline-none cursor-pointer"
                style={{
                  background: "var(--inkby-surface-soft)",
                  color: "var(--inkby-fg)",
                  border: "1px solid var(--inkby-border)",
                }}
              />
              <span className="text-xs text-inkby-fg-muted shrink-0">–</span>
              <input
                type="time"
                value={addEnd}
                onChange={(e) => setAddEnd(e.target.value)}
                className="w-24 h-9 rounded-xl px-2 text-xs outline-none cursor-pointer"
                style={{
                  background: "var(--inkby-surface-soft)",
                  color: "var(--inkby-fg)",
                  border: "1px solid var(--inkby-border)",
                }}
              />
              <button
                type="button"
                onClick={handleAdd}
                className="shrink-0 h-9 px-3 rounded-xl text-xs font-semibold cursor-pointer transition-opacity hover:opacity-80"
                style={{ background: "var(--inkby-fg)", color: "var(--inkby-surface)" }}
              >
                + Add
              </button>
            </div>
            {addError && (
              <p className="text-xs text-inkby-error">{addError}</p>
            )}
          </div>
        </>
      )}

      {saveError && (
        <p className="text-xs text-inkby-error text-center">{saveError}</p>
      )}

      <Button
        onClick={handleSave}
        disabled={saving || loading}
        className="w-full rounded-full h-10 text-xs font-bold tracking-widest uppercase cursor-pointer"
        style={{
          background: saved ? "var(--inkby-success)" : "var(--inkby-fg)",
          color: "var(--inkby-surface)",
          opacity: saving || loading ? 0.7 : 1,
        }}
      >
        {saving ? "SAVING…" : saved ? "SAVED!" : "SAVE AVAILABILITY"}
      </Button>
    </div>
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

          {/* Available Dates */}
          <AvailabilitySection />

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
