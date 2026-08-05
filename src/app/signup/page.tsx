"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp, signInWithGoogle } from "@/lib/auth";
import { UserRole } from "@/lib/types";
import { Music, Mail, Lock, User, Eye, EyeOff, Mic2, Headphones, Sparkles } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("buyer");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signUp(email, password, displayName, role);
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Signup failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setLoading(true);
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Google signup failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const roles: { value: UserRole; label: string; desc: string; icon: React.ReactNode }[] = [
    { value: "buyer", label: "Buyer", desc: "Find & purchase beats", icon: <Headphones size={18} /> },
    { value: "producer", label: "Producer", desc: "Sell your beats", icon: <Mic2 size={18} /> },
    { value: "both", label: "Both", desc: "Buy & sell beats", icon: <Sparkles size={18} /> },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute w-[500px] h-[500px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(6, 182, 212, 0.1), transparent 60%)",
            top: "5%",
            right: "10%",
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.08), transparent 60%)",
            bottom: "15%",
            left: "15%",
          }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Music size={22} className="text-white" />
          </div>
          <span className="text-2xl font-bold" style={{ fontFamily: "var(--font-heading)" }}>
            Beat<span style={{ color: "var(--accent-purple-light)" }}>Vault</span>
          </span>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8"
          style={{
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-default)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <h1 className="text-xl font-bold text-center mb-1" style={{ fontFamily: "var(--font-heading)" }}>
            Create your account
          </h1>
          <p className="text-sm text-center mb-6" style={{ color: "var(--text-muted)" }}>
            Join the BeatVault community
          </p>

          {error && (
            <div
              className="rounded-lg px-4 py-3 text-sm mb-4"
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.2)",
                color: "#ef4444",
              }}
            >
              {error}
            </div>
          )}

          {/* Google Auth */}
          <button
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 rounded-lg text-sm font-medium transition-all hover:bg-white/10 cursor-pointer disabled:opacity-50"
            style={{
              background: "var(--bg-tertiary)",
              border: "1px solid var(--border-default)",
            }}
            id="google-signup-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px" style={{ background: "var(--border-subtle)" }} />
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>or</span>
            <div className="flex-1 h-px" style={{ background: "var(--border-subtle)" }} />
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Role Selector */}
            <div>
              <label className="text-xs font-medium mb-2 block" style={{ color: "var(--text-secondary)" }}>
                I want to...
              </label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer"
                    style={{
                      background: role === r.value ? "rgba(139, 92, 246, 0.12)" : "var(--bg-tertiary)",
                      border: `1px solid ${role === r.value ? "var(--border-accent)" : "var(--border-subtle)"}`,
                      color: role === r.value ? "var(--accent-purple-light)" : "var(--text-secondary)",
                    }}
                    id={`role-${r.value}`}
                  >
                    {r.icon}
                    {r.label}
                    <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                      {r.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
                Display Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your artist name"
                  className="input-field pl-10"
                  required
                  id="signup-name"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field pl-10"
                  required
                  id="signup-email"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: "var(--text-secondary)" }}>
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="input-field pl-10 pr-10"
                  required
                  minLength={8}
                  id="signup-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                  style={{ color: "var(--text-muted)" }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 disabled:opacity-50"
              id="signup-submit"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-sm text-center mt-6" style={{ color: "var(--text-muted)" }}>
            Already have an account?{" "}
            <Link href="/login" className="font-medium" style={{ color: "var(--accent-purple-light)" }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
