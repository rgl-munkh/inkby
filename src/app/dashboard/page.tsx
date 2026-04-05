"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

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

type Artist = {
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

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function RequestCard({ request }: { request: BookingRequest }) {
  const photo = request.photos?.[0]?.photoUrl;

  return (
    <Link
      href={`/dashboard/requests/${request.id}`}
      className="rounded-2xl overflow-hidden block transition-opacity hover:opacity-90"
      style={{ background: "#fff" }}
    >
      {photo ? (
        <div className="relative w-full h-96">
          <Image src={photo} alt="Reference" fill className="object-cover" unoptimized />
        </div>
      ) : (
        <div className="w-full h-48 flex items-center justify-center" style={{ background: "#e8e4dc" }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="#b0aca6" strokeWidth="1.5" />
            <circle cx="8.5" cy="8.5" r="1.5" stroke="#b0aca6" strokeWidth="1.5" />
            <path d="M21 15l-5-5L5 21" stroke="#b0aca6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
      <div className="p-4 flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>
            {request.firstName} {request.lastName}
          </p>
          <span className="text-xs shrink-0" style={{ color: "#9e9a94" }}>{timeAgo(request.createdAt)}</span>
        </div>
        <p className="text-xs line-clamp-2" style={{ color: "#6b6b6b" }}>
          {request.ideaDescription}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs font-medium" style={{ color: "#9e9a94" }}>#{request.placement}</span>
          <span className="text-xs font-medium" style={{ color: "#9e9a94" }}>#{request.tattooSize}</span>
        </div>
      </div>
    </Link>
  );
}

function RequestsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="rounded-2xl overflow-hidden" style={{ background: "#fff" }}>
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
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(`${window.location.origin}/@${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <ShareIcon />
      <div className="text-center">
        <p className="font-semibold text-base" style={{ color: "#1a1a1a" }}>All done!</p>
        <p className="text-sm mt-1" style={{ color: "#9e9a94" }}>
          Keep sharing your booking link to get more requests
        </p>
      </div>
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 border rounded-full px-5 py-2.5 text-xs font-medium transition-opacity hover:opacity-70 cursor-pointer"
        style={{ borderColor: "#c8c4bc", color: "#1a1a1a", background: "transparent" }}
      >
        {copied ? <CheckIcon /> : <LinkIcon />}
        {copied ? "COPIED!" : "COPY BOOKING LINK"}
      </button>
    </div>
  );
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [artist, setArtist] = useState<Artist | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/artist/profile")
      .then((r) => r.json())
      .then((data) => setArtist(data.artist ?? null))
      .catch(() => null);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/booking-requests?status=${activeTab}&limit=50`)
      .then((r) => r.json())
      .then((data) => {
        setRequests(data.booking_requests ?? []);
        setCounts((prev) => ({
          ...prev,
          [activeTab]: data.pagination?.total ?? 0,
        }));
      })
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, [activeTab]);

  const slug = artist?.slug ?? "";

  function handleInviteCopy() {
    if (!slug) return;
    navigator.clipboard.writeText(`${window.location.origin}/@${slug}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Mobile top bar */}
      <div
        className="flex lg:hidden items-center justify-between px-4 py-3 sticky top-0 z-10"
        style={{ background: "#EBE7DF" }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold"
          style={{ background: "#d6d0c8", color: "#6b6b6b" }}
        >
          {artist?.displayName?.charAt(0) ?? artist?.instagramUsername?.charAt(0) ?? "A"}
        </div>
        <button
          onClick={handleInviteCopy}
          className="border rounded-full px-4 py-1.5 text-xs font-semibold tracking-widest uppercase transition-opacity hover:opacity-70 cursor-pointer"
          style={{ borderColor: "#c8c4bc", color: "#1a1a1a", background: "transparent" }}
        >
          {copied ? "COPIED!" : "INVITE FRIENDS"}
        </button>
      </div>

      {/* Tabs + content */}
      <div className="flex-1 px-4 pt-4 max-w-xl mx-auto lg:px-6 lg:pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList
            variant="line"
            className="w-full h-auto justify-start gap-0 p-0 mb-4 border-b rounded-none"
            style={{ borderColor: "#d1cdc6" }}
          >
            {TABS.map(({ label, value }) => {
              const count = counts[value];
              return (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="text-xs font-semibold tracking-wide px-4 py-2.5 rounded-none gap-1.5 h-auto"
                  style={{ color: activeTab === value ? "#1a1a1a" : "#9e9a94" }}
                >
                  {label}
                  {count != null && count > 0 && (
                    <span
                      className="w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center"
                      style={{ background: "#1a1a1a", color: "#fff" }}
                    >
                      {count > 9 ? "9+" : count}
                    </span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {TABS.map(({ value }) => (
            <TabsContent key={value} value={value} className="w-full">
              {loading ? (
                <RequestsSkeleton />
              ) : requests.length === 0 ? (
                <EmptyState slug={slug} />
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {requests.map((req) => (
                    <RequestCard key={req.id} request={req} />
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
