"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
    AuthError,
    AuthPasswordInput,
    AuthShell,
    AuthSubmitButton,
    AuthSwitchLink,
    AuthTextInput,
    GoogleAuthButton,
} from "./auth-ui";

export default function RegisterPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error ?? "Something went wrong");
                return;
            }

            router.push("/onboarding");
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogleSignIn() {
        setGoogleLoading(true);
        const supabase = createClient();

        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/api/auth/callback?next=/onboarding`,
            },
        });

        if (error) {
            setError(error.message);
            setGoogleLoading(false);
        }
    }

    return (
        <AuthShell title="Create an account" subtitle="Welcome! Glad you're here.">
            <GoogleAuthButton loading={googleLoading} onClick={handleGoogleSignIn} />
            <div className="h-px w-full bg-border" />
            <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
                <AuthTextInput
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                />
                <AuthPasswordInput
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword((v) => !v)}
                />
                <AuthPasswordInput
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    showPassword={showConfirmPassword}
                    onTogglePassword={() => setShowConfirmPassword((v) => !v)}
                />
                <AuthError message={error} />
                <AuthSubmitButton loading={loading}>Continue</AuthSubmitButton>
            </form>
            <AuthSwitchLink
                label="Already have an account?"
                href="/login"
                linkText="Log in"
            />
        </AuthShell>
    );
}
