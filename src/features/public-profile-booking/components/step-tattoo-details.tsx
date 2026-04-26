import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { Artist } from "../types";
import { SIZES, PLACEMENTS } from "../constants";
import { BackButton, PillSelect, QuestionCard, SmileyIcon } from "./booking-wizard-ui";

type StepTattooDetailsProps = {
  artist: Artist;
  displayName: string;
  idea: string;
  setIdea: (v: string) => void;
  photoFiles: File[];
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onPhotoChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemovePhoto: (index: number) => void;
  size: string;
  setSize: (v: string) => void;
  placement: string;
  setPlacement: (v: string) => void;
  error: string;
  onBack: () => void;
  onContinue: () => void;
};

export function StepTattooDetails({
  artist,
  displayName,
  idea,
  setIdea,
  photoFiles,
  fileInputRef,
  onPhotoChange,
  onRemovePhoto,
  size,
  setSize,
  placement,
  setPlacement,
  error,
  onBack,
  onContinue,
}: StepTattooDetailsProps) {
  return (
    <div className="flex flex-col min-h-screen px-5 py-4">
      <div className="mb-4">
        <BackButton onClick={onBack} />
      </div>

      <div className="flex flex-col items-center gap-2 mb-6">
        {artist.avatarUrl ? (
          <div className="w-12 h-12 rounded-full overflow-hidden relative">
            <Image src={artist.avatarUrl} alt={displayName} fill className="object-cover" />
          </div>
        ) : (
          <SmileyIcon size={48} />
        )}
        <p className="text-sm font-semibold text-inkby-fg">Book with @{artist.slug}</p>
      </div>

      <div className="flex flex-col gap-3 max-w-sm mx-auto w-full pb-8">
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
            onChange={onPhotoChange}
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
                    onClick={() => onRemovePhoto(i)}
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

        <QuestionCard
          index={3}
          total={4}
          title="What size are you thinking?"
          description="Gives me a sense of how much time it'll take for the appointment."
        >
          <PillSelect options={SIZES} value={size} onChange={setSize} />
        </QuestionCard>

        <QuestionCard
          index={4}
          total={4}
          title="Where would you like your tattoo?"
        >
          <PillSelect options={PLACEMENTS} value={placement} onChange={setPlacement} />
        </QuestionCard>

        {error && <p className="text-xs text-center text-inkby-error">{error}</p>}

        <Button
          onClick={onContinue}
          className="w-full rounded-full h-12 text-xs font-semibold tracking-widest uppercase cursor-pointer"
          style={{ background: "var(--inkby-fg)", color: "var(--inkby-surface)" }}
        >
          CONTINUE
        </Button>
      </div>
    </div>
  );
}
