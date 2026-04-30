"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useClipboardCopy } from "@/hooks/use-clipboard-copy";
import { MIN_SLUG_LENGTH } from "@/lib/constants";
import {
  completeArtistOnboarding,
  getCurrentUserEmail,
  signOutArtist,
} from "../services/onboarding-service";

function sanitizeSlug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9._]/g, "");
}

export function useOnboardingFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [instagram, setInstagram] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [deposit, setDeposit] = useState(100000);
  const [depositInput, setDepositInput] = useState("100,000");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const { copied, copy: copyToClipboard } = useClipboardCopy();

  const profileLink = `${typeof window !== "undefined" ? window.location.host : ""}/@${slug || "yourname"}`;

  useEffect(() => {
    getCurrentUserEmail().then(({ hasUser, email }) => {
      if (!hasUser) router.replace("/login");
      else setUserEmail(email);
    });
  }, [router]);

  function handleInstagramChange(value: string) {
    setInstagram(value);
    if (!slugManuallyEdited) {
      setSlug(sanitizeSlug(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlugManuallyEdited(true);
    setSlug(sanitizeSlug(value));
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
    await signOutArtist();
    router.push("/login");
  }

  async function handleFinish() {
    setError("");
    setLoading(true);
    try {
      const result = await completeArtistOnboarding({ slug, instagram, deposit });
      if (result.error) {
        setError(result.error);
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
    if (!instagram.trim()) {
      setError("Enter your Instagram handle");
      return;
    }
    if (slug.length < MIN_SLUG_LENGTH) {
      setError("Username must be at least 2 characters");
      return;
    }
    setError("");
    setStep(2);
  }

  function goToStep3() {
    if (deposit <= 0) {
      setError("Enter a deposit amount");
      return;
    }
    setError("");
    setStep(3);
  }

  return {
    adjustDeposit,
    copied,
    depositInput,
    error,
    goToStep2,
    goToStep3,
    handleCopy,
    handleDepositChange,
    handleFinish,
    handleInstagramChange,
    handleLogout,
    handleSlugChange,
    instagram,
    loading,
    profileLink,
    slug,
    step,
    userEmail,
  };
}
