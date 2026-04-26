import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/icons/spinner";
import type { Artist } from "../types";
import { BackButton } from "./booking-wizard-ui";

type StepPersonalProps = {
  artist: Artist;
  firstName: string;
  setFirstName: (v: string) => void;
  lastName: string;
  setLastName: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  error: string;
  submitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
};

export function StepPersonal({
  artist,
  firstName,
  setFirstName,
  lastName,
  setLastName,
  phone,
  setPhone,
  email,
  setEmail,
  error,
  submitting,
  onBack,
  onSubmit,
}: StepPersonalProps) {
  return (
    <div className="flex flex-col min-h-screen px-5 py-4">
      <div className="mb-6">
        <BackButton onClick={onBack} />
      </div>

      <div className="flex-1 flex flex-col justify-center gap-6 max-w-sm mx-auto w-full">
        <div className="text-center">
          <h1 className="text-2xl font-bold leading-snug text-inkby-fg">
            Tell us a bit<br />about yourself
          </h1>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <div className="flex-1 flex flex-col gap-1.5">
              <Label htmlFor="firstName" className="text-[10px] tracking-widest uppercase text-inkby-fg-muted">
                First Name
              </Label>
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="rounded-xl h-12 placeholder:text-sm"
                style={{ background: "var(--inkby-surface)", borderColor: "var(--inkby-border)" }}
              />
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <Label htmlFor="lastName" className="text-[10px] tracking-widest uppercase text-inkby-fg-muted">
                Last Name
              </Label>
              <Input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="rounded-xl h-12 placeholder:text-sm"
                style={{ background: "var(--inkby-surface)", borderColor: "var(--inkby-border)" }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone" className="text-[10px] tracking-widest uppercase text-inkby-fg-muted">
              Phone Number
            </Label>
            <div
              className="flex items-center rounded-xl overflow-hidden"
              style={{ background: "var(--inkby-surface)", border: "1px solid var(--inkby-border)" }}
            >
              <div className="flex items-center gap-1.5 pl-3 pr-2 shrink-0 select-none">
                <span className="text-base">🇲🇳</span>
                <span className="text-sm text-inkby-fg-secondary">+976</span>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M6 9l6 6 6-6" stroke="#b0aca6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <Input
                id="phone"
                type="tel"
                placeholder="8812 3456"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 border-0 rounded-none bg-transparent h-12 px-2 focus-visible:ring-0 focus-visible:border-0 placeholder:text-sm text-inkby-fg"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email" className="text-[10px] tracking-widest uppercase text-inkby-fg-muted">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl h-12 placeholder:text-sm"
              style={{ background: "var(--inkby-surface)", borderColor: "var(--inkby-border)" }}
            />
          </div>
        </div>

        {error && <p className="text-xs text-center text-inkby-error">{error}</p>}

        <div className="flex flex-col gap-3">
          <p className="text-[10px] text-center leading-relaxed text-inkby-fg-muted">
            By providing your phone number, you agree to receive notifications from @{artist.slug}.{" "}
            You can opt out at any time.
          </p>
          <Button
            onClick={onSubmit}
            disabled={submitting}
            className="w-full rounded-full h-12 text-xs font-semibold tracking-widest uppercase flex items-center justify-center gap-2 cursor-pointer"
            style={{ background: "var(--inkby-fg)", color: "var(--inkby-surface)" }}
          >
            {submitting && <Spinner />}
            SEND REQUEST
          </Button>
        </div>
      </div>
    </div>
  );
}
