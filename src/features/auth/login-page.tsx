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

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
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

    async function handleGoogleSignIn() {
        setGoogleLoading(true);
        const supabase = createClient();

        const { error: oauthError } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/api/auth/callback?next=/dashboard`,
            },
        });

        if (oauthError) {
            setError(oauthError.message);
            setGoogleLoading(false);
        }
    }

    return (
        <AuthShell title="Welcome back" subtitle="Good to see you again.">
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
                    autoComplete="current-password"
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword((v) => !v)}
                />
                <AuthError message={error} />
                <AuthSubmitButton loading={loading}>Log in</AuthSubmitButton>
            </form>
            <AuthSwitchLink
                label="Don't have an account?"
                href="/register"
                linkText="Sign up"
            />
        </AuthShell>
    );
}
