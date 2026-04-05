"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";

type Photo = { id: string; photoUrl: string };
type Schedule = {
  id: string;
  privateNote: string | null;
  message: string | null;
  lowAmount: string;
  highAmount: string;
  durationMinutes: number;
  suggestedDatetime: string | null;
};

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
  photos: Photo[];
  schedules: Schedule[];
};

// --- Helper: parse "1h30m" / "2h" / "45m" → minutes ---
function parseDuration(str: string): number | null {
  const clean = str.trim().toLowerCase();
  const full = clean.match(/^(\d+)h(\d+)m?$/);
  if (full) return parseInt(full[1]) * 60 + parseInt(full[2]);
  const hoursOnly = clean.match(/^(\d+)h$/);
  if (hoursOnly) return parseInt(hoursOnly[1]) * 60;
  const minsOnly = clean.match(/^(\d+)m?$/);
  if (minsOnly) return parseInt(minsOnly[1]);
  return null;
}

// --- Helper: format minutes → "30 minutes" / "1 hour" / "1h 30m" ---
function formatDuration(mins: number): string {
  if (mins < 60) return `${mins} minute${mins !== 1 ? "s" : ""}`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `${h}h ${m}m` : `${h} hour${h > 1 ? "s" : ""}`;
}

const STATUS_BADGE: Record<string, string> = {
  scheduled: "Accepted",
  confirmed: "Confirmed",
  completed: "Done",
  cancelled: "Cancelled",
};

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AppointmentDetailsCard({
  request,
  schedule,
}: {
  request: BookingRequest;
  schedule: Schedule | null;
}) {
  const badgeLabel = STATUS_BADGE[request.status] ?? request.status;
  const dateText = schedule?.suggestedDatetime
    ? new Date(schedule.suggestedDatetime).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "Client will choose date";

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#fff" }}>
      {/* Header row */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: "#f0ede8" }}
      >
        <p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>
          Appointment details
        </p>
        <span
          className="text-xs font-semibold rounded-full px-3 py-1"
          style={{ background: "#f5a623", color: "#fff" }}
        >
          {badgeLabel}
        </span>
      </div>

      {/* Date row */}
      <div
        className="flex items-start gap-3 px-4 py-3 border-b"
        style={{ borderColor: "#f0ede8" }}
      >
        <span className="mt-0.5 shrink-0" style={{ color: "#9e9a94" }}><CalendarIcon /></span>
        <div>
          <p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>Date</p>
          <p className="text-xs mt-0.5" style={{ color: "#6b6b6b" }}>{dateText}</p>
        </div>
      </div>

      {/* Duration row */}
      <div className="flex items-start gap-3 px-4 py-3">
        <span className="mt-0.5 shrink-0" style={{ color: "#9e9a94" }}><ClockIcon /></span>
        <div>
          <p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>Duration</p>
          <p className="text-xs mt-0.5" style={{ color: "#6b6b6b" }}>
            {schedule ? formatDuration(schedule.durationMinutes) : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

// --- Icons ---
function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="18" cy="5" r="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="6" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="18" cy="19" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 6V4h6v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// --- Field wrapper used inside the sheet ---
function FieldBox({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "#9e9a94" }}>
        {label}
      </p>
      {children}
    </div>
  );
}

// --- Schedule Sheet ---
function ScheduleSheet({
  open,
  onOpenChange,
  request,
  onScheduled,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  request: BookingRequest;
  onScheduled: () => void;
}) {
  const photo = request.photos?.[0]?.photoUrl;
  const [duration, setDuration] = useState("1h30m");
  const [lowAmount, setLowAmount] = useState("");
  const [highAmount, setHighAmount] = useState("");
  const [dates, setDates] = useState<string[]>([""]);
  const [message, setMessage] = useState(
    `Hey ${request.firstName}, I'm so excited to work with you on this! Let me know if the dates work, if not we can find other times`
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function formatAmount(raw: string): string {
    const digits = raw.replace(/[^0-9]/g, "");
    if (!digits) return "";
    return Number(digits).toLocaleString("en-US");
  }

  function parseAmount(formatted: string): number {
    return parseFloat(formatted.replace(/,/g, ""));
  }

  function addDate() {
    setDates((prev) => [...prev, ""]);
  }

  function removeDate(i: number) {
    setDates((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateDate(i: number, val: string) {
    setDates((prev) => prev.map((d, idx) => (idx === i ? val : d)));
  }

  async function handleSubmit() {
    setError("");
    const durationMins = parseDuration(duration);
    if (!durationMins) {
      setError("Invalid duration. Use format like 1h30m, 2h, or 45m");
      return;
    }
    const low = parseAmount(lowAmount);
    const high = parseAmount(highAmount);
    if (!lowAmount || isNaN(low) || low <= 0) {
      setError("Enter a valid low estimate");
      return;
    }
    if (!highAmount || isNaN(high) || high <= 0) {
      setError("Enter a valid high estimate");
      return;
    }
    if (high < low) {
      setError("High estimate must be greater than or equal to low");
      return;
    }

    const suggested_dates = dates
      .filter(Boolean)
      .map((d) => ({ datetime: new Date(d).toISOString() }));

    setSubmitting(true);
    try {
      const res = await fetch(`/api/booking-requests/${request.id}/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duration_minutes: durationMins,
          suggested_dates,
          low_amount: low,
          high_amount: high,
          message: message.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Something went wrong");
        return;
      }

      onOpenChange(false);
      onScheduled();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md flex flex-col p-0 gap-0 overflow-y-auto"
        style={{ background: "#f5f2ed" }}
      >
        {/* Sheet header */}
        <SheetHeader className="px-5 pt-5 pb-4 shrink-0" style={{ background: "#f5f2ed" }}>
          <div className="flex items-start gap-3">
            <button
              onClick={() => onOpenChange(false)}
              className="mt-0.5 w-8 h-8 flex items-center justify-center rounded-full transition-opacity hover:opacity-60 cursor-pointer shrink-0"
              style={{ color: "#1a1a1a" }}
              aria-label="Close"
            >
              <BackIcon />
            </button>
            <div>
              <SheetTitle className="text-base font-semibold text-left" style={{ color: "#1a1a1a" }}>
                Schedule {request.firstName} {request.lastName}
              </SheetTitle>
              <SheetDescription className="text-[10px] font-semibold tracking-widest uppercase text-left mt-0.5" style={{ color: "#9e9a94" }}>
                Custom
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Booking summary */}
        <div className="px-5 pb-4">
          <div
            className="flex items-center gap-3 rounded-2xl p-3"
            style={{ background: "#fff" }}
          >
            {photo ? (
              <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0">
                <Image src={photo} alt="Reference" fill className="object-cover" unoptimized />
              </div>
            ) : (
              <div
                className="w-14 h-14 rounded-xl shrink-0 flex items-center justify-center"
                style={{ background: "#e8e4dc" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="#b0aca6" strokeWidth="1.5" />
                  <circle cx="8.5" cy="8.5" r="1.5" stroke="#b0aca6" strokeWidth="1.5" />
                  <path d="M21 15l-5-5L5 21" stroke="#b0aca6" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
            )}
            <div>
              <p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>
                {request.firstName} {request.lastName}
              </p>
              <div className="flex gap-1.5 mt-0.5 flex-wrap">
                <span className="text-xs font-medium" style={{ color: "#9e9a94" }}>#{request.tattooSize}</span>
                <span className="text-xs font-medium" style={{ color: "#9e9a94" }}>#{request.placement}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="px-5 flex flex-col gap-4 flex-1 pb-32">
          {/* Duration + Deposit */}
          <div className="grid grid-cols-2 gap-3">
            <FieldBox label="Duration">
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="1h30m"
                className="rounded-xl px-3 h-11 text-sm outline-none w-full"
                style={{ background: "#fff", color: "#1a1a1a", border: "1px solid #e2ddd6" }}
              />
            </FieldBox>
            <FieldBox label="Deposit">
              <div
                className="rounded-xl px-3 h-11 flex items-center text-sm"
                style={{ background: "#fff", color: "#9e9a94", border: "1px solid #e2ddd6" }}
              >
                ₮0
              </div>
            </FieldBox>
          </div>

          {/* Date pickers (visible when toggle is on) */}
          <div>
            <Label className="mb-1 text-[#9e9a94] text-[10px] font-semibold">PICK SPECIFIC DATE</Label>
            <div className="flex flex-col gap-2">
              {dates.map((d, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="datetime-local"
                    value={d}
                    onChange={(e) => updateDate(i, e.target.value)}
                    className="flex-1 rounded-xl px-3 h-11 text-sm outline-none"
                    style={{ background: "#fff", color: "#1a1a1a", border: "1px solid #e2ddd6" }}
                  />
                  {dates.length > 1 && (
                    <button
                      onClick={() => removeDate(i)}
                      className="w-8 h-8 flex items-center justify-center rounded-full transition-opacity hover:opacity-60 cursor-pointer"
                      style={{ color: "#9e9a94" }}
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addDate}
                className="flex items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-60 cursor-pointer"
                style={{ color: "#6b6b6b" }}
              >
                <PlusIcon />
                Add another date
              </button>
            </div>
          </div>

          {/* Estimate */}
          <FieldBox label="Estimate">
            <div className="grid grid-cols-2 gap-3">
              <FieldBox label="Low">
                <div className="flex items-center rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid #e2ddd6" }}>
                  <span className="pl-3 pr-1 text-sm shrink-0" style={{ color: "#9e9a94" }}>₮</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={lowAmount}
                    onChange={(e) => setLowAmount(formatAmount(e.target.value))}
                    placeholder="0"
                    className="flex-1 h-11 pr-3 text-sm outline-none bg-transparent"
                    style={{ color: "#1a1a1a" }}
                  />
                </div>
              </FieldBox>
              <FieldBox label="High">
                <div className="flex items-center rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid #e2ddd6" }}>
                  <span className="pl-3 pr-1 text-sm shrink-0" style={{ color: "#9e9a94" }}>₮</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={highAmount}
                    onChange={(e) => setHighAmount(formatAmount(e.target.value))}
                    placeholder="0"
                    className="flex-1 h-11 pr-3 text-sm outline-none bg-transparent"
                    style={{ color: "#1a1a1a" }}
                  />
                </div>
              </FieldBox>
            </div>
          </FieldBox>

          {/* Message */}
          <FieldBox label={`Message to ${request.firstName}`}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="rounded-2xl px-4 py-3 text-sm resize-none outline-none w-full"
              style={{ background: "#fff", color: "#1a1a1a", border: "1px solid #e2ddd6" }}
            />
          </FieldBox>

          {/* Error */}
          {error && (
            <p className="text-xs text-center" style={{ color: "#d94f4f" }}>{error}</p>
          )}
        </div>

        {/* Footer */}
        <div
          className=" w-full sm:max-w-md px-5 pb-6 pt-3 flex flex-col gap-3"
          style={{ background: "linear-gradient(to top, #f5f2ed 75%, transparent)" }}
        >
          <div className="flex items-center justify-center gap-1.5">
            <ShieldIcon />
            <p className="text-[10px]" style={{ color: "#9e9a94" }}>
              Covered by Artist Chargeback Protection
            </p>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full rounded-full h-12 text-xs font-bold tracking-widest uppercase cursor-pointer"
            style={{ background: "#1a1a1a", color: "#fff" }}
          >
            {submitting ? "SENDING..." : `SEND TO ${request.firstName.toUpperCase()} ${request.lastName.toUpperCase()}`}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// --- Skeletons / empty states ---
function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Skeleton className="w-full h-72 rounded-2xl" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="mt-4 space-y-3">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-40 mt-4" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  );
}

const QA_FIELDS = [
  { label: "TELL ME MORE ABOUT YOUR IDEA", key: "ideaDescription" },
  { label: "WHAT SIZE ARE YOU THINKING?", key: "tattooSize" },
  { label: "WHERE ON YOUR BODY?", key: "placement" },
] as const;

// --- Main page ---
export default function RequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [request, setRequest] = useState<BookingRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("appointment");
  const [sheetOpen, setSheetOpen] = useState(false);

  function fetchRequest() {
    fetch(`/api/booking-requests/${id}`)
      .then((r) => r.json())
      .then((data) => setRequest(data.booking_request ?? null))
      .catch(() => setRequest(null))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const photo = request?.photos?.[0]?.photoUrl;
  const latestSchedule = request?.schedules?.[0] ?? null;
  const isPending = request?.status === "pending";

  function handleDownload() {
    if (!photo) return;
    const a = document.createElement("a");
    a.href = photo;
    a.download = "reference.jpg";
    a.target = "_blank";
    a.click();
  }

  return (
    <div className="max-w-xl mx-auto flex flex-col min-h-screen" style={{ background: "#EBE7DF" }}>
      {/* Sticky header */}
      <div
        className="sticky top-0 z-20 flex items-center px-2 py-3 gap-2"
        style={{ background: "#EBE7DF" }}
      >
        <button
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-full transition-opacity hover:opacity-60 cursor-pointer shrink-0"
          style={{ color: "#1a1a1a" }}
          aria-label="Go back"
        >
          <BackIcon />
        </button>
        <h1 className="flex-1 text-center text-sm font-semibold pr-9 truncate" style={{ color: "#1a1a1a" }}>
          {loading ? (
            <Skeleton className="h-4 w-32 mx-auto" />
          ) : (
            `${request?.firstName ?? ""} ${request?.lastName ?? ""}`.trim() || "Request"
          )}
        </h1>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1">
        <TabsList
          variant="line"
          className="w-full h-auto justify-start gap-0 p-0 border-b rounded-none shrink-0 px-4"
          style={{ borderColor: "#d1cdc6", background: "#EBE7DF" }}
        >
          {(["appointment", "payment", "chat"] as const).map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="capitalize text-xs font-semibold tracking-wide px-4 py-2.5 rounded-none h-auto"
              style={{ color: activeTab === tab ? "#1a1a1a" : "#9e9a94" }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Appointment tab */}
        <TabsContent value="appointment" className="flex-1 pb-28">
          {loading ? (
            <DetailSkeleton />
          ) : !request ? (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm" style={{ color: "#9e9a94" }}>Request not found.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {/* Photo */}
              <div className="relative w-full h-72 bg-[#e8e4dc]">
                {photo ? (
                  <Image src={photo} alt="Reference" fill className="object-cover" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect x="3" y="3" width="18" height="18" rx="2" stroke="#b0aca6" strokeWidth="1.5" />
                      <circle cx="8.5" cy="8.5" r="1.5" stroke="#b0aca6" strokeWidth="1.5" />
                      <path d="M21 15l-5-5L5 21" stroke="#b0aca6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
                {photo && (
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button
                      onClick={handleDownload}
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-70 cursor-pointer"
                      style={{ background: "rgba(255,255,255,0.85)", color: "#1a1a1a" }}
                      aria-label="Download photo"
                    >
                      <DownloadIcon />
                    </button>
                    <button
                      onClick={() => navigator.share?.({ url: photo })}
                      className="w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-70 cursor-pointer"
                      style={{ background: "rgba(255,255,255,0.85)", color: "#1a1a1a" }}
                      aria-label="Share photo"
                    >
                      <ShareIcon />
                    </button>
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="px-4 pt-4 flex flex-col gap-4">
                {/* Idea + tags */}
                <div className="flex flex-col gap-1.5">
                  <p className="text-sm" style={{ color: "#1a1a1a" }}>
                    {request.ideaDescription}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium" style={{ color: "#9e9a94" }}>#{request.placement}</span>
                    <span className="text-xs font-medium" style={{ color: "#9e9a94" }}>#{request.tattooSize}</span>
                    <span
                      className="text-xs rounded-full px-2.5 py-0.5 font-medium"
                      style={{ background: "#e2ddd6", color: "#6b6b6b" }}
                    >
                      Custom
                    </span>
                  </div>
                </div>

                {/* Private notes / Appointment details */}
                {isPending ? (
                  <>
                    {/* Private notes */}
                    <div className="rounded-2xl p-4 flex flex-col gap-1" style={{ background: "#fff" }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span style={{ color: "#9e9a94" }}><NoteIcon /></span>
                          <span className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>Private notes</span>
                        </div>
                        <button
                          className="text-xs font-semibold tracking-widest uppercase transition-opacity hover:opacity-60 cursor-pointer"
                          style={{ color: "#9e9a94" }}
                        >
                          ADD
                        </button>
                      </div>
                      {latestSchedule?.privateNote ? (
                        <p className="text-xs mt-1" style={{ color: "#6b6b6b" }}>
                          {latestSchedule.privateNote}
                        </p>
                      ) : (
                        <p className="text-xs" style={{ color: "#b0aca6" }}>Not visible to clients</p>
                      )}
                    </div>

                    {/* Additional questions */}
                    <div className="rounded-2xl overflow-hidden" style={{ background: "#fff" }}>
                      <div className="px-4 pt-4 pb-2">
                        <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "#9e9a94" }}>
                          Additional Questions
                        </p>
                      </div>
                      <div className="flex flex-col divide-y" style={{ borderColor: "#f0ede8" }}>
                        {QA_FIELDS.map(({ label, key }) => (
                          <div key={key} className="px-4 py-3 flex flex-col gap-0.5">
                            <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "#b0aca6" }}>
                              {label}
                            </p>
                            <p className="text-sm" style={{ color: "#1a1a1a" }}>
                              {request[key]}
                            </p>
                          </div>
                        ))}
                        <div className="px-4 py-3 flex flex-col gap-0.5">
                          <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "#b0aca6" }}>
                            CONTACT
                          </p>
                          <p className="text-sm" style={{ color: "#1a1a1a" }}>{request.email}</p>
                          <p className="text-sm" style={{ color: "#6b6b6b" }}>{request.phone}</p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <AppointmentDetailsCard request={request} schedule={latestSchedule} />
                )}
              </div>
            </div>
          )}
        </TabsContent>

        {/* Payment tab */}
        <TabsContent value="payment" className="flex-1 flex items-center justify-center">
          <p className="text-sm" style={{ color: "#9e9a94" }}>Coming soon</p>
        </TabsContent>

        {/* Chat tab */}
        <TabsContent value="chat" className="flex-1 flex items-center justify-center">
          <p className="text-sm" style={{ color: "#9e9a94" }}>Coming soon</p>
        </TabsContent>
      </Tabs>

      {/* Sticky SCHEDULE button */}
      {!loading && request && (
        <div
          className="mx-auto max-w-xl fixed bottom-0 left-0 right-0 lg:left-44 px-4 pb-6 pt-3 z-20"
          style={{ background: "linear-gradient(to top, #EBE7DF 70%, transparent)" }}
        >
          <Button
            onClick={() => setSheetOpen(true)}
            className="w-full rounded-full h-12 text-xs font-bold tracking-widest uppercase cursor-pointer"
            style={{ background: "#1a1a1a", color: "#fff" }}
          >
            {isPending ? "SCHEDULE" : "EDIT APPOINTMENT"}
          </Button>
        </div>
      )}

      {/* Schedule sheet */}
      {request && (
        <ScheduleSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          request={request}
          onScheduled={() => {
            setLoading(true);
            fetchRequest();
          }}
        />
      )}
    </div>
  );
}
