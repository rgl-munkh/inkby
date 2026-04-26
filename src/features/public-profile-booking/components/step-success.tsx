import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { Artist } from "../types";
import { SmileyIcon } from "./booking-wizard-ui";

type StepSuccessProps = {
  artist: Artist;
  displayName: string;
  size: string;
  placement: string;
  idea: string;
  photoUrls: string[];
  bookingRequestId: string | null;
  onDone: () => void;
};

export function StepSuccess({
  artist,
  displayName,
  size,
  placement,
  idea,
  photoUrls,
  bookingRequestId,
  onDone,
}: StepSuccessProps) {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center px-5 py-12 gap-6">
      <SmileyIcon size={64} />

      <div className="text-center">
        <h1 className="text-2xl font-bold leading-snug text-foreground">
          Your request<br />has been sent
        </h1>
      </div>

      <div
        className="w-full max-w-xs rounded-2xl overflow-hidden flex items-center justify-center gap-0 px-2 bg-card"
      >
        {photoUrls.length > 0 && (
          <div className="w-20 h-20 flex justify-center items-center relative shrink-0 overflow-hidden rounded-xl">
            <Image src={photoUrls[0]} alt="Reference" fill className="object-cover" />
          </div>
        )}
        <div className="flex flex-col gap-1.5 p-4 justify-center">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className="text-[10px] font-bold rounded-full px-2 py-0.5"
              style={{ background: "#fb923c", color: "var(--card)" }}
            >
              {size}
            </span>
            <span
              className="text-[10px] font-medium rounded-full px-2 py-0.5"
              style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
            >
              {placement}
            </span>
          </div>
          <p className="text-sm font-semibold text-foreground">{displayName}</p>
          {idea && (
            <p className="text-xs line-clamp-2 text-muted-foreground">{idea}</p>
          )}
        </div>
      </div>

      <p className="text-xs text-center max-w-xs leading-relaxed text-muted-foreground">
        @{artist.slug} will review your submission,<br />
        and request a deposit if accepted.
      </p>

      <Button
        onClick={onDone}
        className="w-full max-w-xs rounded-full h-12 text-xs font-semibold tracking-widest uppercase cursor-pointer"
        style={{ background: "var(--foreground)", color: "var(--card)" }}
      >
        DONE
      </Button>

      {bookingRequestId && (
        <a
          href={`/booking/${bookingRequestId}`}
          className="text-xs font-medium underline underline-offset-2 text-muted-foreground"
        >
          View your booking
        </a>
      )}
    </div>
  );
}
