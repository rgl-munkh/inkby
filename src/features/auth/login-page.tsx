"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleIcon } from "@/components/icons/GoogleIcon";
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

function LogoIcon() {
    return (
        <svg
            width="36"
            height="36"
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <rect width="36" height="36" rx="8" fill="#1a1a1a" />
            <path
                d="M18 7C18 7 11 15.5 11 21a7 7 0 0 0 14 0c0-5.5-7-14-7-14Z"
                fill="#f5e642"
            />
        </svg>
    );
}

function EyeIcon({ open }: { open: boolean }) {
    return open ? (
        <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path
                d="M1 9s3-5.5 8-5.5S17 9 17 9s-3 5.5-8 5.5S1 9 1 9Z"
                stroke="#b0aca6"
                strokeWidth="1.5"
                strokeLinejoin="round"
            />
            <circle cx="9" cy="9" r="2.5" stroke="#b0aca6" strokeWidth="1.5" />
        </svg>
    ) : (
        <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <path
                d="M1 9s3-5.5 8-5.5S17 9 17 9s-3 5.5-8 5.5S1 9 1 9Z"
                stroke="#b0aca6"
                strokeWidth="1.5"
                strokeLinejoin="round"
            />
            <circle cx="9" cy="9" r="2.5" stroke="#b0aca6" strokeWidth="1.5" />
            <line
                x1="2"
                y1="2"
                x2="16"
                y2="16"
                stroke="#b0aca6"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
}

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
        <main className="min-h-screen flex bg-inkby-canvas">
            {/* Left: photo collage */}
            <div className="hidden lg:grid lg:w-1/2 grid-cols-2 grid-rows-2 gap-1 p-1">
                <div className="row-span-2 relative overflow-hidden rounded-lg">
                    <Image
                        src={collageImages[2].src}
                        alt={collageImages[2].alt}
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="relative overflow-hidden rounded-lg">
                    <Image
                        src={collageImages[1].src}
                        alt={collageImages[1].alt}
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="relative overflow-hidden rounded-lg">
                    <Image
                        src={collageImages[0].src}
                        alt={collageImages[0].alt}
                        fill
                        className="object-cover"
                    />
                </div>
            </div>

            {/* Right: login form */}
            <div className="flex flex-1 items-center justify-center px-6 py-12">
                <div className="w-full max-w-sm flex flex-col items-center gap-6">
                    <LogoIcon />

                    <div className="text-center">
                        <h1
                            className="text-3xl font-bold tracking-tight leading-tight text-inkby-fg"
                        >
                            Welcome back
                        </h1>
                        <p className="mt-2 text-sm text-inkby-fg-secondary">
                            Good to see you again.
                        </p>
                    </div>

                    <Button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={googleLoading}
                        className="h-auto p-0 flex items-center justify-center gap-2 font-normal text-white cursor-pointer w-full py-4 px-6 rounded-full"
                        style={{ background: "var(--inkby-google-btn)" }}
                    >
                        <GoogleIcon />
                        {googleLoading ? "Redirecting..." : "Continue with Google"}
                    </Button>

                    <hr className="w-full border-t border-inkby-border-medium" />

                    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
                        <Input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="rounded-xl py-8 px-4 placeholder:text-sm placeholder:text-inkby-fg-placeholder focus-visible:ring-1 focus-visible:ring-inkby-fg-placeholder"
                            style={{
                                background: "var(--inkby-surface)",
                                border: "1px solid var(--inkby-border-medium)",
                                color: "var(--inkby-fg)",
                            }}
                        />

                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="rounded-xl py-8 pl-4 pr-11 placeholder:text-sm placeholder:text-inkby-fg-placeholder focus-visible:ring-1 focus-visible:ring-inkby-fg-placeholder"
                                style={{
                                    background: "var(--inkby-surface)",
                                    border: "1px solid var(--inkby-border-medium)",
                                    color: "var(--inkby-fg)",
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 cursor-pointer"
                                tabIndex={-1}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                <EyeIcon open={showPassword} />
                            </button>
                        </div>

                        {error && (
                            <p className="text-xs text-center text-inkby-error">
                                {error}
                            </p>
                        )}

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 rounded-full py-6 px-4 text-xs font-semibold tracking-widest uppercase mt-1 cursor-pointer"
                            style={{ background: "var(--inkby-fg)", color: "var(--inkby-surface)" }}
                        >
                            {loading && <Spinner />}
                            Log in
                        </Button>
                    </form>

                    <p className="text-xs text-inkby-fg-subtle">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/register"
                            className="underline underline-offset-2 text-inkby-fg-subtle"
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    );
}
