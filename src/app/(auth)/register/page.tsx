"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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

function Spinner() {
    return (
        <svg
            className="animate-spin"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
        >
            <circle
                cx="8"
                cy="8"
                r="6"
                stroke="currentColor"
                strokeOpacity="0.3"
                strokeWidth="2"
            />
            <path
                d="M14 8a6 6 0 0 0-6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
            />
        </svg>
    );
}

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
        <main className="min-h-screen flex" style={{ background: "#EBE7DF" }}>
            {/* Left: photo collage */}
            <div className="hidden lg:grid lg:w-1/2 grid-cols-2 grid-rows-2 gap-1 p-1">
                <div className="row-span-2 relative overflow-hidden rounded-lg">
                    <Image
                        src={collageImages[2].src}
                        alt={collageImages[2].alt}
                        fill
                        className="object-cover"
                        unoptimized
                    />
                </div>
                <div className="relative overflow-hidden rounded-lg">
                    <Image
                        src={collageImages[1].src}
                        alt={collageImages[1].alt}
                        fill
                        className="object-cover"
                        unoptimized
                    />
                </div>
                <div className="relative overflow-hidden rounded-lg">
                    <Image
                        src={collageImages[0].src}
                        alt={collageImages[0].alt}
                        fill
                        className="object-cover"
                        unoptimized
                    />
                </div>
            </div>

            {/* Right: registration form */}
            <div className="flex flex-1 items-center justify-center px-6 py-12">
                <div className="w-full max-w-sm flex flex-col items-center gap-6">
                    {/* Logo */}
                    <LogoIcon />

                    {/* Heading */}
                    <div className="text-center">
                        <h1
                            className="text-3xl font-bold tracking-tight leading-tight"
                            style={{ color: "#1a1a1a" }}
                        >
                            Create an account
                        </h1>
                        <p className="mt-2 text-sm" style={{ color: "#6b6b6b" }}>
                            Welcome! Glad you&apos;re here.
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
                        {/* Email */}
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full rounded-xl py-3 px-4 text-sm placeholder:text-[#b0aca6] focus:outline-none"
                            style={{
                                background: "#fff",
                                border: "1px solid #D1CDC6",
                                color: "#1a1a1a",
                            }}
                        />

                        {/* Password with eye toggle */}
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full rounded-xl py-3 pl-4 pr-11 text-sm placeholder:text-[#b0aca6] focus:outline-none"
                                style={{
                                    background: "#fff",
                                    border: "1px solid #D1CDC6",
                                    color: "#1a1a1a",
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

                        {/* Confirm password with eye toggle */}
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full rounded-xl py-3 pl-4 pr-11 text-sm placeholder:text-[#b0aca6] focus:outline-none"
                                style={{
                                    background: "#fff",
                                    border: "1px solid #D1CDC6",
                                    color: "#1a1a1a",
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword((v) => !v)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 cursor-pointer"
                                tabIndex={-1}
                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                                <EyeIcon open={showConfirmPassword} />
                            </button>
                        </div>

                        {/* Error */}
                        {error && (
                            <p className="text-xs text-center" style={{ color: "#d94f4f" }}>
                                {error}
                            </p>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-2 rounded-full py-3 px-4 text-xs font-semibold tracking-widest uppercase transition-opacity hover:opacity-90 disabled:opacity-60 cursor-pointer mt-1"
                            style={{ background: "#1a1a1a", color: "#fff" }}
                        >
                            {loading && <Spinner />}
                            Continue
                        </button>
                    </form>

                    {/* Footer links */}
                    <div className="flex flex-col items-center gap-1">
                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={googleLoading}
                            className="text-xs underline underline-offset-2 transition-opacity hover:opacity-70 disabled:opacity-50 cursor-pointer"
                            style={{ color: "#8a8680" }}
                        >
                            {googleLoading ? "Redirecting..." : "Sign up with Google"}
                        </button>
                        <p className="text-xs" style={{ color: "#8a8680" }}>
                            Already have an account?{" "}
                            <Link
                                href="/login"
                                className="underline underline-offset-2"
                                style={{ color: "#8a8680" }}
                            >
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
