"use client";

import { useProfileBookingFlow } from "./hooks/use-profile-booking-flow";
import { AvailabilityPanel } from "./components/availability-panel";
import { StepLanding } from "./components/step-landing";
import { StepPersonal } from "./components/step-personal";
import { StepSuccess } from "./components/step-success";
import { StepTattooDetails } from "./components/step-tattoo-details";
import type { Artist, FlashDeal } from "./types";

export function ProfileBookingFlow({
  artist,
  initialFlashDeals,
}: {
  artist: Artist;
  initialFlashDeals: FlashDeal[];
}) {
  const v = useProfileBookingFlow({ artist, initialFlashDeals });

  return (
    <main className="min-h-screen flex flex-col bg-inkby-profile-canvas">
      {v.step === 0 && (
        <StepLanding
          artist={v.artist}
          flashDeals={v.flashDeals}
          displayName={v.displayName}
          chosenDatetime={v.chosenDatetime}
          onOpenAvailability={() => v.setShowAvailability(true)}
          onStartBooking={() => v.setStep(1)}
          onPickFlash={v.pickFlashDeal}
        />
      )}

      {v.step === 1 && (
        <StepTattooDetails
          artist={v.artist}
          displayName={v.displayName}
          idea={v.idea}
          setIdea={v.setIdea}
          photoFiles={v.photoFiles}
          fileInputRef={v.fileInputRef}
          onPhotoChange={v.handlePhotoChange}
          onRemovePhoto={v.removePhoto}
          size={v.size}
          setSize={v.setSize}
          placement={v.placement}
          setPlacement={v.setPlacement}
          error={v.error}
          onBack={() => { v.setError(""); v.setStep(0); }}
          onContinue={v.continueFromTattooStep}
        />
      )}

      {v.step === 2 && (
        <StepPersonal
          artist={v.artist}
          firstName={v.firstName}
          setFirstName={v.setFirstName}
          lastName={v.lastName}
          setLastName={v.setLastName}
          phone={v.phone}
          setPhone={v.setPhone}
          email={v.email}
          setEmail={v.setEmail}
          error={v.error}
          submitting={v.submitting}
          onBack={() => { v.setError(""); v.setStep(1); }}
          onSubmit={v.handleSubmit}
        />
      )}

      {v.step === 3 && (
        <StepSuccess
          artist={v.artist}
          displayName={v.displayName}
          size={v.size}
          placement={v.placement}
          idea={v.idea}
          photoUrls={v.photoUrls}
          bookingRequestId={v.bookingRequestId}
          onDone={v.resetAfterSuccess}
        />
      )}

      {v.showAvailability && (
        <AvailabilityPanel
          slug={v.artist.slug}
          onClose={() => v.setShowAvailability(false)}
          onSelect={(datetime) => {
            v.setChosenDatetime(datetime);
            v.setShowAvailability(false);
          }}
        />
      )}
    </main>
  );
}
