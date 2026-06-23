"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/icons/spinner";
import { cn } from "@/lib/utils";
import { DEPOSIT_STEP } from "@/lib/constants";
import {
  ArrowRightIcon,
  CameraIcon,
  CheckIcon,
  CopyIcon,
  InstagramIcon,
} from "./onboarding-icons";

function StepHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: React.ReactNode;
  subtitle: React.ReactNode;
}) {
  return (
    <div className="text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {eyebrow}
      </p>
      <h1 className="mt-2 text-4xl font-extrabold leading-tight tracking-tight text-foreground">
        {title}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function NextButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      className="flex h-12 w-full cursor-pointer items-center justify-between rounded-full bg-foreground px-6 text-xs font-semibold uppercase tracking-widest text-background hover:bg-foreground/90"
    >
      NEXT
      <ArrowRightIcon />
    </Button>
  );
}

export function ProfileStep({
  error,
  instagram,
  onInstagramChange,
  onNext,
  onSlugChange,
  slug,
}: {
  error: string;
  instagram: string;
  onInstagramChange: (value: string) => void;
  onNext: () => void;
  onSlugChange: (value: string) => void;
  slug: string;
}) {
  const host = typeof window !== "undefined" ? window.location.host : "inkby.mn";

  return (
    <>
      <StepHeader
        eyebrow="Step 1 · Profile"
        title={
          <>
            Choose your<br />Inkby username
          </>
        }
        subtitle={
          <>
            Match your Inkby and Instagram handles<br />for the most seamless client experience.
          </>
        }
      />

      <div className="flex w-full flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="instagram" className="text-[11px] text-muted-foreground">
            Instagram
          </Label>
          <div className="flex h-12 items-center gap-1 overflow-hidden rounded-xl border border-border bg-card px-4 transition-colors focus-within:border-foreground/40">
            <span className="shrink-0 select-none text-sm text-muted-foreground">
              instagram.com/
            </span>
            <Input
              id="instagram"
              type="text"
              placeholder="yourhandle"
              value={instagram}
              onChange={(event) => onInstagramChange(event.target.value)}
              autoFocus
              className="h-full px-2 flex-1 rounded-none border-0 !bg-transparent text-foreground placeholder:text-sm placeholder:text-muted-foreground focus-visible:border-0 focus-visible:ring-0"
            />
            <span className="shrink-0 text-muted-foreground">
              <InstagramIcon />
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="slug" className="text-[11px] text-muted-foreground">
            Username
          </Label>
          <div className="flex h-12 items-center gap-1 overflow-hidden rounded-xl border border-border bg-card px-4 transition-colors focus-within:border-foreground/40">
            <span className="shrink-0 select-none text-sm text-muted-foreground">
              {host}/@
            </span>
            <Input
              id="slug"
              type="text"
              placeholder="yourname"
              value={slug}
              onChange={(event) => onSlugChange(event.target.value)}
              minLength={2}
              maxLength={30}
              className="h-full px-2 flex-1 rounded-none border-0 !bg-transparent text-foreground placeholder:text-sm placeholder:text-muted-foreground focus-visible:border-0 focus-visible:ring-0"
            />
          </div>
        </div>
      </div>

      {error && <p className="text-center text-xs text-destructive">{error}</p>}

      <NextButton onClick={onNext} />
    </>
  );
}

const DEPOSIT_PRESETS = [50000, 100000, 150000, 200000];

export function DepositStep({
  depositInput,
  error,
  onAdjustDeposit,
  onDepositChange,
  onNext,
}: {
  depositInput: string;
  error: string;
  onAdjustDeposit: (delta: number) => void;
  onDepositChange: (value: string) => void;
  onNext: () => void;
}) {
  const depositValue = parseInt(depositInput.replace(/[^0-9]/g, "") || "0", 10);

  return (
    <>
      <StepHeader
        eyebrow="Step 2 · Booking"
        title={
          <>
            How much are<br />your deposits?
          </>
        }
        subtitle="Appointments aren't booked until the deposit is paid."
      />

      <div className="flex w-full flex-col items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => onAdjustDeposit(-DEPOSIT_STEP)}
            className="size-10 shrink-0 cursor-pointer rounded-full bg-muted text-lg font-bold text-foreground hover:bg-muted/70"
            aria-label="Decrease"
          >
            −
          </Button>
          <div className="flex items-baseline justify-center gap-1 py-10">
            <span className="text-4xl font-black tracking-tight text-muted-foreground">₮</span>
            <Input
              type="text"
              inputMode="numeric"
              value={depositInput}
              onChange={(event) => onDepositChange(event.target.value)}
              className="w-auto border-0 !bg-transparent p-0 text-center !text-3xl font-black tracking-tight text-foreground [field-sizing:content] focus-visible:border-0 focus-visible:ring-0"
            />
          </div>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => onAdjustDeposit(DEPOSIT_STEP)}
            className="size-10 shrink-0 cursor-pointer rounded-full bg-muted text-lg font-bold text-foreground hover:bg-muted/70"
            aria-label="Increase"
          >
            +
          </Button>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          {DEPOSIT_PRESETS.map((preset) => {
            const isActive = depositValue === preset;
            return (
              <button
                key={preset}
                type="button"
                onClick={() => onDepositChange(String(preset))}
                className={cn(
                  "cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  isActive
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                ₮{preset / 1000}k
              </button>
            );
          })}
        </div>
      </div>

      {error && <p className="text-center text-xs text-destructive">{error}</p>}

      <NextButton onClick={onNext} />
    </>
  );
}

export function LinkStep({
  copied,
  error,
  loading,
  onCopy,
  onFinish,
  profileLink,
  slug,
}: {
  copied: boolean;
  error: string;
  loading: boolean;
  onCopy: () => void;
  onFinish: () => void;
  profileLink: string;
  slug: string;
}) {
  const host = typeof window !== "undefined" ? window.location.host : "inkby.mn";

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-border sm:flex-row sm:min-h-[340px]">
      <div className="flex flex-1 flex-col items-center justify-center gap-3 bg-muted p-8">
        <div className="flex size-20 items-center justify-center rounded-full border border-border bg-card text-muted-foreground">
          <CameraIcon />
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-foreground">@{slug}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {host}/{slug}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-5 bg-foreground p-8">
        <div className="text-center">
          <h2 className="text-2xl font-extrabold leading-tight text-background">
            Your new<br />link in bio
          </h2>
          <p className="mt-2 text-xs text-background/70">
            Drop your new booking link in your IG,<br />
            TikTok, newsletter, whatever, and<br />
            watch your requests roll in.
          </p>
        </div>

        <div className="flex w-full items-center gap-2 rounded-full bg-background py-1 pl-4 pr-1">
          <span className="flex-1 truncate text-xs font-medium text-muted-foreground">
            {profileLink}
          </span>
          <Button
            onClick={onCopy}
            size="sm"
            className={cn(
              "h-7 shrink-0 cursor-pointer rounded-full px-3 text-xs font-medium",
              copied
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "bg-muted text-foreground hover:bg-muted/70",
            )}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>

        {error && <p className="text-center text-xs text-destructive">{error}</p>}

        <Button
          onClick={onFinish}
          disabled={loading}
          className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-background text-xs font-semibold uppercase tracking-widest text-foreground hover:bg-background/90"
        >
          {loading && <Spinner />}
          LET&apos;S GET STARTED
        </Button>
      </div>
    </div>
  );
}
