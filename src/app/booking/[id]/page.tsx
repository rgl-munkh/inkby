"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
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

type Artist = {
  slug: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  instagramUsername: string | null;
};

type Schedule = {
  id: string;
  durationMinutes: number;
  suggestedDatetime: string | null;
  lowAmount: string;
  highAmount: string;
  message: string | null;
  createdAt: string;
};

type BookingRequest = {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
  photos: { photoUrl: string }[];
  schedules: Schedule[];
  artist: Artist;
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

function formatAmount(amount: string): string {
  return Number(amount).toLocaleString("en-US");
}

function CalendarPlusIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 14v4M10 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
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

function CheckCircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PageSkeleton() {
  return (
    <div className="max-w-lg mx-auto p-4 flex flex-col gap-4">
      <div className="flex items-center gap-3 py-4">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-36" />
        </div>
      </div>
      <Skeleton className="h-10 w-full rounded-xl" />
      <Skeleton className="h-20 w-full rounded-2xl" />
      <Skeleton className="h-20 w-full rounded-2xl" />
      <Skeleton className="h-28 w-full rounded-2xl" />
      <Skeleton className="h-24 w-full rounded-2xl" />
    </div>
  );
}

function ChooseTimeSheet({
  open,
  onOpenChange,
  onConfirm,
  submitting,
  error,
  prefillDatetime,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (datetime: string) => void;
  submitting: boolean;
  error: string;
  prefillDatetime?: string | null;
}) {
  const toLocalInput = (iso: string) => {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const [chosen, setChosen] = useState(prefillDatetime ? toLocalInput(prefillDatetime) : "");

  useEffect(() => {
    setChosen(prefillDatetime ? toLocalInput(prefillDatetime) : "");
  }, [prefillDatetime, open]);

  function handleSubmit() {
    if (!chosen) return;
    onConfirm(new Date(chosen).toISOString());
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl p-6 flex flex-col gap-5">
        <SheetHeader>
          <SheetTitle className="text-base font-semibold text-left" style={{ color: "#1a1a1a" }}>
            Choose a time
          </SheetTitle>
          <SheetDescription className="text-xs text-left" style={{ color: "#9e9a94" }}>
            Pick your preferred date and time for the appointment.
          </SheetDescription>
        </SheetHeader>
        <input
          type="datetime-local"
          value={chosen}
          onChange={(e) => setChosen(e.target.value)}
          className="w-full rounded-xl px-4 h-12 text-sm outline-none"
          style={{ background: "#f5f2ed", color: "#1a1a1a", border: "1px solid #e2ddd6" }}
        />
        {error && (
          <p className="text-xs text-center" style={{ color: "#d94f4f" }}>{error}</p>
        )}
        <Button
          onClick={handleSubmit}
          disabled={!chosen || submitting}
          className="w-full rounded-full h-12 text-xs font-bold tracking-widest uppercase cursor-pointer"
          style={{ background: "#1a1a1a", color: "#fff" }}
        >
          {submitting ? "CONFIRMING..." : "CONFIRM APPOINTMENT"}
        </Button>
      </SheetContent>
    </Sheet>
  );
}

export default function ClientBookingPage() {
  const params = useParams();
  const id = params.id as string;

  const [booking, setBooking] = useState<BookingRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("appointment");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedDatetime, setSelectedDatetime] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  useEffect(() => {
    fetch(`/api/booking-requests/${id}`)
      .then((r) => r.json())
      .then((data) => setBooking(data.booking_request ?? null))
      .catch(() => setBooking(null))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleConfirm(datetime?: string) {
    setConfirmError("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/booking-requests/${id}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datetime ? { chosen_datetime: datetime } : {}),
      });
      const data = await res.json();
      if (!res.ok) {
        setConfirmError(data.error ?? "Something went wrong");
        return;
      }
      setSheetOpen(false);
      setBooking((prev) => prev ? { ...prev, status: "confirmed" } : prev);
    } catch {
      setConfirmError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <PageSkeleton />;

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#EBE7DF" }}>
        <p className="text-sm" style={{ color: "#9e9a94" }}>Booking not found.</p>
      </div>
    );
  }

  const artist = booking.artist;
  const artistHandle = artist.slug ? `@${artist.slug}` : artist.instagramUsername ? `@${artist.instagramUsername}` : "Artist";
  const artistName = artist.displayName ?? artistHandle;
  const schedule = booking.schedules[0] ?? null;
  const isPending = booking.status === "pending";
  const isScheduled = booking.status === "scheduled";
  const isConfirmed = booking.status === "confirmed";
  const allDatesSet = booking.schedules.every((s) => s.suggestedDatetime !== null);

  return (
    <div className="min-h-screen pb-28" style={{ background: "#EBE7DF" }}>
      <div className="max-w-lg mx-auto">
        {/* Artist header */}
        <div className="flex items-center gap-3 px-4 pt-6 pb-4">
          <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0" style={{ background: "#e2ddd6" }}>
            {artist.avatarUrl ? (
              <Image src={artist.avatarUrl} alt={artistName} fill className="object-cover" unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm font-semibold" style={{ color: "#9e9a94" }}>
                {artistName.replace("@", "").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>{artistHandle}</p>
            <p className="text-xs" style={{ color: "#9e9a94" }}>
              inkby.mn/{artistHandle}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList
            variant="line"
            className="w-full h-auto justify-start gap-0 p-0 border-b rounded-none px-4"
            style={{ borderColor: "#d1cdc6", background: "transparent" }}
          >
            {(["appointment", "chat"] as const).map((tab) => (
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
          <TabsContent value="appointment" className="px-4 pt-4 flex flex-col gap-3">

            {/* Pending state */}
            {isPending && (
              <div
                className="rounded-2xl p-6 flex flex-col items-center gap-2 text-center"
                style={{ background: "#fff" }}
              >
                <div style={{ color: "#b0aca6" }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>Waiting for artist to respond</p>
                <p className="text-xs" style={{ color: "#9e9a94" }}>
                  {artistHandle} will review your request and send a schedule soon.
                </p>
              </div>
            )}

            {/* Scheduled / Confirmed state */}
            {(isScheduled || isConfirmed) && (
              <>
                {/* Session rows */}
                {booking.schedules.map((s, i) => (
                  <div
                    key={s.id}
                    className="rounded-2xl px-4 py-3 flex items-center justify-between cursor-pointer transition-opacity hover:opacity-80"
                    style={{ background: "#fff", border: isConfirmed ? "1.5px solid #22c55e" : "1.5px solid transparent" }}
                    onClick={() => {
                      if (isScheduled) {
                        setSelectedDatetime(s.suggestedDatetime ?? null);
                        setSheetOpen(true);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "#f0ede8", color: "#9e9a94" }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <rect x="3" y="4" width="18" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
                          <rect x="3" y="10" width="8" height="3" rx="1" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "#b0aca6" }}>
                          SESSION {i + 1}/{booking.schedules.length}
                        </p>
                        <p className="text-xs font-medium mt-0.5" style={{ color: "#1a1a1a" }}>
                          {s.suggestedDatetime
                            ? new Date(s.suggestedDatetime).toLocaleDateString("en-US", {
                                weekday: "short", month: "short", day: "numeric",
                                hour: "numeric", minute: "2-digit",
                              })
                            : "Client will choose date"}
                        </p>
                      </div>
                    </div>
                    {isScheduled && (
                      <span style={{ color: "#9e9a94" }}><ArrowRightIcon /></span>
                    )}
                    {isConfirmed && (
                      <span style={{ color: "#22c55e" }}><CheckCircleIcon /></span>
                    )}
                  </div>
                ))}

                {/* Thanks + confirm section */}
                <div className="flex flex-col gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <span style={{ color: "#22c55e" }}><CheckCircleIcon /></span>
                    <div>
                      <p className="text-xs font-semibold" style={{ color: "#9e9a94" }}>
                        Thanks {booking.firstName} {booking.lastName}!
                      </p>
                      <p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>
                        {isConfirmed ? "Appointment confirmed." : "Confirm your appointment."}
                      </p>
                    </div>
                  </div>

                  {/* Book it yourself card */}
                  {isScheduled && (
                    <button
                      onClick={() => {
                        setSelectedDatetime(null);
                        setSheetOpen(true);
                      }}
                      className="rounded-2xl p-4 flex items-center justify-between w-full text-left transition-opacity hover:opacity-80 cursor-pointer"
                      style={{ background: "#fff" }}
                    >
                      <div>
                        <p className="text-xs font-semibold" style={{ color: "#9e9a94" }}>Book it yourself</p>
                        <p className="text-sm font-semibold mt-0.5" style={{ color: "#1a1a1a" }}>Select a date and time</p>
                        {schedule && (
                          <p className="text-xs mt-0.5" style={{ color: "#6b6b6b" }}>
                            Your estimate is ₮{formatAmount(schedule.lowAmount)} — ₮{formatAmount(schedule.highAmount)}
                          </p>
                        )}
                      </div>
                      <span style={{ color: "#22c55e" }}><CalendarPlusIcon /></span>
                    </button>
                  )}

                  {/* Message from artist */}
                  {schedule?.message && (
                    <div className="rounded-2xl p-4 flex gap-3" style={{ background: "#f0ede8" }}>
                      <div
                        className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold"
                        style={{ background: "#e2ddd6", color: "#9e9a94" }}
                      >
                        {artistName.replace("@", "").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold" style={{ color: "#9e9a94" }}>
                          Message from {artistHandle}
                        </p>
                        <p className="text-sm mt-1" style={{ color: "#1a1a1a" }}>
                          {schedule.message}
                        </p>
                        <p className="text-xs mt-1" style={{ color: "#b0aca6" }}>
                          {timeAgo(schedule.createdAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </TabsContent>

          {/* Chat tab stub */}
          <TabsContent value="chat" className="px-4 pt-8 flex items-center justify-center">
            <p className="text-sm" style={{ color: "#9e9a94" }}>Coming soon</p>
          </TabsContent>
        </Tabs>
      </div>

      {/* Sticky confirm / choose time button */}
      {isScheduled && (
        <div
          className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 z-20"
          style={{ background: "linear-gradient(to top, #EBE7DF 70%, transparent)" }}
        >
          <div className="max-w-lg mx-auto flex flex-col gap-2">
            {confirmError && (
              <p className="text-xs text-center" style={{ color: "#d94f4f" }}>{confirmError}</p>
            )}
            {allDatesSet ? (
              <Button
                onClick={() => void handleConfirm()}
                disabled={submitting}
                className="w-full rounded-full h-12 text-xs font-bold tracking-widest uppercase cursor-pointer flex items-center justify-center gap-2"
                style={{ background: "#1a1a1a", color: "#fff" }}
              >
                {submitting ? "CONFIRMING..." : "CONFIRM APPOINTMENT"}
              </Button>
            ) : (
              <Button
                onClick={() => { setSelectedDatetime(null); setSheetOpen(true); }}
                className="w-full rounded-full h-12 text-xs font-bold tracking-widest uppercase cursor-pointer flex items-center justify-center gap-2"
                style={{ background: "#1a1a1a", color: "#fff" }}
              >
                <CalendarIcon />
                CHOOSE A TIME
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Choose time sheet */}
      <ChooseTimeSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onConfirm={handleConfirm}
        submitting={submitting}
        error={confirmError}
        prefillDatetime={selectedDatetime}
      />
    </div>
  );
}
