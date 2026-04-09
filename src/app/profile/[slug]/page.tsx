"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Artist = {
  id: string;
  slug: string;
  displayName: string | null;
  instagramUsername: string | null;
  depositAmount: string | null;
  avatarUrl: string | null;
  bio: string | null;
};

type FlashSize = {
  id: string;
  sizeLabel: string;
  estimatedAmount: string;
  durationMinutes: number | null;
};

type FlashDeal = {
  id: string;
  photoUrl: string;
  title: string | null;
  isRepeatable: boolean;
  sizes: FlashSize[];
};

const SIZES = ["2.5-5 CM", "7.5-10 CM", "12.5-15 CM", "18+ CM"];
const PLACEMENTS = [
  "SHOULDER", "ARM", "BACK", "CHEST", "FOOT",
  "HAND", "LEG", "NECK", "OTHER",
];

function SmileyIcon({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" aria-hidden="true">
      <circle cx="40" cy="40" r="38" stroke="#c8c4bc" strokeWidth="2" fill="#e8e4dc" />
      <circle cx="30" cy="34" r="3" fill="#b0aca6" />
      <circle cx="50" cy="34" r="3" fill="#b0aca6" />
      <path d="M28 48c3 5 21 5 24 0" stroke="#b0aca6" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
      <path d="M14 8a6 6 0 0 0-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center w-8 h-8 rounded-full transition-colors hover:opacity-70 cursor-pointer"
      style={{ background: "var(--inkby-surface-neutral)", color: "var(--inkby-fg-secondary)" }}
      aria-label="Back"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

function PillSelect({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className="rounded-full px-3 py-1.5 text-xs font-medium border transition-all cursor-pointer"
          style={{
            background: value === opt ? "var(--inkby-fg)" : "transparent",
            color: value === opt ? "var(--inkby-surface)" : "var(--inkby-fg-secondary)",
            borderColor: value === opt ? "var(--inkby-fg)" : "var(--inkby-border-medium)",
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function QuestionCard({
  index,
  total,
  title,
  description,
  children,
}: {
  index: number;
  total: number;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl p-5 bg-inkby-surface">
      <p className="text-[10px] font-semibold tracking-widest uppercase mb-2 text-inkby-fg-placeholder">
        Question {index}/{total}
      </p>
      <h3 className="text-sm font-semibold mb-1 text-inkby-fg">{title}</h3>
      {description && (
        <p className="text-xs mb-3 text-inkby-fg-muted">{description}</p>
      )}
      {children}
    </div>
  );
}

// ─── Availability Panel ───────────────────────────────────────────────────────

type SlotEntry = { time: string; available: boolean };
type SlotDate = { date: string; startTime: string; endTime: string; slots: SlotEntry[] };

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function startOfWeek(d: Date): Date {
  const c = new Date(d);
  c.setDate(c.getDate() - c.getDay());
  c.setHours(0, 0, 0, 0);
  return c;
}

function formatSlotTime(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

function AvailabilityPanel({
  slug,
  onClose,
  onSelect,
}: {
  slug: string;
  onClose: () => void;
  onSelect: (datetime: string) => void;
}) {
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date()));
  const [slotDates, setSlotDates] = useState<SlotDate[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setSelectedDay(null);
      setSelectedSlot(null);
      try {
        const r = await fetch(`/api/artist/${slug}/slots?date=${toDateStr(weekStart)}`);
        const data = await r.json();
        if (cancelled) return;
        const dates: SlotDate[] = data.dates ?? [];
        setSlotDates(dates);
        if (dates.length > 0) setSelectedDay(dates[0].date);
      } catch {
        if (!cancelled) setSlotDates([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [weekStart, slug]);

  function prevWeek() {
    const prev = new Date(weekStart);
    prev.setDate(prev.getDate() - 7);
    setWeekStart(prev);
  }

  function nextWeek() {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + 7);
    setWeekStart(next);
  }

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const availableDateSet = new Set(slotDates.map((s) => s.date));
  const activeSlotDate = slotDates.find((s) => s.date === selectedDay);

  const monthLabel = `${MONTHS[weekStart.getMonth()]}`;

  function handleConfirm() {
    if (!selectedDay || !selectedSlot) return;
    onSelect(`${selectedDay}T${selectedSlot}`);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-end"
      style={{ background: "rgba(0,0,0,0.35)" }}
      onClick={onClose}
    >
      <div
        className="relative flex flex-col w-full max-w-sm h-full overflow-hidden"
        style={{ background: "var(--inkby-profile-canvas, #f5f0ea)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 pt-5 pb-3 shrink-0">
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full transition-opacity hover:opacity-70 cursor-pointer shrink-0"
            style={{ background: "var(--inkby-surface-neutral)", color: "var(--inkby-fg-secondary)" }}
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <p className="text-sm font-semibold text-inkby-fg">@{slug}&apos;s availability</p>
        </div>

        {/* Month + week navigation */}
        <div className="px-4 pb-3 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={prevWeek}
              className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-opacity hover:opacity-70"
              style={{ background: "var(--inkby-surface-neutral)", color: "var(--inkby-fg-secondary)" }}
              aria-label="Previous week"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <p className="text-sm font-bold text-inkby-fg">{monthLabel}</p>
            <button
              onClick={nextWeek}
              className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-opacity hover:opacity-70"
              style={{ background: "var(--inkby-surface-neutral)", color: "var(--inkby-fg-secondary)" }}
              aria-label="Next week"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          {/* Day strip */}
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((d) => {
              const ds = toDateStr(d);
              const hasSlots = availableDateSet.has(ds);
              const isSelected = selectedDay === ds;
              return (
                <button
                  key={ds}
                  type="button"
                  disabled={!hasSlots || loading}
                  onClick={() => { setSelectedDay(ds); setSelectedSlot(null); }}
                  className="flex flex-col items-center gap-0.5 py-2 rounded-xl transition-colors cursor-pointer disabled:cursor-not-allowed"
                  style={{
                    background: isSelected ? "var(--inkby-fg)" : "transparent",
                    opacity: !hasSlots ? 0.35 : 1,
                  }}
                >
                  <span
                    className="text-[9px] font-bold tracking-widest"
                    style={{ color: isSelected ? "var(--inkby-surface)" : "var(--inkby-fg-muted)" }}
                  >
                    {WEEK_DAYS[d.getDay()].toUpperCase()}
                  </span>
                  <span
                    className="text-base font-bold leading-tight"
                    style={{ color: isSelected ? "var(--inkby-surface)" : "var(--inkby-fg)" }}
                  >
                    {d.getDate()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Slot list */}
        <div className="flex-1 overflow-y-auto px-4 pb-32">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Spinner />
            </div>
          ) : !activeSlotDate ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <p className="text-sm font-semibold text-inkby-fg">No availability this week</p>
              <p className="text-xs text-inkby-fg-muted max-w-xs">
                Try navigating to another week.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-0">
              {activeSlotDate.slots.map((slot) => {
                const isChosen = selectedSlot === slot.time;
                return (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={!slot.available}
                    onClick={() => setSelectedSlot(slot.time)}
                    className="flex items-center justify-between py-3 px-1 border-b transition-opacity cursor-pointer disabled:cursor-not-allowed"
                    style={{
                      borderColor: "var(--inkby-border)",
                      opacity: slot.available ? 1 : 0.35,
                      background: isChosen ? "var(--inkby-surface-soft)" : "transparent",
                    }}
                  >
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "var(--inkby-fg)" }}
                    >
                      {formatSlotTime(slot.time)}
                    </span>
                    <span
                      className="text-xs font-semibold rounded-full px-3 py-1"
                      style={
                        isChosen
                          ? { background: "var(--inkby-fg)", color: "var(--inkby-surface)" }
                          : slot.available
                            ? { background: "var(--inkby-surface-neutral)", color: "var(--inkby-fg-secondary)" }
                            : { background: "transparent", color: "var(--inkby-fg-muted)" }
                      }
                    >
                      {slot.available ? "Available" : "Booked"}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer CTA */}
        <div
          className="absolute bottom-0 left-0 right-0 px-4 pb-8 pt-4"
          style={{ background: "linear-gradient(to top, var(--inkby-profile-canvas, #f5f0ea) 70%, transparent)" }}
        >
          <button
            type="button"
            disabled={!selectedSlot}
            onClick={handleConfirm}
            className="w-full h-12 rounded-full text-sm font-bold tracking-widest uppercase transition-opacity cursor-pointer disabled:cursor-not-allowed"
            style={{
              background: "var(--inkby-fg)",
              color: "var(--inkby-surface)",
              opacity: selectedSlot ? 1 : 0.45,
            }}
          >
            SELECT A DATE + TIME
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function ArtistProfilePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [step, setStep] = useState(0);
  const [bookingRequestId, setBookingRequestId] = useState<string | null>(null);
  const [showAvailability, setShowAvailability] = useState(false);
  const [chosenDatetime, setChosenDatetime] = useState<string | null>(null);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [flashDeals, setFlashDeals] = useState<FlashDeal[]>([]);
  const [loadingArtist, setLoadingArtist] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [idea, setIdea] = useState("");
  const [selectedFlashPhotoUrl, setSelectedFlashPhotoUrl] = useState<string | null>(null);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [size, setSize] = useState("");
  const [placement, setPlacement] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch(`/api/artist/${slug}`)
      .then((r) => {
        if (r.status === 404) { setNotFound(true); return null; }
        return r.json();
      })
      .then((data) => {
        if (data) {
          setArtist(data.artist);
          setFlashDeals(data.flash_deals ?? []);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoadingArtist(false));
  }, [slug]);

  const displayName = artist?.displayName ?? artist?.instagramUsername ?? slug;

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setPhotoFiles((prev) => [...prev, ...files]);
  }

  function removePhoto(index: number) {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function uploadPhotos(): Promise<string[]> {
    const urls: string[] = [];
    for (const file of photoFiles) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bucket", "reference-photos");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const data = await res.json();
        urls.push(data.url);
      }
    }
    return urls;
  }

  async function handleSubmit() {
    if (!artist) return;
    if (!validatePersonalStep()) return;
    if (!validateTattooStep()) return;

    setError("");
    setSubmitting(true);

    try {
      const uploadedUrls = await uploadPhotos();
      setPhotoUrls(uploadedUrls);
      const photo_urls = selectedFlashPhotoUrl
        ? [selectedFlashPhotoUrl, ...uploadedUrls]
        : uploadedUrls;

      const res = await fetch("/api/booking-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          artist_id: artist.id,
          first_name: firstName,
          last_name: lastName,
          phone,
          email,
          idea_description: idea,
          tattoo_size: size === "1-2 INCHES" ? "small"
            : size === "3-4 INCHES" ? "medium"
              : size === "5-6 INCHES" ? "large"
                : "extra-large",
          placement: placement.toLowerCase(),
          photo_urls,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }

      setStep(3);
      setBookingRequestId(data.booking_request?.id ?? null);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function validatePersonalStep() {
    if (!firstName.trim()) { setError("First name is required"); return false; }
    if (!lastName.trim()) { setError("Last name is required"); return false; }
    if (!phone.trim()) { setError("Phone number is required"); return false; }
    if (!email.trim()) { setError("Email is required"); return false; }
    return true;
  }

  function validateTattooStep() {
    if (!idea.trim()) { setError("Please describe your tattoo idea"); return false; }
    if (!size) { setError("Please select a tattoo size"); return false; }
    if (!placement) { setError("Please select a placement"); return false; }
    return true;
  }

  if (loadingArtist) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-inkby-profile-canvas">
        <Spinner />
      </main>
    );
  }

  if (notFound || !artist) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4 bg-inkby-profile-canvas">
        <SmileyIcon />
        <p className="text-sm font-medium text-inkby-fg-secondary">Artist not found</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col bg-inkby-profile-canvas">
      {/* ── Step 0: Profile landing ── */}
      {step === 0 && (
        <>
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-1">
              <button
                className="flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium cursor-pointer transition-opacity hover:opacity-70"
                style={{ borderColor: "var(--inkby-border-medium)", color: "var(--inkby-fg)", background: "transparent" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Profile
              </button>
              <button
                className="flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium cursor-pointer transition-opacity hover:opacity-70"
                style={{ borderColor: "transparent", color: "var(--inkby-fg-muted)", background: "transparent" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Customize
              </button>
            </div>
            <div className="flex items-center gap-3">
              <button className="cursor-pointer opacity-50 hover:opacity-100 transition-opacity" aria-label="Share">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" stroke="#6b6b6b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button className="cursor-pointer opacity-50 hover:opacity-100 transition-opacity" aria-label="Grid">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="3" y="3" width="7" height="7" rx="1" stroke="#6b6b6b" strokeWidth="1.5" />
                  <rect x="14" y="3" width="7" height="7" rx="1" stroke="#6b6b6b" strokeWidth="1.5" />
                  <rect x="3" y="14" width="7" height="7" rx="1" stroke="#6b6b6b" strokeWidth="1.5" />
                  <rect x="14" y="14" width="7" height="7" rx="1" stroke="#6b6b6b" strokeWidth="1.5" />
                </svg>
              </button>
            </div>
          </div>

          {/* Profile content */}
          <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6 py-12">
            {artist.avatarUrl ? (
              <div className="w-24 h-24 rounded-full overflow-hidden relative">
                <Image src={artist.avatarUrl} alt={displayName} fill className="object-cover" unoptimized />
              </div>
            ) : (
              <SmileyIcon size={96} />
            )}
            <p className="text-2xl font-bold tracking-tight text-inkby-fg">
              @{artist.slug}
            </p>
            {artist.bio && (
              <p className="text-sm text-center max-w-xs text-inkby-fg-secondary">{artist.bio}</p>
            )}
            <Button
              onClick={() => setStep(1)}
              className="w-full max-w-xs rounded-full h-12 text-sm font-semibold cursor-pointer mt-2"
              style={{ background: "var(--inkby-fg)", color: "var(--inkby-surface)" }}
            >
              Book a tattoo
            </Button>
            <button
              type="button"
              onClick={() => setShowAvailability(true)}
              className="w-full max-w-xs rounded-full h-10 text-xs font-semibold cursor-pointer transition-opacity hover:opacity-80 border"
              style={{
                background: "transparent",
                color: "var(--inkby-fg)",
                borderColor: "var(--inkby-border-medium)",
              }}
            >
              {chosenDatetime
                ? (() => {
                    const d = new Date(chosenDatetime);
                    return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
                  })()
                : "Check availability"}
            </button>

            {/* Flash gallery */}
            {flashDeals.length > 0 && (
              <div className="w-full max-w-xs mt-2">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-inkby-fg-muted">
                    Flash
                  </span>
                  <span
                    className="text-[10px] font-semibold rounded-full px-1.5 py-0.5 leading-none"
                    style={{ background: "var(--inkby-surface-neutral)", color: "var(--inkby-fg-secondary)" }}
                  >
                    {flashDeals.length}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {flashDeals.map((deal) => {
                    const minAmt = deal.sizes.length
                      ? Math.min(...deal.sizes.map((s) => Number(s.estimatedAmount)))
                      : null;
                    return (
                      <button
                        key={deal.id}
                        type="button"
                        onClick={() => {
                          setIdea(`I'm interested in your flash: ${deal.title ?? "Untitled"}`);
                          setSelectedFlashPhotoUrl(deal.photoUrl);
                          setStep(1);
                        }}
                        className="flex flex-col rounded-2xl overflow-hidden text-left transition-opacity hover:opacity-80 cursor-pointer bg-inkby-surface"
                      >
                        <div className="relative aspect-square w-full bg-inkby-surface-soft">
                          <Image src={deal.photoUrl} alt={deal.title ?? "Flash"} fill className="object-cover" unoptimized />
                        </div>
                        <div className="px-2.5 py-2 flex flex-col gap-0.5">
                          <p className="text-xs font-semibold truncate text-inkby-fg">
                            {deal.title ?? "Flash"}
                          </p>
                          <p className="text-[10px] text-inkby-fg-muted">
                            {deal.isRepeatable ? "Repeatable" : "Non-repeatable"}
                          </p>
                          {minAmt !== null && (
                            <p className="text-xs font-semibold text-inkby-fg">
                              ₮{minAmt.toLocaleString("en-US")}
                              {deal.sizes.length > 1 && (
                                <span className="text-[10px] font-normal text-inkby-fg-muted"> from</span>
                              )}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Bottom branding */}
          <div className="flex items-end justify-between px-6 pb-6 pt-4">
            <div className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 36 36" fill="none" aria-hidden="true">
                <rect width="36" height="36" rx="8" fill="#1a1a1a" />
                <path d="M18 7C18 7 11 15.5 11 21a7 7 0 0 0 14 0c0-5.5-7-14-7-14Z" fill="#f5e642" />
              </svg>
              <span className="text-xs font-bold tracking-widest uppercase text-inkby-fg">INKBY</span>
            </div>
            <p className="text-[10px] text-right text-inkby-fg-muted">
              Painlessly manage your<br />requests, books, and deposits
            </p>
          </div>
        </>
      )}

      {/* ── Step 1: Tattoo details ── */}
      {step === 1 && (
        <div className="flex flex-col min-h-screen px-5 py-4">
          <div className="mb-4">
            <BackButton onClick={() => { setError(""); setStep(0); }} />
          </div>

          {/* Artist mini header */}
          <div className="flex flex-col items-center gap-2 mb-6">
            {artist.avatarUrl ? (
              <div className="w-12 h-12 rounded-full overflow-hidden relative">
                <Image src={artist.avatarUrl} alt={displayName} fill className="object-cover" unoptimized />
              </div>
            ) : (
              <SmileyIcon size={48} />
            )}
            <p className="text-sm font-semibold text-inkby-fg">Book with @{artist.slug}</p>
          </div>

          <div className="flex flex-col gap-3 max-w-sm mx-auto w-full pb-8">
            {/* Q1: Idea */}
            <QuestionCard
              index={1}
              total={4}
              title="Tell me more about your idea"
              description="Write a sentence or two about what you're looking for."
            >
              <Textarea
                placeholder="E.g. A small floral piece on my forearm..."
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                rows={4}
                className="resize-none rounded-xl placeholder:text-sm"
                style={{ background: "var(--inkby-surface-warm)", borderColor: "var(--inkby-border)", color: "var(--inkby-fg)" }}
              />
            </QuestionCard>

            {/* Q2: Reference photos */}
            <QuestionCard
              index={2}
              total={4}
              title="Add reference photos"
              description="Include flash, sketches, or style references to give me an idea. If you're uploading my flash sheets, circle ones you're interested in before uploading."
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handlePhotoChange}
              />
              {photoFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {photoFiles.map((file, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden group">
                      <Image
                        src={URL.createObjectURL(file)}
                        alt={`ref ${i + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <button
                        type="button"
                        onClick={() => removePhoto(i)}
                        className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                          <path d="M18 6L6 18M6 6l12 12" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-xl h-10 text-xs border-dashed cursor-pointer"
                style={{ borderColor: "var(--inkby-border-medium)", color: "var(--inkby-fg-muted)" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Add photos
              </Button>
            </QuestionCard>

            {/* Q3: Size */}
            <QuestionCard
              index={3}
              total={4}
              title="What size are you thinking?"
              description="Gives me a sense of how much time it'll take for the appointment."
            >
              <PillSelect options={SIZES} value={size} onChange={setSize} />
            </QuestionCard>

            {/* Q4: Placement */}
            <QuestionCard
              index={4}
              total={4}
              title="Where would you like your tattoo?"
            >
              <PillSelect options={PLACEMENTS} value={placement} onChange={setPlacement} />
            </QuestionCard>

            {error && <p className="text-xs text-center text-inkby-error">{error}</p>}

            <Button
              onClick={() => {
                if (validateTattooStep()) {
                  setError("");
                  setStep(2);
                }
              }}
              className="w-full rounded-full h-12 text-xs font-semibold tracking-widest uppercase cursor-pointer"
              style={{ background: "var(--inkby-fg)", color: "var(--inkby-surface)" }}
            >
              CONTINUE
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 2: Personal info ── */}
      {step === 2 && (
        <div className="flex flex-col min-h-screen px-5 py-4">
          <div className="mb-6">
            <BackButton onClick={() => { setError(""); setStep(1); }} />
          </div>

          <div className="flex-1 flex flex-col justify-center gap-6 max-w-sm mx-auto w-full">
            <div className="text-center">
              <h1 className="text-2xl font-bold leading-snug text-inkby-fg">
                Tell us a bit<br />about yourself
              </h1>
            </div>

            <div className="flex flex-col gap-3">
              {/* Name row */}
              <div className="flex gap-2">
                <div className="flex-1 flex flex-col gap-1.5">
                  <Label htmlFor="firstName" className="text-[10px] tracking-widest uppercase text-inkby-fg-muted">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="rounded-xl h-12 placeholder:text-sm"
                    style={{ background: "var(--inkby-surface)", borderColor: "var(--inkby-border)" }}
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <Label htmlFor="lastName" className="text-[10px] tracking-widest uppercase text-inkby-fg-muted">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="rounded-xl h-12 placeholder:text-sm"
                    style={{ background: "var(--inkby-surface)", borderColor: "var(--inkby-border)" }}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="phone" className="text-[10px] tracking-widest uppercase text-inkby-fg-muted">
                  Phone Number
                </Label>
                <div
                  className="flex items-center rounded-xl overflow-hidden"
                  style={{ background: "var(--inkby-surface)", border: "1px solid var(--inkby-border)" }}
                >
                  <div className="flex items-center gap-1.5 pl-3 pr-2 shrink-0 select-none">
                    <span className="text-base">🇲🇳</span>
                    <span className="text-sm text-inkby-fg-secondary">+976</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M6 9l6 6 6-6" stroke="#b0aca6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="8812 3456"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="flex-1 border-0 rounded-none bg-transparent h-12 px-2 focus-visible:ring-0 focus-visible:border-0 placeholder:text-sm text-inkby-fg"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email" className="text-[10px] tracking-widest uppercase text-inkby-fg-muted">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl h-12 placeholder:text-sm"
                  style={{ background: "var(--inkby-surface)", borderColor: "var(--inkby-border)" }}
                />
              </div>
            </div>

            {error && <p className="text-xs text-center text-inkby-error">{error}</p>}

            <div className="flex flex-col gap-3">
              <p className="text-[10px] text-center leading-relaxed text-inkby-fg-muted">
                By providing your phone number, you agree to receive notifications from @{artist.slug}.{" "}
                You can opt out at any time.
              </p>
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full rounded-full h-12 text-xs font-semibold tracking-widest uppercase flex items-center justify-center gap-2 cursor-pointer"
                style={{ background: "var(--inkby-fg)", color: "var(--inkby-surface)" }}
              >
                {submitting && <Spinner />}
                SEND REQUEST
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 3: Success ── */}
      {step === 3 && (
        <div className="flex flex-col min-h-screen items-center justify-center px-5 py-12 gap-6">
          <SmileyIcon size={64} />

          <div className="text-center">
            <h1 className="text-2xl font-bold leading-snug text-inkby-fg">
              Your request<br />has been sent
            </h1>
          </div>

          {/* Summary card */}
          <div
            className="w-full max-w-xs rounded-2xl overflow-hidden flex items-center justify-center gap-0 px-2 bg-inkby-surface"
          >
            {photoUrls.length > 0 && (
              <div className="w-20 h-20 flex justify-center items-center relative shrink-0 overflow-hidden rounded-xl">
                <Image src={photoUrls[0]} alt="Reference" fill className="object-cover" unoptimized />
              </div>
            )}
            <div className="flex flex-col gap-1.5 p-4 justify-center">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className="text-[10px] font-bold rounded-full px-2 py-0.5"
                  style={{ background: "var(--inkby-coral)", color: "var(--inkby-surface)" }}
                >
                  {size}
                </span>
                <span
                  className="text-[10px] font-medium rounded-full px-2 py-0.5"
                  style={{ background: "var(--inkby-surface-neutral)", color: "var(--inkby-fg-secondary)" }}
                >
                  {placement}
                </span>
              </div>
              <p className="text-sm font-semibold text-inkby-fg">{displayName}</p>
              {idea && (
                <p className="text-xs line-clamp-2 text-inkby-fg-muted">{idea}</p>
              )}
            </div>
          </div>

          <p className="text-xs text-center max-w-xs leading-relaxed text-inkby-fg-muted">
            @{artist.slug} will review your submission,<br />
            and request a deposit if accepted.
          </p>

          <Button
            onClick={() => {
              setStep(0);
              setFirstName(""); setLastName(""); setPhone(""); setEmail("");
              setIdea(""); setPhotoFiles([]); setPhotoUrls([]);
              setSize(""); setPlacement(""); setError("");
            }}
            className="w-full max-w-xs rounded-full h-12 text-xs font-semibold tracking-widest uppercase cursor-pointer"
            style={{ background: "var(--inkby-fg)", color: "var(--inkby-surface)" }}
          >
            DONE
          </Button>

          {bookingRequestId && (
            <a
              href={`/booking/${bookingRequestId}`}
              className="text-xs font-medium underline underline-offset-2 text-inkby-fg-muted"
            >
              View your booking
            </a>
          )}
        </div>
      )}

      {/* Availability panel overlay */}
      {showAvailability && (
        <AvailabilityPanel
          slug={artist.slug}
          onClose={() => setShowAvailability(false)}
          onSelect={(datetime) => {
            setChosenDatetime(datetime);
            setShowAvailability(false);
          }}
        />
      )}
    </main>
  );
}
