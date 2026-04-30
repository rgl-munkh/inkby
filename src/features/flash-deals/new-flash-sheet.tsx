"use client";

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
import { formatAmountInput } from "@/lib/domain/money";
import { useFlashDealForm } from "./hooks/use-flash-deal-form";
import { FLASH_DEAL_SIZE_OPTIONS, type FlashDealSheetDeal } from "./types";

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
  const {
    cameraRef,
    description,
    error,
    fileRef,
    handleSubmit,
    isActive,
    isEdit,
    isRepeatable,
    photoUrl,
    rows,
    setDescription,
    setIsActive,
    setIsRepeatable,
    setRow,
    setTitle,
    submitting,
    title,
    uploadFile,
    uploading,
  } = useFlashDealForm({ open, deal, onOpenChange, onCreated });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="h-screen overflow-y-auto border-border p-0 gap-0"
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
              className="flex-1 rounded-xl py-3 px-3 flex flex-col items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
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
              className="flex-1 rounded-xl py-3 px-3 flex flex-col items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
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
              <Image src={photoUrl} alt="Preview" fill sizes="(max-width: 640px) 100vw, 384px" className="object-contain" />
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
              {FLASH_DEAL_SIZE_OPTIONS.map((sz, i) => (
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
            <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-center text-xs text-destructive">
              {error}
            </p>
          )}
        </div>

        <div
          className="w-full p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] flex gap-3 z-[60] border-t"
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
