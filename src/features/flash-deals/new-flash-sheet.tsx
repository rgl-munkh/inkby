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
import { parseDuration, formatAmountInput, parseAmountInput } from "@/lib/utils";

const SIZES = [
  { label: "X-Small", sublabel: "Under 2.5 cm" },
  { label: "Small", sublabel: "2.5–8 cm" },
  { label: "Medium", sublabel: "8–10 cm" },
  { label: "Large", sublabel: "13–15 cm" },
  { label: "X-Large", sublabel: "18+ cm" },
] as const;

const DEFAULT_DURATIONS = ["1h30m", "2h", "2h30m", "3h", "3h30m"] as const;
const DEFAULT_AMOUNTS = ["150000", "175000", "200000", "225000", "250000"] as const;

type SizeRowState = {
  enabled: boolean;
  duration: string;
  amount: string;
};

/** Same shape as dashboard list / GET flash_deals (for edit mode). */
export type FlashDealSheetDeal = {
  id: string;
  photoUrl: string;
  title: string | null;
  description: string | null;
  isRepeatable: boolean;
  isActive: boolean;
  sizes: {
    id: string;
    sizeLabel: string;
    estimatedAmount: string;
    durationMinutes: number | null;
  }[];
};

function defaultRows(): SizeRowState[] {
  return SIZES.map((_, i) => ({
    enabled: true,
    duration: DEFAULT_DURATIONS[i],
    amount: formatAmountInput(DEFAULT_AMOUNTS[i]),
  }));
}

/** Compact duration string compatible with `parseDuration`. */
function minutesToDurationInput(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h > 0 && m > 0) return `${h}h${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

function rowsFromDeal(deal: FlashDealSheetDeal): SizeRowState[] {
  return SIZES.map((sz, i) => {
    const expected = `${sz.label} (${sz.sublabel})`;
    const row = deal.sizes.find((s) => s.sizeLabel === expected);
    const defDuration = DEFAULT_DURATIONS[i];
    const defAmount = formatAmountInput(DEFAULT_AMOUNTS[i]);
    if (!row) {
      return { enabled: false, duration: defDuration, amount: defAmount };
    }
    const dm = row.durationMinutes;
    const duration =
      dm != null && dm > 0 ? minutesToDurationInput(dm) : defDuration;
    return {
      enabled: true,
      duration,
      amount: formatAmountInput(String(row.estimatedAmount)),
    };
  });
}

export function NewFlashSheet({
  open,
  onOpenChange,
  onCreated,
  deal,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated: () => void;
  deal?: FlashDealSheetDeal | null;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isRepeatable, setIsRepeatable] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [rows, setRows] = useState<SizeRowState[]>(() => defaultRows());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isEdit = Boolean(deal);

  useEffect(() => {
    if (!open) return;
    if (deal) {
      setPhotoUrl(deal.photoUrl);
      setTitle(deal.title ?? "");
      setDescription(deal.description ?? "");
      setIsRepeatable(deal.isRepeatable);
      setIsActive(deal.isActive);
      setRows(rowsFromDeal(deal));
      setError("");
      return;
    }
    setPhotoUrl("");
    setTitle("");
    setDescription("");
    setIsRepeatable(false);
    setIsActive(true);
    setRows(defaultRows());
    setError("");
  }, [open, deal]);

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
      setError(isEdit ? "Photo is missing" : "Upload a photo");
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
      const amt = parseAmountInput(r.amount);
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

    const dealId = deal?.id;
    if (isEdit && !dealId) {
      setError("Something went wrong");
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        photo_url: photoUrl,
        title: title.trim() || undefined,
        description: description.trim() || undefined,
        is_repeatable: isRepeatable,
        sizes: payloadSizes,
        ...(isEdit ? { is_active: isActive } : {}),
      };
      const res = await fetch(
        isEdit ? `/api/flash-deals/${dealId}` : "/api/flash-deals",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(
          data.error ?? (isEdit ? "Could not update flash" : "Could not create flash"),
        );
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
        style={{ background: "var(--muted)" }}
      >
        <SheetHeader
          className="px-5 pt-6 pb-2 border-b"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-opacity hover:opacity-70"
              style={{ background: "var(--muted)", color: "var(--foreground)" }}
              aria-label="Back"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <SheetTitle className="text-base font-semibold text-left flex-1 text-foreground">
              {isEdit ? "Edit flash" : "New flash"}
            </SheetTitle>
          </div>
          <SheetDescription className="sr-only">
            {isEdit ? "Edit flash design listing" : "Create a new flash design listing"}
          </SheetDescription>
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
              style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}
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
              style={{ background: "var(--card)", border: "1px solid var(--border)", color: "var(--foreground)" }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 8h3l1.5-2h7L17 8h3v11H4V8z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              Camera
            </button>
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Upload one image per flash. Supports transparency and different dimensions.
          </p>

          {photoUrl && (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted">
              <Image src={photoUrl} alt="Preview" fill className="object-contain" />
            </div>
          )}

          <div>
            <Label className="text-[10px] font-semibold mb-1 block text-muted-foreground">
              Add a title (optional)
            </Label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl px-3 h-11 placeholder:text-sm outline-none"
              style={{ background: "var(--card)", color: "var(--foreground)", border: "1px solid var(--border)" }}
            />
          </div>
          <div>
            <Label className="text-[10px] font-semibold mb-1 block text-muted-foreground">
              Add a description (optional)
            </Label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
              style={{ background: "var(--card)", color: "var(--foreground)", border: "1px solid var(--border)" }}
            />
          </div>

          {isEdit && (
            <div
              className="rounded-xl p-4 flex items-center justify-between gap-3"
              style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
              <div>
                <p className="text-sm font-semibold text-foreground">Visible on profile</p>
                <p className="text-xs mt-0.5 text-muted-foreground">
                  Turn off to hide this flash from your public profile
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isActive}
                onClick={() => setIsActive((v) => !v)}
                className="w-12 h-7 rounded-full shrink-0 transition-colors relative"
                style={{ background: isActive ? "var(--foreground)" : "var(--border)" }}
              >
                <span
                  className="absolute top-1 w-5 h-5 rounded-full bg-white transition-transform"
                  style={{ left: isActive ? "26px" : "4px" }}
                />
              </button>
            </div>
          )}

          <div
            className="rounded-xl p-4 flex items-center justify-between gap-3"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <div>
              <p className="text-sm font-semibold text-foreground">Repeatable</p>
              <p className="text-xs mt-0.5 text-muted-foreground">
                Available until you archive this piece
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isRepeatable}
              onClick={() => setIsRepeatable((v) => !v)}
              className="w-12 h-7 rounded-full shrink-0 transition-colors relative"
              style={{ background: isRepeatable ? "var(--foreground)" : "var(--border)" }}
            >
              <span
                className="absolute top-1 w-5 h-5 rounded-full bg-white transition-transform"
                style={{ left: isRepeatable ? "26px" : "4px" }}
              />
            </button>
          </div>

          <div>
            <p className="text-[10px] font-semibold tracking-wide mb-2 text-muted-foreground">
              SIZE, DURATION, ESTIMATE
            </p>
            <div className="flex flex-col gap-2">
              {SIZES.map((sz, i) => (
                <div
                  key={sz.label}
                  className="rounded-xl p-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3"
                  style={{ background: "var(--card)", border: "1px solid var(--border)" }}
                >
                  <button
                    type="button"
                    onClick={() => setRow(i, { enabled: !rows[i].enabled })}
                    className="flex items-start gap-2 text-left sm:w-[140px] shrink-0"
                  >
                    <span
                      className="w-5 h-5 rounded shrink-0 mt-0.5 flex items-center justify-center text-[10px] font-bold"
                      style={{
                        background: rows[i].enabled ? "#fb923c" : "var(--muted)",
                        color: rows[i].enabled ? "var(--card)" : "var(--muted-foreground)",
                      }}
                    >
                      {rows[i].enabled ? "✓" : ""}
                    </span>
                    <span>
                      <span className="text-xs font-semibold block text-foreground">
                        {sz.label}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
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
                      className="flex-1 min-w-0 rounded-lg px-2 h-9 placeholder:text-sm outline-none disabled:opacity-40"
                      style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                    />
                    <input
                      type="text"
                      inputMode="numeric"
                      disabled={!rows[i].enabled}
                      value={rows[i].amount}
                      onChange={(e) => setRow(i, { amount: formatAmountInput(e.target.value) })}
                      placeholder="Estimate"
                      className="flex-1 min-w-0 rounded-lg px-2 h-9 placeholder:text-sm outline-none disabled:opacity-40"
                      style={{ background: "var(--muted)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-xs text-center text-destructive">
              {error}
            </p>
          )}
        </div>

        <div
          className="w-full p-4 flex gap-3 z-[60] border-t"
          style={{ background: "var(--muted)", borderColor: "var(--border)" }}
        >
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-full h-11 text-xs font-semibold"
            style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
          >
            CANCEL
          </Button>
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={submitting || uploading}
            className="flex-[2] rounded-full h-11 text-xs font-bold tracking-widest"
            style={{ background: "var(--foreground)", color: "var(--card)" }}
          >
            {submitting
              ? isEdit
                ? "SAVING…"
                : "ADDING…"
              : isEdit
                ? "SAVE CHANGES"
                : "ADD FLASH"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
