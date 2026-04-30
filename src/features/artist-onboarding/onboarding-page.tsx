"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useOnboardingFlow } from "./hooks/use-onboarding-flow";
import { StepIndicator } from "./components/step-indicator";
import { DepositStep, LinkStep, ProfileStep } from "./components/onboarding-steps";

const collageImages = [
  {
    src: "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?w=600&q=100",
    alt: "Tattoo artist at work",
  },
  {
    src: "https://images.unsplash.com/photo-1565058379802-bbe93b2f703a?w=600&q=100",
    alt: "Tattoo studio supplies",
  },
  {
    src: "https://images.unsplash.com/photo-1611501275019-9b5cda994e8d?w=800&q=100",
    alt: "Clients at a tattoo studio",
  },
];

export default function OnboardingPage() {
  const flow = useOnboardingFlow();

  return (
    <main className="min-h-screen flex bg-background">
      <div className="hidden lg:grid lg:w-1/2 grid-cols-2 grid-rows-2 gap-1 p-1">
        <div className="row-span-2 relative overflow-hidden rounded-lg">
          <Image src={collageImages[2].src} alt={collageImages[2].alt} fill className="object-cover" />
        </div>
        <div className="relative overflow-hidden rounded-lg">
          <Image src={collageImages[1].src} alt={collageImages[1].alt} fill className="object-cover" />
        </div>
        <div className="relative overflow-hidden rounded-lg">
          <Image src={collageImages[0].src} alt={collageImages[0].alt} fill className="object-cover" />
        </div>
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between px-8 py-4">
          {flow.userEmail ? (
            <span className="text-xs flex items-center gap-1.5 text-muted-foreground">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="2" stroke="#8a8680" strokeWidth="1.5" />
                <path d="M2 8l10 6 10-6" stroke="#8a8680" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {flow.userEmail}
            </span>
          ) : (
            <span />
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={flow.handleLogout}
            className="rounded-full text-xs tracking-widest uppercase px-4 cursor-pointer"
            style={{
              borderColor: "var(--border)",
              color: "var(--foreground)",
              background: "transparent",
            }}
          >
            LOGOUT
          </Button>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-6 py-8">
          <div className="flex flex-col items-center gap-8 w-full max-w-md">
            <StepIndicator current={flow.step} />

            {flow.step === 1 && (
              <ProfileStep
                error={flow.error}
                instagram={flow.instagram}
                onInstagramChange={flow.handleInstagramChange}
                onNext={flow.goToStep2}
                onSlugChange={flow.handleSlugChange}
                slug={flow.slug}
              />
            )}

            {flow.step === 2 && (
              <DepositStep
                depositInput={flow.depositInput}
                error={flow.error}
                onAdjustDeposit={flow.adjustDeposit}
                onDepositChange={flow.handleDepositChange}
                onNext={flow.goToStep3}
              />
            )}

            {flow.step === 3 && (
              <LinkStep
                copied={flow.copied}
                error={flow.error}
                loading={flow.loading}
                onCopy={flow.handleCopy}
                onFinish={flow.handleFinish}
                profileLink={flow.profileLink}
                slug={flow.slug}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
