"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, timeAgo } from "@/lib/utils";
import { useClipboardCopy } from "@/hooks/use-clipboard-copy";
import { BOOKING_REQUEST_LIMIT } from "@/lib/constants";

type BookingRequest = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  ideaDescription: string;
  tattooSize: string;
  placement: string;
  status: string;
  createdAt: string;
  photos: { photoUrl: string }[];
};

type ArtistInfo = {
  slug: string | null;
  displayName: string | null;
  instagramUsername: string | null;
};

const TABS = [
  { label: "REQUESTS", value: "pending" },
  { label: "ACCEPTED", value: "scheduled" },
  { label: "UPCOMING", value: "confirmed" },
  { label: "PAST", value: "completed" },
] as const;

function ShareIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" stroke="#b0aca6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LinkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function RequestCard({
  request,
  priorityFirstPhoto = false,
}: {
  request: BookingRequest;
  priorityFirstPhoto?: boolean;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const photoUrls =
    request.photos?.flatMap((p) => (p.photoUrl ? [p.photoUrl] : [])) ?? [];
  const n = photoUrls.length;

  const updateActiveFromScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const w = el.clientWidth;
    if (w <= 0) return;
    setActiveIndex(Math.min(Math.round(el.scrollLeft / w), Math.max(0, n - 1)));
  }, [n]);

  return (
    <Link
      href={`/dashboard/requests/${request.id}`}
      className="rounded-2xl overflow-hidden block transition-opacity hover:opacity-90 bg-inkby-surface"
    >
      {n > 0 ? (
        <div className="relative w-full">
          <div
            ref={scrollRef}
            onScroll={updateActiveFromScroll}
            className="w-full overflow-x-auto scrollbar-none snap-x snap-mandatory flex"
          >
            {photoUrls.map((url, i) => (
              <div
                key={`${url}-${i}`}
                className="relative min-w-full shrink-0 h-96 snap-start"
              >
                <Image
                  src={url}
                  alt={n > 1 ? `Reference image ${i + 1} of ${n}` : "Reference"}
                  fill
                  sizes="(max-width: 1023px) 100vw, 36rem"
                  className="object-cover"
                  priority={priorityFirstPhoto && i === 0}
                />
              </div>
            ))}
          </div>
          <div
            className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 pointer-events-none"
            aria-hidden
          >
            {photoUrls.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1.5 w-1.5 shrink-0 rounded-full bg-white transition-opacity",
                  n === 1 || i === activeIndex ? "opacity-100" : "opacity-40",
                )}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="w-full h-48 flex items-center justify-center bg-inkby-surface-neutral">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="#b0aca6" strokeWidth="1.5" />
            <circle cx="8.5" cy="8.5" r="1.5" stroke="#b0aca6" strokeWidth="1.5" />
            <path d="M21 15l-5-5L5 21" stroke="#b0aca6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
      <div className="p-4 flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-inkby-fg">
            {request.firstName} {request.lastName}
          </p>
          <span className="text-xs shrink-0 text-inkby-fg-muted">{timeAgo(request.createdAt)}</span>
        </div>
        <p className="text-xs line-clamp-2 text-inkby-fg-secondary">
          {request.ideaDescription}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs font-medium text-inkby-fg-muted">#{request.placement}</span>
          <span className="text-xs font-medium text-inkby-fg-muted">#{request.tattooSize}</span>
        </div>
      </div>
    </Link>
  );
}

function RequestsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3 w-full">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-2xl overflow-hidden bg-inkby-surface">
          <Skeleton className="w-full h-48" />
          <div className="p-4 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-3.5 w-28" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ slug }: { slug: string }) {
  const { copied, copy } = useClipboardCopy();

  function handleCopy() {
    copy(`${window.location.origin}/@${slug}`);
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <ShareIcon />
      <div className="text-center">
        <p className="font-semibold text-base text-inkby-fg">All done!</p>
        <p className="text-sm mt-1 text-inkby-fg-muted">
          Keep sharing your booking link to get more requests
        </p>
      </div>
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 border rounded-full px-5 py-2.5 text-xs font-medium transition-opacity hover:opacity-70 cursor-pointer"
        style={{ borderColor: "var(--inkby-border-strong)", color: "var(--inkby-fg)", background: "transparent" }}
      >
        {copied ? <CheckIcon /> : <LinkIcon />}
        {copied ? "COPIED!" : "COPY BOOKING LINK"}
      </button>
    </div>
  );
}

export function RequestTabs({
  initialRequests,
  initialCount,
  artist,
}: {
  initialRequests: BookingRequest[];
  initialCount: number;
  artist: ArtistInfo;
}) {
  const [activeTab, setActiveTab] = useState("pending");
  const [requests, setRequests] = useState<BookingRequest[]>(initialRequests);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({ pending: initialCount });
  const { copied, copy: copyLink } = useClipboardCopy();

  useEffect(() => {
    if (activeTab === "pending") {
      // Reset to server-rendered inbox when switching back to Pending (matches original behavior).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRequests(initialRequests);
      setCounts((prev) => ({ ...prev, pending: initialCount }));
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`/api/booking-requests?status=${activeTab}&limit=${BOOKING_REQUEST_LIMIT}`)
      .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
      .then((data) => {
        setRequests(data.booking_requests ?? []);
        setCounts((prev) => ({
          ...prev,
          [activeTab]: data.pagination?.total ?? 0,
        }));
      })
      .catch(() => setError("Failed to load requests"))
      .finally(() => setLoading(false));
  }, [activeTab, initialRequests, initialCount]);

  const slug = artist.slug ?? "";

  function handleInviteCopy() {
    if (!slug) return;
    copyLink(`${window.location.origin}/@${slug}`);
  }

  return (
    <div className="flex flex-col">
      <div
        className="flex lg:hidden items-center justify-between px-4 py-3 sticky top-0 z-10 bg-inkby-canvas"
      >
        <Link
          href="/dashboard/profile"
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
          style={{ background: "var(--inkby-chip)", color: "var(--inkby-fg-secondary)" }}
        >
          {artist.displayName?.charAt(0) ?? artist.instagramUsername?.charAt(0) ?? "A"}
        </Link>
        <button
          onClick={handleInviteCopy}
          className="border rounded-full px-4 py-1.5 text-xs font-semibold tracking-widest uppercase transition-opacity hover:opacity-70 cursor-pointer"
          style={{ borderColor: "var(--inkby-border-strong)", color: "var(--inkby-fg)", background: "transparent" }}
        >
          {copied ? "COPIED!" : "INVITE FRIENDS"}
        </button>
      </div>

      <div className="px-2 lg:px-4 pt-4 lg:max-w-xl mx-auto lg:px-6 lg:pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="overflow-x-auto scrollbar-none -mx-4 lg:px-4 lg:-mx-6 lg:px-6">
            <TabsList
              variant="line"
              className="w-max min-w-full h-auto justify-start gap-0 p-0 mb-4 border-b rounded-none"
              style={{ borderColor: "var(--inkby-border-medium)" }}
            >
              {TABS.map(({ label, value }) => {
                const count = counts[value];
                return (
                  <TabsTrigger
                    key={value}
                    value={value}
                    className="text-xs font-semibold tracking-wide px-3 sm:px-4 py-2.5 rounded-none gap-1.5 h-auto"
                    style={{ color: activeTab === value ? "var(--inkby-fg)" : "var(--inkby-fg-muted)" }}
                  >
                    {label}
                    {count != null && count > 0 && (
                      <span
                        className="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
                        style={{ background: "var(--inkby-fg)", color: "var(--inkby-surface)" }}
                      >
                        {count > 9 ? "9+" : count}
                      </span>
                    )}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {TABS.map(({ value }) => (
            <TabsContent key={value} value={value} className="w-full">
              {loading ? (
                <RequestsSkeleton />
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
                  <p className="text-sm font-semibold text-inkby-fg">Something went wrong</p>
                  <p className="text-xs text-inkby-fg-muted">{error}</p>
                  <button
                    onClick={() => { setError(null); setActiveTab(value); }}
                    className="text-xs font-semibold underline text-inkby-fg-muted cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              ) : requests.length === 0 ? (
                <EmptyState slug={slug} />
              ) : (
                <div className="grid grid-cols-1 gap-y-3">
                  {requests.map((req, index) => (
                    <RequestCard
                      key={req.id}
                      request={req}
                      priorityFirstPhoto={index === 0}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
