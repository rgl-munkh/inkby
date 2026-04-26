import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { Artist, FlashDeal } from "../types";
import { SmileyIcon } from "./booking-wizard-ui";

export function StepLanding({
  artist,
  flashDeals,
  displayName,
  chosenDatetime,
  onOpenAvailability,
  onStartBooking,
  onPickFlash,
}: {
  artist: Artist;
  flashDeals: FlashDeal[];
  displayName: string;
  chosenDatetime: string | null;
  onOpenAvailability: () => void;
  onStartBooking: () => void;
  onPickFlash: (deal: FlashDeal) => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            className="flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium cursor-pointer transition-opacity hover:opacity-70"
            style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "transparent" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Profile
          </button>
          <button
            className="flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium cursor-pointer transition-opacity hover:opacity-70"
            style={{ borderColor: "transparent", color: "var(--muted-foreground)", background: "transparent" }}
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

      <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6 py-12">
        {artist.avatarUrl ? (
          <div className="w-24 h-24 rounded-full overflow-hidden relative">
            <Image src={artist.avatarUrl} alt={displayName} fill className="object-cover" />
          </div>
        ) : (
          <SmileyIcon size={96} />
        )}
        <p className="text-2xl font-bold tracking-tight text-foreground">
          @{artist.slug}
        </p>
        {artist.bio && (
          <p className="text-sm text-center max-w-xs text-muted-foreground">{artist.bio}</p>
        )}
        <Button
          onClick={onStartBooking}
          className="w-full max-w-xs rounded-full h-12 text-sm font-semibold cursor-pointer mt-2"
          style={{ background: "var(--foreground)", color: "var(--card)" }}
        >
          Book a tattoo
        </Button>
        <button
          type="button"
          onClick={onOpenAvailability}
          className="w-full max-w-xs rounded-full h-10 text-xs font-semibold cursor-pointer transition-opacity hover:opacity-80 border"
          style={{
            background: "transparent",
            color: "var(--foreground)",
            borderColor: "var(--border)",
          }}
        >
          {chosenDatetime
            ? (() => {
                const d = new Date(chosenDatetime);
                return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
              })()
            : "Check availability"}
        </button>

        {flashDeals.length > 0 && (
          <div className="w-full max-w-xs mt-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                Flash
              </span>
              <span
                className="text-[10px] font-semibold rounded-full px-1.5 py-0.5 leading-none"
                style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
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
                    onClick={() => onPickFlash(deal)}
                    className="flex flex-col rounded-2xl overflow-hidden text-left transition-opacity hover:opacity-80 cursor-pointer bg-card"
                  >
                    <div className="relative aspect-square w-full bg-muted">
                      <Image src={deal.photoUrl} alt={deal.title ?? "Flash"} fill className="object-cover" />
                    </div>
                    <div className="px-2.5 py-2 flex flex-col gap-0.5">
                      <p className="text-xs font-semibold truncate text-foreground">
                        {deal.title ?? "Flash"}
                      </p>
                      <p className="text-[10px] text-muted-foreground">
                        {deal.isRepeatable ? "Repeatable" : "Non-repeatable"}
                      </p>
                      {minAmt !== null && (
                        <p className="text-xs font-semibold text-foreground">
                          ₮{minAmt.toLocaleString("en-US")}
                          {deal.sizes.length > 1 && (
                            <span className="text-[10px] font-normal text-muted-foreground"> from</span>
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

      <div className="flex items-end justify-between px-6 pb-6 pt-4">
        <div className="flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 36 36" fill="none" aria-hidden="true">
            <rect width="36" height="36" rx="8" fill="#1a1a1a" />
            <path d="M18 7C18 7 11 15.5 11 21a7 7 0 0 0 14 0c0-5.5-7-14-7-14Z" fill="#f5e642" />
          </svg>
          <span className="text-xs font-bold tracking-widest uppercase text-foreground">INKBY</span>
        </div>
        <p className="text-[10px] text-right text-muted-foreground">
          Painlessly manage your<br />requests, books, and deposits
        </p>
      </div>
    </>
  );
}
