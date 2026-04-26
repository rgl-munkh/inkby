"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { NewFlashSheet, type FlashDealSheetDeal } from "@/features/flash-deals/new-flash-sheet";

function minEstimate(sizes: FlashDealSheetDeal["sizes"]): number {
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

export default function FlashbookPage() {
  const [deals, setDeals] = useState<FlashDealSheetDeal[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [dealToEdit, setDealToEdit] = useState<FlashDealSheetDeal | null>(null);
  const [dealPendingDelete, setDealPendingDelete] = useState<FlashDealSheetDeal | null>(
    null,
  );
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

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
    <div className="max-w-xl mx-auto flex flex-col min-h-full pb-6 bg-background">
      <header className="flex items-center justify-between px-4 pt-4 pb-3">
        <h1 className="text-xl font-bold text-foreground">
          Flashbook
        </h1>
        <Button
          type="button"
          size="icon"
          onClick={() => {
            setDealToEdit(null);
            setSheetOpen(true);
          }}
          className="rounded-full h-10 w-10 shrink-0"
          style={{ background: "var(--foreground)", color: "var(--card)" }}
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
            style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="8.5" cy="10.5" r="1.5" fill="currentColor" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-foreground">
            No flash yet
          </p>
          <p className="text-xs max-w-xs leading-relaxed text-muted-foreground">
            Add designs clients can book from your profile. Tap + to create your first flash.
          </p>
          <Button
            onClick={() => {
              setDealToEdit(null);
              setSheetOpen(true);
            }}
            className="rounded-full h-11 px-8 text-xs font-bold tracking-widest mt-2"
            style={{ background: "var(--foreground)", color: "var(--card)" }}
          >
            ADD FLASH
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 px-4">
          {deals.map((deal) => (
            <article
              key={deal.id}
              className="flex flex-col rounded-2xl overflow-hidden bg-card"
            >
              <div className="relative aspect-square w-full bg-muted">
                <Image src={deal.photoUrl} alt={deal.title ?? "Flash"} fill className="object-cover" />
                <div className="absolute top-2 right-2 flex gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDealToEdit(deal);
                      setSheetOpen(true);
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-90 shadow-sm"
                    style={{ background: "var(--card)", color: "var(--foreground)" }}
                    aria-label="Edit flash"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setDealPendingDelete(deal);
                    }}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-90 shadow-sm"
                    style={{ background: "var(--card)", color: "var(--foreground)" }}
                    aria-label="Delete flash"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="p-3 flex flex-col gap-1">
                <p className="text-[11px] font-medium text-muted-foreground">
                  {deal.isRepeatable ? "Repeatable" : "Non-repeatable"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {deal.sizes.length} size{deal.sizes.length !== 1 ? "s" : ""}
                </p>
                <p className="text-sm font-semibold text-foreground">
                  ₮{minEstimate(deal.sizes).toLocaleString("en-US")}
                  {deal.sizes.length > 1 && (
                    <span className="text-[10px] font-normal text-muted-foreground">
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

      {dealPendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50"
          role="presentation"
          onClick={() => {
            if (!deleteSubmitting) setDealPendingDelete(null);
          }}
        >
          <div
            role="alertdialog"
            aria-labelledby="flash-delete-title"
            aria-describedby="flash-delete-desc"
            className="w-full max-w-sm rounded-2xl p-5 shadow-lg"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <p id="flash-delete-title" className="text-base font-semibold text-foreground">
              Delete this flash?
            </p>
            <p id="flash-delete-desc" className="text-sm mt-2 text-muted-foreground">
              This removes the design from your flashbook. It cannot be undone.
            </p>
            <div className="flex gap-3 mt-5">
              <Button
                type="button"
                variant="outline"
                disabled={deleteSubmitting}
                onClick={() => setDealPendingDelete(null)}
                className="flex-1 rounded-full h-11 text-xs font-semibold"
                style={{ borderColor: "var(--border)", color: "var(--foreground)" }}
              >
                CANCEL
              </Button>
              <Button
                type="button"
                disabled={deleteSubmitting}
                onClick={() => {
                  const id = dealPendingDelete.id;
                  setDeleteSubmitting(true);
                  void (async () => {
                    try {
                      const res = await fetch(`/api/flash-deals/${id}`, { method: "DELETE" });
                      if (res.ok) await load();
                    } finally {
                      setDeleteSubmitting(false);
                      setDealPendingDelete(null);
                    }
                  })();
                }}
                className="flex-1 rounded-full h-11 text-xs font-bold tracking-widest"
                style={{ background: "var(--destructive)", color: "var(--card)" }}
              >
                {deleteSubmitting ? "…" : "DELETE"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <NewFlashSheet
        open={sheetOpen}
        onOpenChange={(v) => {
          setSheetOpen(v);
          if (!v) setDealToEdit(null);
        }}
        deal={dealToEdit}
        onCreated={() => void load()}
      />
    </div>
  );
}
