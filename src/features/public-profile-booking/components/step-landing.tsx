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
      <div className="flex-1 flex flex-col items-center justify-center gap-5 px-5 py-10">
        {artist.avatarUrl ? (
          <div className="w-24 h-24 rounded-full overflow-hidden relative border border-border bg-card">
            <Image
              src={artist.avatarUrl}
              alt={displayName}
              fill
              sizes="96px"
              className="object-cover"
            />
          </div>
        ) : (
          <SmileyIcon size={96} />
        )}
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-2xl font-bold tracking-tight text-foreground">
            @{artist.slug}
          </p>
          {artist.bio && (
            <p className="max-w-xs text-sm leading-5 text-muted-foreground">
              {artist.bio}
            </p>
          )}
        </div>
        <Button
          onClick={onStartBooking}
          className="w-full max-w-xs rounded-full h-12 text-sm font-bold cursor-pointer mt-1"
          style={{ background: "var(--foreground)", color: "var(--card)" }}
        >
          Book a tattoo
        </Button>
        <Button
          type="button"
          onClick={onOpenAvailability}
          className="w-full max-w-xs rounded-full h-11 text-xs font-semibold cursor-pointer transition-colors hover:bg-muted border"
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
        </Button>

        {flashDeals.length > 0 && (
          <div className="w-full max-w-xs mt-2">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                Flash
              </span>
              <span
                className="text-[10px] font-semibold rounded-full px-1.5 py-0.5 leading-none"
                style={{
                  background: "var(--muted)",
                  color: "var(--muted-foreground)",
                }}
              >
                {flashDeals.length}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {flashDeals.map((deal) => {
                const minAmt = deal.sizes.length
                  ? Math.min(
                      ...deal.sizes.map((s) => Number(s.estimatedAmount)),
                    )
                  : null;
                return (
                  <button
                    key={deal.id}
                    type="button"
                    onClick={() => onPickFlash(deal)}
                    className="flex flex-col rounded-xl overflow-hidden text-left transition-opacity hover:opacity-85 cursor-pointer bg-card border border-border"
                  >
                    <div className="relative aspect-square w-full bg-muted">
                      <Image
                        src={deal.photoUrl}
                        alt={deal.title ?? "Flash"}
                        fill
                        sizes="(max-width: 640px) 45vw, 160px"
                        className="object-cover"
                      />
                    </div>
                    <div className="px-2.5 py-2.5 flex flex-col gap-0.5">
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
                            <span className="text-[10px] font-normal text-muted-foreground">
                              {" "}
                              from
                            </span>
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
          <svg
            width="14"
            height="14"
            viewBox="0 0 36 36"
            fill="none"
            aria-hidden="true"
          >
            <rect width="36" height="36" rx="8" fill="#1a1a1a" />
            <path
              d="M18 7C18 7 11 15.5 11 21a7 7 0 0 0 14 0c0-5.5-7-14-7-14Z"
              fill="#f5e642"
            />
          </svg>
          <span className="text-xs font-bold tracking-widest uppercase text-foreground">
            INKBY
          </span>
        </div>
        <p className="text-[10px] text-right text-muted-foreground">
          Painlessly manage your
          <br />
          requests, books, and deposits
        </p>
      </div>
    </>
  );
}
