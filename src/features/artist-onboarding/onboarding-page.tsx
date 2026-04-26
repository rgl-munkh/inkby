"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useClipboardCopy } from "@/hooks/use-clipboard-copy";
import { DEPOSIT_STEP, MIN_SLUG_LENGTH } from "@/lib/constants";
import { Spinner } from "@/components/icons/spinner";

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

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" stroke="#b0aca6" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4" stroke="#b0aca6" strokeWidth="1.5" />
      <circle cx="17.5" cy="6.5" r="1" fill="#b0aca6" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
        stroke="#b0aca6" strokeWidth="1.5" strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="4" stroke="#b0aca6" strokeWidth="1.5" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const STEPS = ["Profile", "Booking", "Customize"] as const;

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center rounded-full p-1 gap-1 bg-muted">
      {STEPS.map((label, i) => {
        const stepNum = i + 1;
        const isActive = stepNum === current;
        const isDone = stepNum < current;
        return (
          <div
            key={label}
            className="flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all"
            style={{
              background: isActive ? "var(--foreground)" : "transparent",
              color: isActive ? "var(--card)" : isDone ? "var(--foreground)" : "var(--muted-foreground)",
            }}
          >
            {isDone && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="12" r="10" fill="#1a1a1a" />
                <path d="M7 12l3 3 7-7" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {label}
          </div>
        );
      })}
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [instagram, setInstagram] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [deposit, setDeposit] = useState(100000);
  const [depositInput, setDepositInput] = useState("100,000");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { copied, copy: copyToClipboard } = useClipboardCopy();
  const [userEmail, setUserEmail] = useState("");

  const profileLink = `${typeof window !== "undefined" ? window.location.host : ""}/@${slug || "yourname"}`;

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.replace("/login");
      else setUserEmail(data.user.email ?? "");
    });
  }, [router]);

  function handleInstagramChange(value: string) {
    setInstagram(value);
    if (!slugManuallyEdited) {
      setSlug(value.toLowerCase().replace(/[^a-z0-9._]/g, ""));
    }
  }

  function handleSlugChange(value: string) {
    setSlugManuallyEdited(true);
    setSlug(value.toLowerCase().replace(/[^a-z0-9._]/g, ""));
  }

  function handleDepositChange(raw: string) {
    const numeric = raw.replace(/[^0-9]/g, "");
    const num = parseInt(numeric || "0", 10);
    setDeposit(num);
    setDepositInput(num.toLocaleString("en-US"));
  }

  function adjustDeposit(delta: number) {
    const next = Math.max(0, deposit + delta);
    setDeposit(next);
    setDepositInput(next.toLocaleString("en-US"));
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function handleFinish() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/artist/onboarding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          instagram_username: instagram,
          deposit_amount: deposit,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    copyToClipboard(`https://${profileLink}`);
  }

  function goToStep2() {
    if (!instagram.trim()) { setError("Enter your Instagram handle"); return; }
    if (slug.length < MIN_SLUG_LENGTH) { setError("Username must be at least 2 characters"); return; }
    setError("");
    setStep(2);
  }

  function goToStep3() {
    if (deposit <= 0) { setError("Enter a deposit amount"); return; }
    setError("");
    setStep(3);
  }

  return (
    <main className="min-h-screen flex bg-background">
      {/* Left: photo collage */}
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

      {/* Right: step content */}
      <div className="flex flex-1 flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-8 py-4">
          {userEmail ? (
            <span className="text-xs flex items-center gap-1.5 text-muted-foreground">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="2" y="4" width="20" height="16" rx="2" stroke="#8a8680" strokeWidth="1.5" />
                <path d="M2 8l10 6 10-6" stroke="#8a8680" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {userEmail}
            </span>
          ) : (
            <span />
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="rounded-full text-xs tracking-widest uppercase px-4 cursor-pointer"
            style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "transparent" }}
          >
            LOGOUT
          </Button>
        </div>

        {/* Step content */}
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-8">
          <div className="flex flex-col items-center gap-8 w-full max-w-md">
            <StepIndicator current={step} />

            {/* ── Step 1: Profile ── */}
            {step === 1 && (
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
                  {/* Instagram */}
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
                        onChange={(e) => handleInstagramChange(e.target.value)}
                        autoFocus
                        className="flex-1 border-0 rounded-none bg-transparent h-12 px-0 focus-visible:ring-0 focus-visible:border-0 placeholder:text-sm placeholder:text-muted-foreground text-foreground"
                      />
                      <div className="pr-4">
                        <InstagramIcon />
                      </div>
                    </div>
                  </div>

                  {/* Slug */}
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
                        onChange={(e) => handleSlugChange(e.target.value)}
                        minLength={2}
                        maxLength={30}
                        className="flex-1 border-0 rounded-none bg-transparent h-12 px-0 pr-4 focus-visible:ring-0 focus-visible:border-0 placeholder:text-sm placeholder:text-muted-foreground text-foreground"
                      />
                    </div>
                  </div>
                </div>

                {error && <p className="text-xs text-center text-destructive">{error}</p>}

                <Button
                  onClick={goToStep2}
                  className="w-full rounded-full h-12 text-xs font-semibold tracking-widest uppercase flex items-center justify-between px-6 cursor-pointer"
                  style={{ background: "var(--foreground)", color: "var(--card)" }}
                >
                  NEXT
                  <ArrowRightIcon />
                </Button>
              </>
            )}

            {/* ── Step 2: Deposit ── */}
            {step === 2 && (
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
                  {/* Amount controls */}
                  <div className="flex items-center gap-4">
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => adjustDeposit(-DEPOSIT_STEP)}
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
                        onChange={(e) => handleDepositChange(e.target.value)}
                        className="text-4xl font-black tracking-tight border-0 bg-transparent focus-visible:ring-0 focus-visible:border-0 w-44 text-center h-auto p-0 placeholder:text-sm placeholder:text-muted-foreground text-foreground"
                      />
                    </div>
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => adjustDeposit(DEPOSIT_STEP)}
                      className="rounded-full w-10 h-10 text-lg font-bold cursor-pointer shrink-0"
                      style={{ background: "var(--muted)", color: "var(--foreground)" }}
                      aria-label="Increase"
                    >
                      +
                    </Button>
                  </div>

                  {/* Currency badge */}
                  <Badge
                    variant="secondary"
                    className="rounded-full px-4 py-1.5 text-sm font-medium h-auto"
                    style={{ background: "var(--muted)", color: "var(--foreground)" }}
                  >
                    MNT ₮
                  </Badge>

                  {/* Helper */}
                  <p
                    className="text-xs text-center rounded-xl px-4 py-3 w-full"
                    style={{ background: "var(--muted)", color: "var(--muted-foreground)" }}
                  >
                    Most tattoo artists charge ₮100,000 deposits
                  </p>
                </div>

                {error && <p className="text-xs text-center text-destructive">{error}</p>}

                <Button
                  onClick={goToStep3}
                  className="w-full rounded-full h-12 text-xs font-semibold tracking-widest uppercase flex items-center justify-between px-6 cursor-pointer"
                  style={{ background: "var(--foreground)", color: "var(--card)" }}
                >
                  NEXT
                  <ArrowRightIcon />
                </Button>
              </>
            )}

            {/* ── Step 3: Link in bio ── */}
            {step === 3 && (
              <div className="w-full rounded-2xl overflow-hidden flex flex-col sm:flex-row" style={{ minHeight: 340 }}>
                {/* Left: profile card */}
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
                    <p className="text-xs mt-0.5 text-muted-foreground">{typeof window !== "undefined" ? window.location.host : "inkby.mn"}/{slug}</p>
                  </div>
                </div>

                {/* Right: dark panel */}
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

                  {/* Copy link pill */}
                  <div
                    className="flex items-center gap-2 rounded-full pl-4 pr-1 py-1 w-full"
                    style={{ background: "#18181b" }}
                  >
                    <span className="text-xs font-medium flex-1 truncate text-zinc-300">
                      {profileLink}
                    </span>
                    <Button
                      onClick={handleCopy}
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
                    onClick={handleFinish}
                    disabled={loading}
                    variant="outline"
                    className="w-full rounded-full h-11 text-xs font-semibold tracking-widest uppercase flex items-center justify-center gap-2 cursor-pointer"
                    style={{ background: "var(--card)", color: "var(--foreground)", borderColor: "var(--card)" }}
                  >
                    {loading && <Spinner />}
                    LET&apos;S GET STARTED
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
