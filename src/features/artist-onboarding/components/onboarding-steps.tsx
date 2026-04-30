"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/icons/spinner";
import { DEPOSIT_STEP } from "@/lib/constants";
import {
  ArrowRightIcon,
  CameraIcon,
  CheckIcon,
  CopyIcon,
  InstagramIcon,
} from "./onboarding-icons";

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
  return (
    <>
      <div className="text-center">
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground">
          Choose your<br />Inkby username
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Match your Inkby and Instagram handles<br />for the most seamless client experience.
        </p>
      </div>

      <div className="w-full flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="instagram" className="text-muted-foreground" style={{ fontSize: "11px" }}>
            Instagram
          </Label>
          <div
            className="flex items-center rounded-xl overflow-hidden"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <span className="pl-4 pr-1 shrink-0 text-sm select-none text-muted-foreground">
              instagram.com/
            </span>
            <Input
              id="instagram"
              type="text"
              placeholder="yourhandle"
              value={instagram}
              onChange={(event) => onInstagramChange(event.target.value)}
              autoFocus
              className="flex-1 border-0 rounded-none bg-transparent h-12 px-0 focus-visible:ring-0 focus-visible:border-0 placeholder:text-sm placeholder:text-muted-foreground text-foreground"
            />
            <div className="pr-4">
              <InstagramIcon />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="slug" className="text-muted-foreground" style={{ fontSize: "11px" }}>
            Username
          </Label>
          <div
            className="flex items-center rounded-xl overflow-hidden"
            style={{ background: "var(--card)", border: "1px solid var(--border)" }}
          >
            <span className="pl-4 pr-1 shrink-0 text-sm select-none text-muted-foreground">
              {typeof window !== "undefined" ? window.location.host : "inkby.mn"}/@
            </span>
            <Input
              id="slug"
              type="text"
              placeholder="yourname"
              value={slug}
              onChange={(event) => onSlugChange(event.target.value)}
              minLength={2}
              maxLength={30}
              className="flex-1 border-0 rounded-none bg-transparent h-12 px-0 pr-4 focus-visible:ring-0 focus-visible:border-0 placeholder:text-sm placeholder:text-muted-foreground text-foreground"
            />
          </div>
        </div>
      </div>

      {error && <p className="text-xs text-center text-destructive">{error}</p>}

      <Button
        onClick={onNext}
        className="w-full rounded-full h-12 text-xs font-semibold tracking-widest uppercase flex items-center justify-between px-6 cursor-pointer"
        style={{ background: "var(--foreground)", color: "var(--card)" }}
      >
        NEXT
        <ArrowRightIcon />
      </Button>
    </>
  );
}

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
  return (
    <>
      <div className="text-center">
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground">
          How much are<br />your deposits?
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Appointments aren&apos;t booked until the deposit is paid.
        </p>
      </div>

      <div className="flex flex-col items-center gap-4 w-full">
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => onAdjustDeposit(-DEPOSIT_STEP)}
            className="rounded-full w-10 h-10 text-lg font-bold cursor-pointer shrink-0"
            style={{ background: "var(--muted)", color: "var(--foreground)" }}
            aria-label="Decrease"
          >
            −
          </Button>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-black tracking-tight text-muted-foreground">₮</span>
            <Input
              type="text"
              inputMode="numeric"
              value={depositInput}
              onChange={(event) => onDepositChange(event.target.value)}
              className="text-4xl font-black tracking-tight border-0 bg-transparent focus-visible:ring-0 focus-visible:border-0 w-44 text-center h-auto p-0 placeholder:text-sm placeholder:text-muted-foreground text-foreground"
            />
          </div>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => onAdjustDeposit(DEPOSIT_STEP)}
            className="rounded-full w-10 h-10 text-lg font-bold cursor-pointer shrink-0"
            style={{ background: "var(--muted)", color: "var(--foreground)" }}
            aria-label="Increase"
          >
            +
          </Button>
        </div>

        <Badge
          variant="secondary"
          className="rounded-full px-4 py-1.5 text-sm font-medium h-auto"
          style={{ background: "var(--muted)", color: "var(--foreground)" }}
        >
          MNT ₮
        </Badge>

        <p
          className="text-xs text-center rounded-xl px-4 py-3 w-full"
          style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
        >
          Most tattoo artists charge ₮100,000 deposits
        </p>
      </div>

      {error && <p className="text-xs text-center text-destructive">{error}</p>}

      <Button
        onClick={onNext}
        className="w-full rounded-full h-12 text-xs font-semibold tracking-widest uppercase flex items-center justify-between px-6 cursor-pointer"
        style={{ background: "var(--foreground)", color: "var(--card)" }}
      >
        NEXT
        <ArrowRightIcon />
      </Button>
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
  return (
    <div className="w-full rounded-2xl overflow-hidden flex flex-col sm:flex-row" style={{ minHeight: 340 }}>
      <div
        className="flex flex-col items-center justify-center gap-3 p-8 flex-1"
        style={{ background: "var(--muted)" }}
      >
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: "var(--muted)" }}
        >
          <CameraIcon />
        </div>
        <div className="text-center">
          <p className="font-semibold text-base text-foreground">@{slug}</p>
          <p className="text-xs mt-0.5 text-muted-foreground">
            {typeof window !== "undefined" ? window.location.host : "inkby.mn"}/{slug}
          </p>
        </div>
      </div>

      <div
        className="flex flex-col items-center justify-center gap-5 p-8 flex-1"
        style={{ background: "var(--foreground)" }}
      >
        <div className="text-center">
          <h2 className="text-2xl font-extrabold leading-tight text-background">
            Your new<br />link in bio
          </h2>
          <p className="mt-2 text-xs text-muted-foreground">
            Drop your new booking link in your IG,<br />
            TikTok, newsletter, whatever, and<br />
            watch your requests roll in.
          </p>
        </div>

        <div
          className="flex items-center gap-2 rounded-full pl-4 pr-1 py-1 w-full"
          style={{ background: "#18181b" }}
        >
          <span className="text-xs font-medium flex-1 truncate text-zinc-300">
            {profileLink}
          </span>
          <Button
            onClick={onCopy}
            size="sm"
            className="rounded-full flex items-center gap-1.5 px-3 text-xs font-medium cursor-pointer shrink-0 h-7"
            style={{
              background: copied ? "#2d6a4f" : "#27272a",
              color: copied ? "#95d5b2" : "#d4d4d8",
            }}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>

        {error && <p className="text-xs text-center text-destructive">{error}</p>}

        <Button
          onClick={onFinish}
          disabled={loading}
          variant="outline"
          className="w-full rounded-full h-11 text-xs font-semibold tracking-widest uppercase flex items-center justify-center gap-2 cursor-pointer"
          style={{
            background: "var(--card)",
            color: "var(--foreground)",
            borderColor: "var(--card)",
          }}
        >
          {loading && <Spinner />}
          LET&apos;S GET STARTED
        </Button>
      </div>
    </div>
  );
}
