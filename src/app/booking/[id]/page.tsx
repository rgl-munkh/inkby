"use client";

import { useState, useEffect, useRef } from "react";
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

type Appointment = {
  id: string;
  status: string;
};

type BookingRequest = {
  id: string;
  firstName: string;
  lastName: string;
  status: string;
  photos: { photoUrl: string }[];
  schedules: Schedule[];
  appointment: Appointment | null;
  artist: Artist;
};

type QPayInvoice = {
  invoice_id: string;
  qr_image: string;
  qr_text: string;
  urls: Array<{ name: string; description?: string; logo?: string; link: string }>;
  amount: number;
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

function formatAmount(amount: string | number): string {
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

function CheckCircleIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

function QRIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="5" y="5" width="4" height="4" fill="currentColor" rx="0.5" />
      <rect x="13" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="15" y="5" width="4" height="4" fill="currentColor" rx="0.5" />
      <rect x="3" y="13" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <rect x="5" y="15" width="4" height="4" fill="currentColor" rx="0.5" />
      <path d="M13 13h3v3h-3zM16 16h3v3h-3zM13 19h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
          <SheetTitle className="text-base font-semibold text-left text-inkby-fg">
            Choose a time
          </SheetTitle>
          <SheetDescription className="text-xs text-left text-inkby-fg-muted">
            Pick your preferred date and time for the appointment.
          </SheetDescription>
        </SheetHeader>
        <input
          type="datetime-local"
          value={chosen}
          onChange={(e) => setChosen(e.target.value)}
          className="w-full rounded-xl px-4 h-12 placeholder:text-sm outline-none"
          style={{ background: "var(--inkby-surface-warm)", color: "var(--inkby-fg)", border: "1px solid var(--inkby-border)" }}
        />
        {error && (
          <p className="text-xs text-center text-inkby-error">{error}</p>
        )}
        <Button
          onClick={handleSubmit}
          disabled={!chosen || submitting}
          className="w-full rounded-full h-12 text-xs font-bold tracking-widest uppercase cursor-pointer"
          style={{ background: "var(--inkby-fg)", color: "var(--inkby-surface)" }}
        >
          {submitting ? "CONFIRMING..." : "CONFIRM APPOINTMENT"}
        </Button>
      </SheetContent>
    </Sheet>
  );
}

function PaymentSheet({
  open,
  onOpenChange,
  appointmentId,
  onPaymentSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  appointmentId: string;
  onPaymentSuccess: () => void;
}) {
  const [invoice, setInvoice] = useState<QPayInvoice | null>(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [invoiceError, setInvoiceError] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "paid" | "checking">("pending");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!open) {
      setInvoice(null);
      setInvoiceError("");
      setPaymentStatus("pending");
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }

    async function fetchInvoice() {
      setLoadingInvoice(true);
      setInvoiceError("");
      try {
        const res = await fetch("/api/qpay/create-invoice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ appointment_id: appointmentId }),
        });
        const data = await res.json();
        if (!res.ok) {
          setInvoiceError(data.error ?? "Failed to create payment. Please try again.");
          return;
        }
        setInvoice(data as QPayInvoice);
        startPolling(appointmentId);
      } catch {
        setInvoiceError("Network error. Please try again.");
      } finally {
        setLoadingInvoice(false);
      }
    }

    void fetchInvoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, appointmentId]);

  function startPolling(apptId: string) {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        setPaymentStatus("checking");
        const res = await fetch(`/api/qpay/check/${apptId}`);
        const data = await res.json();
        if (res.ok && data.payment?.status === "paid") {
          clearInterval(pollRef.current!);
          setPaymentStatus("paid");
          setTimeout(() => {
            onOpenChange(false);
            onPaymentSuccess();
          }, 1500);
        } else {
          setPaymentStatus("pending");
        }
      } catch {
        setPaymentStatus("pending");
      }
    }, 3000);
  }

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl p-6 flex flex-col gap-5 max-h-[90dvh] overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle className="text-base font-semibold text-left text-inkby-fg">
            Pay deposit
          </SheetTitle>
          <SheetDescription className="text-xs text-left text-inkby-fg-muted">
            Scan the QR code or open your bank app to pay the deposit and lock in your appointment.
          </SheetDescription>
        </SheetHeader>

        {loadingInvoice && (
          <div className="flex flex-col items-center gap-3 py-8">
            <Skeleton className="w-48 h-48 rounded-2xl" />
            <Skeleton className="h-4 w-24" />
            <div className="grid grid-cols-2 gap-2 w-full pt-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-11 rounded-xl" />
              ))}
            </div>
          </div>
        )}

        {invoiceError && !loadingInvoice && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <p className="text-sm text-inkby-error">{invoiceError}</p>
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="rounded-full text-xs"
            >
              Close
            </Button>
          </div>
        )}

        {paymentStatus === "paid" && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <span className="text-inkby-success"><CheckCircleIcon size={48} /></span>
            <p className="text-base font-semibold text-inkby-fg">Deposit paid!</p>
            <p className="text-xs text-inkby-fg-muted">Your appointment is confirmed.</p>
          </div>
        )}

        {invoice && paymentStatus !== "paid" && !loadingInvoice && (
          <>
            {/* Deposit amount */}
            <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-inkby-surface-soft">
              <div>
                <p className="text-[10px] font-semibold tracking-widest uppercase text-inkby-fg-placeholder">
                  Deposit amount
                </p>
                <p className="text-xl font-bold mt-0.5 text-inkby-fg">
                  ₮{formatAmount(invoice.amount)}
                </p>
              </div>
              <span className="text-inkby-fg-placeholder"><QRIcon /></span>
            </div>

            {/* QR code */}
            <div className="flex flex-col items-center gap-2">
              <div
                className="rounded-2xl overflow-hidden p-3"
                style={{ background: "var(--inkby-surface)", border: "1px solid var(--inkby-border)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`data:image/png;base64,${invoice.qr_image}`}
                  alt="QPay QR code"
                  width={192}
                  height={192}
                  className="w-48 h-48 object-contain"
                />
              </div>
              <p className="text-[10px] text-inkby-fg-placeholder">
                {paymentStatus === "checking" ? "Checking payment..." : "Waiting for payment..."}
              </p>
            </div>

            {/* Bank app buttons */}
            {invoice.urls && invoice.urls.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-inkby-fg-placeholder">
                  Or open your bank app
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {invoice.urls.map((bank) => (
                    <a
                      key={bank.name}
                      href={bank.link}
                      className="flex items-center gap-2 px-3 h-11 rounded-xl text-xs font-medium transition-opacity hover:opacity-75 active:opacity-60"
                      style={{ background: "var(--inkby-surface-soft)", color: "var(--inkby-fg)" }}
                    >
                      {bank.logo && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={bank.logo}
                          alt=""
                          width={20}
                          height={20}
                          className="w-5 h-5 rounded object-contain shrink-0"
                        />
                      )}
                      <span className="truncate">{bank.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
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
  const [paymentSheetOpen, setPaymentSheetOpen] = useState(false);
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
      const refreshed = await fetch(`/api/booking-requests/${id}`).then((r) => r.json());
      setBooking(refreshed.booking_request ?? null);
    } catch {
      setConfirmError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handlePaymentSuccess() {
    setBooking((prev) =>
      prev && prev.appointment
        ? { ...prev, appointment: { ...prev.appointment, status: "paid" } }
        : prev
    );
  }

  if (loading) return <PageSkeleton />;

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-inkby-canvas">
        <p className="text-sm text-inkby-fg-muted">Booking not found.</p>
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

  const appointment = booking.appointment ?? null;
  const isPendingPayment = isConfirmed && appointment?.status === "pending_payment";
  const isPaid = isConfirmed && appointment?.status === "paid";

  return (
    <div className="min-h-screen pb-28 bg-inkby-canvas">
      <div className="max-w-lg mx-auto">
        {/* Artist header */}
        <div className="flex items-center gap-3 px-4 pt-6 pb-4">
          <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 bg-inkby-border">
            {artist.avatarUrl ? (
              <Image src={artist.avatarUrl} alt={artistName} fill className="object-cover" unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm font-semibold text-inkby-fg-muted">
                {artistName.replace("@", "").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-inkby-fg">{artistHandle}</p>
            <p className="text-xs text-inkby-fg-muted">
              {typeof window !== "undefined" ? window.location.host : "inkby.mn"}/{artistHandle}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList
            variant="line"
            className="w-full h-auto justify-start gap-0 p-0 border-b rounded-none px-4"
            style={{ borderColor: "var(--inkby-border-medium)", background: "transparent" }}
          >
            {(["appointment", "chat"] as const).map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="capitalize text-xs font-semibold tracking-wide px-4 py-2.5 rounded-none h-auto"
                style={{ color: activeTab === tab ? "var(--inkby-fg)" : "var(--inkby-fg-muted)" }}
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
                className="rounded-2xl p-6 flex flex-col items-center gap-2 text-center bg-inkby-surface"
              >
                <div className="text-inkby-fg-placeholder">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-inkby-fg">Waiting for artist to respond</p>
                <p className="text-xs text-inkby-fg-muted">
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
                    style={{
                      background: "var(--inkby-surface)",
                      border: isPaid
                        ? "1.5px solid var(--inkby-success)"
                        : isConfirmed
                        ? "1.5px solid var(--inkby-warning)"
                        : "1.5px solid transparent",
                    }}
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
                        style={{ background: "var(--inkby-surface-soft)", color: "var(--inkby-fg-muted)" }}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <rect x="3" y="4" width="18" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
                          <rect x="3" y="10" width="8" height="3" rx="1" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold tracking-widest uppercase text-inkby-fg-placeholder">
                          SESSION {i + 1}/{booking.schedules.length}
                        </p>
                        <p className="text-xs font-medium mt-0.5 text-inkby-fg">
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
                      <span className="text-inkby-fg-muted"><ArrowRightIcon /></span>
                    )}
                    {isPaid && (
                      <span className="text-inkby-success"><CheckCircleIcon /></span>
                    )}
                    {isPendingPayment && (
                      <span className="text-inkby-warning">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M12 7v5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                    )}
                  </div>
                ))}

                {/* Status section */}
                <div className="flex flex-col gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <span style={{ color: isPaid ? "var(--inkby-success)" : "var(--inkby-warning)" }}>
                      <CheckCircleIcon />
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-inkby-fg-muted">
                        Thanks {booking.firstName} {booking.lastName}!
                      </p>
                      <p className="text-sm font-semibold text-inkby-fg">
                        {isPaid
                          ? "Deposit paid — you're all set!"
                          : isPendingPayment
                          ? "Deposit required to lock in your slot."
                          : "Appointment confirmed."}
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
                      className="rounded-2xl p-4 flex items-center justify-between w-full text-left transition-opacity hover:opacity-80 cursor-pointer bg-inkby-surface"
                    >
                      <div>
                        <p className="text-xs font-semibold text-inkby-fg-muted">Book it yourself</p>
                        <p className="text-sm font-semibold mt-0.5 text-inkby-fg">Select a date and time</p>
                        {schedule && (
                          <p className="text-xs mt-0.5 text-inkby-fg-secondary">
                            Your estimate is ₮{formatAmount(schedule.lowAmount)} — ₮{formatAmount(schedule.highAmount)}
                          </p>
                        )}
                      </div>
                      <span className="text-inkby-success"><CalendarPlusIcon /></span>
                    </button>
                  )}

                  {/* Deposit paid badge */}
                  {isPaid && (
                    <div
                      className="rounded-2xl px-4 py-3 flex items-center gap-2"
                      style={{ background: "var(--inkby-success-bg)", border: "1px solid var(--inkby-success-border)" }}
                    >
                      <span className="text-inkby-success"><CheckCircleIcon /></span>
                      <p className="text-xs font-semibold text-inkby-success-fg">
                        Deposit paid successfully
                      </p>
                    </div>
                  )}

                  {/* Message from artist */}
                  {schedule?.message && (
                    <div className="rounded-2xl p-4 flex gap-3 bg-inkby-surface-soft">
                      <div
                        className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-semibold"
                        style={{ background: "var(--inkby-border)", color: "var(--inkby-fg-muted)" }}
                      >
                        {artistName.replace("@", "").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-inkby-fg-muted">
                          Message from {artistHandle}
                        </p>
                        <p className="text-sm mt-1 text-inkby-fg">
                          {schedule.message}
                        </p>
                        <p className="text-xs mt-1 text-inkby-fg-placeholder">
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
            <p className="text-sm text-inkby-fg-muted">Coming soon</p>
          </TabsContent>
        </Tabs>
      </div>

      {/* Sticky bottom button */}
      {(isScheduled || isPendingPayment) && (
        <div
          className="fixed bottom-0 left-0 right-0 px-4 pb-6 pt-3 z-20"
          style={{ background: "linear-gradient(to top, var(--inkby-canvas) 70%, transparent)" }}
        >
          <div className="max-w-lg mx-auto flex flex-col gap-2">
            {confirmError && (
              <p className="text-xs text-center text-inkby-error">{confirmError}</p>
            )}
            {isScheduled && (
              allDatesSet ? (
                <Button
                  onClick={() => void handleConfirm()}
                  disabled={submitting}
                  className="w-full rounded-full h-12 text-xs font-bold tracking-widest uppercase cursor-pointer flex items-center justify-center gap-2"
                  style={{ background: "var(--inkby-fg)", color: "var(--inkby-surface)" }}
                >
                  {submitting ? "CONFIRMING..." : "CONFIRM APPOINTMENT"}
                </Button>
              ) : (
                <Button
                  onClick={() => { setSelectedDatetime(null); setSheetOpen(true); }}
                  className="w-full rounded-full h-12 text-xs font-bold tracking-widest uppercase cursor-pointer flex items-center justify-center gap-2"
                  style={{ background: "var(--inkby-fg)", color: "var(--inkby-surface)" }}
                >
                  <CalendarIcon />
                  CHOOSE A TIME
                </Button>
              )
            )}
            {isPendingPayment && appointment && (
              <Button
                onClick={() => setPaymentSheetOpen(true)}
                className="w-full rounded-full h-12 text-xs font-bold tracking-widest uppercase cursor-pointer flex items-center justify-center gap-2"
                style={{ background: "var(--inkby-fg)", color: "var(--inkby-surface)" }}
              >
                <QRIcon />
                PAY DEPOSIT
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

      {/* Payment sheet */}
      {appointment && (
        <PaymentSheet
          open={paymentSheetOpen}
          onOpenChange={setPaymentSheetOpen}
          appointmentId={appointment.id}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
