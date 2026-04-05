"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";

const SIZES = [
  { label: "X-Small", sublabel: "Under 2.5 cm" },
  { label: "Small", sublabel: "2.5–8 cm" },
  { label: "Medium", sublabel: "8–10 cm" },
  { label: "Large", sublabel: "13–15 cm" },
  { label: "X-Large", sublabel: "18+ cm" },
] as const;

const DEFAULT_DURATIONS = ["1h30m", "2h", "2h30m", "3h", "3h30m"] as const;
const DEFAULT_AMOUNTS = ["150000", "175000", "200000", "225000", "250000"] as const;

function parseDuration(str: string): number | null {
  const clean = str.trim().toLowerCase();
  const full = clean.match(/^(\d+)h(\d+)m?$/);
  if (full) return parseInt(full[1], 10) * 60 + parseInt(full[2], 10);
  const hoursOnly = clean.match(/^(\d+)h$/);
  if (hoursOnly) return parseInt(hoursOnly[1], 10) * 60;
  const minsOnly = clean.match(/^(\d+)m?$/);
  if (minsOnly) return parseInt(minsOnly[1], 10);
  return null;
}

function formatAmount(raw: string): string {
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("en-US");
}

function parseAmount(formatted: string): number {
  return parseFloat(formatted.replace(/,/g, ""));
}

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
  description: string | null;
  isRepeatable: boolean;
  isActive: boolean;
  sizes: FlashSize[];
};

type SizeRowState = {
  enabled: boolean;
  duration: string;
  amount: string;
};

function minEstimate(sizes: FlashSize[]): number {
  if (sizes.length === 0) return 0;
  return Math.min(...sizes.map((s) => Number(s.estimatedAmount)));
}

function FlashGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 px-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex flex-col gap-2">
          <Skeleton className="aspect-square w-full rounded-2xl" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

function NewFlashSheet({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isRepeatable, setIsRepeatable] = useState(false);
  const [rows, setRows] = useState<SizeRowState[]>(() =>
    SIZES.map((_, i) => ({
      enabled: true,
      duration: DEFAULT_DURATIONS[i],
      amount: formatAmount(DEFAULT_AMOUNTS[i]),
    }))
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setPhotoUrl("");
    setTitle("");
    setDescription("");
    setIsRepeatable(false);
    setRows(
      SIZES.map((_, i) => ({
        enabled: true,
        duration: DEFAULT_DURATIONS[i],
        amount: formatAmount(DEFAULT_AMOUNTS[i]),
      }))
    );
    setError("");
  }, [open]);

  async function uploadFile(file: File) {
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bucket", "flash-deal-photos");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed");
        return;
      }
      setPhotoUrl(data.url);
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function setRow(i: number, patch: Partial<SizeRowState>) {
    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  }

  async function handleSubmit() {
    setError("");
    if (!photoUrl) {
      setError("Upload a photo");
      return;
    }
    const enabled = rows
      .map((r, i) => ({ r, i }))
      .filter(({ r }) => r.enabled);
    if (enabled.length === 0) {
      setError("Enable at least one size");
      return;
    }
    const payloadSizes: {
      size_label: string;
      estimated_amount: number;
      duration_minutes?: number;
    }[] = [];
    for (const { r, i } of enabled) {
      const mins = parseDuration(r.duration);
      if (!mins) {
        setError(`Invalid duration for ${SIZES[i].label}. Use e.g. 1h30m, 2h, 45m`);
        return;
      }
      const amt = parseAmount(r.amount);
      if (!r.amount.trim() || isNaN(amt) || amt <= 0) {
        setError(`Enter a valid estimate for ${SIZES[i].label}`);
        return;
      }
      const { label, sublabel } = SIZES[i];
      payloadSizes.push({
        size_label: `${label} (${sublabel})`,
        estimated_amount: amt,
        duration_minutes: mins,
      });
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/flash-deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          photo_url: photoUrl,
          title: title.trim() || undefined,
          description: description.trim() || undefined,
          is_repeatable: isRepeatable,
          sizes: payloadSizes,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not create flash");
        return;
      }
      onOpenChange(false);
      onCreated();
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="h-screen overflow-y-auto rounded-t-2xl border-0 p-0 gap-0"
        style={{ background: "var(--inkby-surface-warm)" }}
      >
        <SheetHeader
          className="px-5 pt-6 pb-2 border-b"
          style={{ borderColor: "var(--inkby-border)" }}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-opacity hover:opacity-70"
              style={{ background: "var(--inkby-surface-neutral)", color: "var(--inkby-fg)" }}
              aria-label="Back"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <SheetTitle className="text-base font-semibold text-left flex-1 text-inkby-fg">
              New flash
            </SheetTitle>
          </div>
          <SheetDescription className="sr-only">Create a new flash design listing</SheetDescription>
        </SheetHeader>

        <div className="px-5 py-4 flex flex-col gap-4 pb-4">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void uploadFile(f);
              e.target.value = "";
            }}
          />
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void uploadFile(f);
              e.target.value = "";
            }}
          />
          <div className="flex gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
              className="flex-1 rounded-xl py-3 px-3 flex flex-col items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ background: "var(--inkby-surface)", border: "1px solid var(--inkby-border)", color: "var(--inkby-fg)" }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="8.5" cy="10.5" r="1.5" fill="currentColor" />
                <path d="M21 15l-5-5L5 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Upload images
            </button>
            <button
              type="button"
              disabled={uploading}
              onClick={() => cameraRef.current?.click()}
              className="flex-1 rounded-xl py-3 px-3 flex flex-col items-center gap-1.5 text-xs font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ background: "var(--inkby-surface)", border: "1px solid var(--inkby-border)", color: "var(--inkby-fg)" }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 8h3l1.5-2h7L17 8h3v11H4V8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              Camera
            </button>
          </div>
          <p className="text-[11px] leading-relaxed text-inkby-fg-muted">
            Upload one image per flash. Supports transparency and different dimensions.
          </p>

          {photoUrl && (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-inkby-surface-neutral">
              <Image src={photoUrl} alt="Preview" fill className="object-contain" unoptimized />
            </div>
          )}

          <div>
            <Label className="text-[10px] font-semibold mb-1 block text-inkby-fg-muted">
              Add a title (optional)
            </Label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl px-3 h-11 text-sm outline-none"
              style={{ background: "var(--inkby-surface)", color: "var(--inkby-fg)", border: "1px solid var(--inkby-border)" }}
            />
          </div>
          <div>
            <Label className="text-[10px] font-semibold mb-1 block text-inkby-fg-muted">
              Add a description (optional)
            </Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
              style={{ background: "var(--inkby-surface)", color: "var(--inkby-fg)", border: "1px solid var(--inkby-border)" }}
            />
          </div>

          <div
            className="rounded-xl p-4 flex items-center justify-between gap-3"
            style={{ background: "var(--inkby-surface)", border: "1px solid var(--inkby-border)" }}
          >
            <div>
              <p className="text-sm font-semibold text-inkby-fg">Repeatable</p>
              <p className="text-xs mt-0.5 text-inkby-fg-muted">
                Available until you archive this piece
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isRepeatable}
              onClick={() => setIsRepeatable((v) => !v)}
              className="w-12 h-7 rounded-full shrink-0 transition-colors relative"
              style={{ background: isRepeatable ? "var(--inkby-fg)" : "var(--inkby-border-medium)" }}
            >
              <span
                className="absolute top-1 w-5 h-5 rounded-full bg-white transition-transform"
                style={{ left: isRepeatable ? "26px" : "4px" }}
              />
            </button>
          </div>

          <div>
            <p className="text-[10px] font-semibold tracking-wide mb-2 text-inkby-fg-muted">
              SIZE, DURATION, ESTIMATE
            </p>
            <div className="flex flex-col gap-2">
              {SIZES.map((sz, i) => (
                <div
                  key={sz.label}
                  className="rounded-xl p-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3"
                  style={{ background: "var(--inkby-surface)", border: "1px solid var(--inkby-border)" }}
                >
                  <button
                    type="button"
                    onClick={() => setRow(i, { enabled: !rows[i].enabled })}
                    className="flex items-start gap-2 text-left sm:w-[140px] shrink-0"
                  >
                    <span
                      className="w-5 h-5 rounded shrink-0 mt-0.5 flex items-center justify-center text-[10px] font-bold"
                      style={{
                        background: rows[i].enabled ? "var(--inkby-coral)" : "var(--inkby-surface-neutral)",
                        color: rows[i].enabled ? "var(--inkby-surface)" : "var(--inkby-fg-muted)",
                      }}
                    >
                      {rows[i].enabled ? "✓" : ""}
                    </span>
                    <span>
                      <span className="text-xs font-semibold block text-inkby-fg">
                        {sz.label}
                      </span>
                      <span className="text-[10px] text-inkby-fg-muted">
                        {sz.sublabel}
                      </span>
                    </span>
                  </button>
                  <div className="flex flex-1 gap-2 min-w-0">
                    <input
                      type="text"
                      disabled={!rows[i].enabled}
                      value={rows[i].duration}
                      onChange={(e) => setRow(i, { duration: e.target.value })}
                      placeholder="1h30m"
                      className="flex-1 min-w-0 rounded-lg px-2 h-9 text-xs outline-none disabled:opacity-40"
                      style={{ background: "var(--inkby-surface-warm)", border: "1px solid var(--inkby-border)", color: "var(--inkby-fg)" }}
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      disabled={!rows[i].enabled}
                      value={rows[i].amount}
                      onChange={(e) => setRow(i, { amount: formatAmount(e.target.value) })}
                      placeholder="Estimate"
                      className="flex-1 min-w-0 rounded-lg px-2 h-9 text-xs outline-none disabled:opacity-40"
                      style={{ background: "var(--inkby-surface-warm)", border: "1px solid var(--inkby-border)", color: "var(--inkby-fg)" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs text-center text-inkby-error">
              {error}
            </p>
          )}
        </div>

        <div
          className="w-full p-4 flex gap-3 z-[60] border-t"
          style={{ background: "var(--inkby-surface-warm)", borderColor: "var(--inkby-border)" }}
        >
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-full h-11 text-xs font-semibold"
            style={{ borderColor: "var(--inkby-border-medium)", color: "var(--inkby-fg)" }}
          >
            CANCEL
          </Button>
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitting || uploading}
            className="flex-[2] rounded-full h-11 text-xs font-bold tracking-widest"
            style={{ background: "var(--inkby-fg)", color: "var(--inkby-surface)" }}
          >
            {submitting ? "ADDING…" : "ADD FLASH"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function FlashbookPage() {
  const [deals, setDeals] = useState<FlashDeal[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/flash-deals");
      const data = await res.json();
      if (!res.ok) {
        setDeals([]);
        return;
      }
      setDeals(data.flash_deals ?? []);
    } catch {
      setDeals([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="max-w-xl mx-auto flex flex-col min-h-full pb-6 bg-inkby-canvas">
      <header className="flex items-center justify-between px-4 pt-4 pb-3">
        <h1 className="text-xl font-bold text-inkby-fg">
          Flashbook
        </h1>
        <Button
          type="button"
          size="icon"
          onClick={() => setSheetOpen(true)}
          className="rounded-full h-10 w-10 shrink-0"
          style={{ background: "var(--inkby-fg)", color: "var(--inkby-surface)" }}
          aria-label="New flash"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </Button>
      </header>

      {loading ? (
        <FlashGridSkeleton />
      ) : !deals?.length ? (
        <div className="flex flex-col items-center justify-center px-8 py-16 gap-4 text-center">
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{ background: "var(--inkby-surface-neutral)", color: "var(--inkby-fg-muted)" }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="8.5" cy="10.5" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-inkby-fg">
            No flash yet
          </p>
          <p className="text-xs max-w-xs leading-relaxed text-inkby-fg-muted">
            Add designs clients can book from your profile. Tap + to create your first flash.
          </p>
          <Button
            onClick={() => setSheetOpen(true)}
            className="rounded-full h-11 px-8 text-xs font-bold tracking-widest mt-2"
            style={{ background: "var(--inkby-fg)", color: "var(--inkby-surface)" }}
          >
            ADD FLASH
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-4">
          {deals.map((deal) => (
            <article
              key={deal.id}
              className="flex flex-col rounded-2xl overflow-hidden bg-inkby-surface"
            >
              <div className="relative aspect-square w-full bg-inkby-surface-soft">
                <Image src={deal.photoUrl} alt={deal.title ?? "Flash"} fill className="object-cover" unoptimized />
              </div>
              <div className="p-3 flex flex-col gap-1">
                <p className="text-[11px] font-medium text-inkby-fg-secondary">
                  {deal.isRepeatable ? "Repeatable" : "Non-repeatable"}
                </p>
                <p className="text-[11px] text-inkby-fg-muted">
                  {deal.sizes.length} size{deal.sizes.length !== 1 ? "s" : ""}
                </p>
                <p className="text-sm font-semibold text-inkby-fg">
                  ₮{minEstimate(deal.sizes).toLocaleString("en-US")}
                  {deal.sizes.length > 1 && (
                    <span className="text-[10px] font-normal text-inkby-fg-muted">
                      {" "}
                      from
                    </span>
                  )}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}

      <NewFlashSheet open={sheetOpen} onOpenChange={setSheetOpen} onCreated={() => void load()} />
    </div>
  );
}
