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

const SIZES = ["1-2 INCHES", "3-4 INCHES", "5-6 INCHES", "7+ INCHES"];
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
      style={{ background: "#e8e4dc", color: "#6b6b6b" }}
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
            background: value === opt ? "#1a1a1a" : "transparent",
            color: value === opt ? "#fff" : "#6b6b6b",
            borderColor: value === opt ? "#1a1a1a" : "#d1cdc6",
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
    <div className="rounded-2xl p-5" style={{ background: "#fff" }}>
      <p className="text-[10px] font-semibold tracking-widest uppercase mb-2" style={{ color: "#b0aca6" }}>
        Question {index}/{total}
      </p>
      <h3 className="text-sm font-semibold mb-1" style={{ color: "#1a1a1a" }}>{title}</h3>
      {description && (
        <p className="text-xs mb-3" style={{ color: "#9e9a94" }}>{description}</p>
      )}
      {children}
    </div>
  );
}

export default function ArtistProfilePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [step, setStep] = useState(0);
  const [bookingRequestId, setBookingRequestId] = useState<string | null>(null);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [flashDeals, setFlashDeals] = useState<FlashDeal[]>([]);
  const [loadingArtist, setLoadingArtist] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Step 1
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // Step 2
  const [idea, setIdea] = useState("");
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [size, setSize] = useState("");
  const [placement, setPlacement] = useState("");

  // Submission
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
    if (!idea.trim()) { setError("Please describe your tattoo idea"); return; }
    if (!size) { setError("Please select a tattoo size"); return; }
    if (!placement) { setError("Please select a placement"); return; }

    setError("");
    setSubmitting(true);

    try {
      const uploadedUrls = await uploadPhotos();
      setPhotoUrls(uploadedUrls);

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
          photo_urls: uploadedUrls,
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

  function validateStep1() {
    if (!firstName.trim()) { setError("First name is required"); return false; }
    if (!lastName.trim()) { setError("Last name is required"); return false; }
    if (!phone.trim()) { setError("Phone number is required"); return false; }
    if (!email.trim()) { setError("Email is required"); return false; }
    return true;
  }

  if (loadingArtist) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: "#f0ece6" }}>
        <Spinner />
      </main>
    );
  }

  if (notFound || !artist) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "#f0ece6" }}>
        <SmileyIcon />
        <p className="text-sm font-medium" style={{ color: "#6b6b6b" }}>Artist not found</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col" style={{ background: "#f0ece6" }}>
      {/* ── Step 0: Profile landing ── */}
      {step === 0 && (
        <>
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-1">
              <button
                className="flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium cursor-pointer transition-opacity hover:opacity-70"
                style={{ borderColor: "#d1cdc6", color: "#1a1a1a", background: "transparent" }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Profile
              </button>
              <button
                className="flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium cursor-pointer transition-opacity hover:opacity-70"
                style={{ borderColor: "transparent", color: "#9e9a94", background: "transparent" }}
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
            <p className="text-2xl font-bold tracking-tight" style={{ color: "#1a1a1a" }}>
              @{artist.slug}
            </p>
            {artist.bio && (
              <p className="text-sm text-center max-w-xs" style={{ color: "#6b6b6b" }}>{artist.bio}</p>
            )}
            <Button
              onClick={() => setStep(1)}
              className="w-full max-w-xs rounded-full h-12 text-sm font-semibold cursor-pointer mt-2"
              style={{ background: "#1a1a1a", color: "#fff" }}
            >
              Book a tattoo
            </Button>

            {/* Flash gallery */}
            {flashDeals.length > 0 && (
              <div className="w-full max-w-xs mt-2">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#9e9a94" }}>
                    Flash
                  </span>
                  <span
                    className="text-[10px] font-semibold rounded-full px-1.5 py-0.5 leading-none"
                    style={{ background: "#e8e4dc", color: "#6b6b6b" }}
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
                          setStep(1);
                        }}
                        className="flex flex-col rounded-2xl overflow-hidden text-left transition-opacity hover:opacity-80 cursor-pointer"
                        style={{ background: "#fff" }}
                      >
                        <div className="relative aspect-square w-full" style={{ background: "#f0ede8" }}>
                          <Image src={deal.photoUrl} alt={deal.title ?? "Flash"} fill className="object-cover" unoptimized />
                        </div>
                        <div className="px-2.5 py-2 flex flex-col gap-0.5">
                          <p className="text-xs font-semibold truncate" style={{ color: "#1a1a1a" }}>
                            {deal.title ?? "Flash"}
                          </p>
                          <p className="text-[10px]" style={{ color: "#9e9a94" }}>
                            {deal.isRepeatable ? "Repeatable" : "Non-repeatable"}
                          </p>
                          {minAmt !== null && (
                            <p className="text-xs font-semibold" style={{ color: "#1a1a1a" }}>
                              ₮{minAmt.toLocaleString("en-US")}
                              {deal.sizes.length > 1 && (
                                <span className="text-[10px] font-normal" style={{ color: "#9e9a94" }}> from</span>
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
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#1a1a1a" }}>INKBY</span>
            </div>
            <p className="text-[10px] text-right" style={{ color: "#9e9a94" }}>
              Painlessly manage your<br />requests, books, and deposits
            </p>
          </div>
        </>
      )}

      {/* ── Step 1: Personal info ── */}
      {step === 1 && (
        <div className="flex flex-col min-h-screen px-5 py-4">
          <div className="mb-6">
            <BackButton onClick={() => { setError(""); setStep(0); }} />
          </div>

          <div className="flex-1 flex flex-col justify-center gap-6 max-w-sm mx-auto w-full">
            <div className="text-center">
              <h1 className="text-2xl font-bold leading-snug" style={{ color: "#1a1a1a" }}>
                Tell us a bit<br />about yourself
              </h1>
            </div>

            <div className="flex flex-col gap-3">
              {/* Name row */}
              <div className="flex gap-2">
                <div className="flex-1 flex flex-col gap-1.5">
                  <Label htmlFor="firstName" className="text-[10px] tracking-widest uppercase" style={{ color: "#9e9a94" }}>
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="rounded-xl h-12 text-sm"
                    style={{ background: "#fff", borderColor: "#e2ddd6" }}
                  />
                </div>
                <div className="flex-1 flex flex-col gap-1.5">
                  <Label htmlFor="lastName" className="text-[10px] tracking-widest uppercase" style={{ color: "#9e9a94" }}>
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="rounded-xl h-12 text-sm"
                    style={{ background: "#fff", borderColor: "#e2ddd6" }}
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="phone" className="text-[10px] tracking-widest uppercase" style={{ color: "#9e9a94" }}>
                  Phone Number
                </Label>
                <div
                  className="flex items-center rounded-xl overflow-hidden"
                  style={{ background: "#fff", border: "1px solid #e2ddd6" }}
                >
                  <div className="flex items-center gap-1.5 pl-3 pr-2 shrink-0 select-none">
                    <span className="text-base">🇲🇳</span>
                    <span className="text-sm" style={{ color: "#6b6b6b" }}>+976</span>
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
                    className="flex-1 border-0 rounded-none bg-transparent h-12 px-2 focus-visible:ring-0 focus-visible:border-0 text-sm"
                    style={{ color: "#1a1a1a" }}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email" className="text-[10px] tracking-widest uppercase" style={{ color: "#9e9a94" }}>
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl h-12 text-sm"
                  style={{ background: "#fff", borderColor: "#e2ddd6" }}
                />
              </div>
            </div>

            {error && <p className="text-xs text-center" style={{ color: "#d94f4f" }}>{error}</p>}

            <div className="flex flex-col gap-3">
              <p className="text-[10px] text-center leading-relaxed" style={{ color: "#9e9a94" }}>
                By providing your phone number, you agree to receive notifications from @{artist.slug}.{" "}
                You can opt out at any time.
              </p>
              <Button
                onClick={() => {
                  if (validateStep1()) {
                    setError("");
                    setStep(2);
                  }
                }}
                className="w-full rounded-full h-12 text-xs font-semibold tracking-widest uppercase cursor-pointer"
                style={{ background: "#1a1a1a", color: "#fff" }}
              >
                CONTINUE
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Tattoo details ── */}
      {step === 2 && (
        <div className="flex flex-col min-h-screen px-5 py-4">
          <div className="mb-4">
            <BackButton onClick={() => { setError(""); setStep(1); }} />
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
            <p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>Book with @{artist.slug}</p>
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
                className="resize-none rounded-xl text-sm"
                style={{ background: "#f5f2ec", borderColor: "#e2ddd6", color: "#1a1a1a" }}
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
                style={{ borderColor: "#d1cdc6", color: "#9e9a94" }}
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

            {error && <p className="text-xs text-center" style={{ color: "#d94f4f" }}>{error}</p>}

            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full rounded-full h-12 text-xs font-semibold tracking-widest uppercase flex items-center justify-center gap-2 cursor-pointer"
              style={{ background: "#1a1a1a", color: "#fff" }}
            >
              {submitting && <Spinner />}
              SEND REQUEST
            </Button>
          </div>
        </div>
      )}

      {/* ── Step 3: Success ── */}
      {step === 3 && (
        <div className="flex flex-col min-h-screen items-center justify-center px-5 py-12 gap-6">
          <SmileyIcon size={64} />

          <div className="text-center">
            <h1 className="text-2xl font-bold leading-snug" style={{ color: "#1a1a1a" }}>
              Your request<br />has been sent
            </h1>
          </div>

          {/* Summary card */}
          <div
            className="w-full max-w-xs rounded-2xl overflow-hidden flex items-center justify-center gap-0 px-2"
            style={{ background: "#fff" }}
          >
            {photoUrls.length > 0 && (
              <div className="w-20 h-20 flex justify-center items-center relative shrink-0 overflow-hidden rounded-xl">
                <Image src={photoUrls[0]} alt="Reference" fill className="object-cover" unoptimized />
              </div>
            )}
            <div className="flex flex-col gap-1.5 p-4 justify-center">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold rounded-full px-2 py-0.5" style={{ background: "#f4a574", color: "#fff" }}>
                  {size}
                </span>
                <span className="text-[10px] font-medium rounded-full px-2 py-0.5" style={{ background: "#e8e4dc", color: "#6b6b6b" }}>
                  {placement}
                </span>
              </div>
              <p className="text-sm font-semibold" style={{ color: "#1a1a1a" }}>{displayName}</p>
              {idea && (
                <p className="text-xs line-clamp-2" style={{ color: "#9e9a94" }}>{idea}</p>
              )}
            </div>
          </div>

          <p className="text-xs text-center max-w-xs leading-relaxed" style={{ color: "#9e9a94" }}>
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
            style={{ background: "#1a1a1a", color: "#fff" }}
          >
            DONE
          </Button>

          {bookingRequestId && (
            <a
              href={`/booking/${bookingRequestId}`}
              className="text-xs font-medium underline underline-offset-2"
              style={{ color: "#9e9a94" }}
            >
              View your booking
            </a>
          )}
        </div>
      )}
    </main>
  );
}
