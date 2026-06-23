"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useOnboardingFlow } from "./hooks/use-onboarding-flow";
import { StepIndicator } from "./components/step-indicator";
import { DepositStep, LinkStep, ProfileStep } from "./components/onboarding-steps";
import { MailIcon } from "./components/onboarding-icons";

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
        <div className="flex items-center justify-between gap-3 px-6 py-4 sm:px-8">
          <div className="flex items-center gap-2.5">
            <Image
              src="/brand/outsider.png"
              alt="Outsider"
              width={28}
              height={34}
              priority
              className="h-7 w-auto dark:invert"
            />
            {flow.userEmail && (
              <span className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
                <MailIcon />
                {flow.userEmail}
              </span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={flow.handleLogout}
            className="cursor-pointer rounded-full border-border bg-transparent px-4 text-xs uppercase tracking-widest text-foreground hover:bg-muted"
          >
            LOGOUT
          </Button>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-6 py-8">
          <div
            className={`flex w-full flex-col items-center gap-8 transition-[max-width] duration-300 ${
              flow.step === 3 ? "max-w-2xl" : "max-w-md"
            }`}
          >
            <div className="w-full max-w-md">
              <StepIndicator current={flow.step} />
            </div>

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
