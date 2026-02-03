"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

function SigninForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const success = searchParams?.get("success");
    if (success) setSuccessMessage(success);
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await signin(email, password);
      router.push("/dashboard");
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Signin failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-glow auth-glow-1" />
      <div className="auth-glow auth-glow-2" />

      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Link href="/" className="auth-logo">
              <svg width="44" height="44" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="10" fill="url(#authLogoGradient)" />
                <path d="M9 13L14 18L23 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <defs>
                  <linearGradient id="authLogoGradient" x1="0" y1="0" x2="32" y2="32">
                    <stop stopColor="#8b5cf6" />
                    <stop offset="1" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
            </Link>
            <h1>Welcome back</h1>
            <p>Sign in to continue to TaskFlow</p>
          </div>

          {successMessage && (
            <div className="alert alert-success">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                <polyline points="22,4 12,14.01 9,11.01"/>
              </svg>
              <span>{successMessage}</span>
            </div>
          )}

          {error && (
            <div className="alert alert-error">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Your password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: "100%" }}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don&apos;t have an account?{" "}
              <Link href="/signup">
                Create one
              </Link>
            </p>
          </div>
        </div>

        <div className="auth-visual">
          <div className="auth-grid" />
          <div className="auth-feature">
            <div className="feature-badge">
              <span className="badge-dot" />
              AI-Powered
            </div>
            <h2>Your tasks, organized</h2>
            <p>Manage your daily tasks with ease and never miss a deadline.</p>

            <div className="feature-list">
              <div className="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
                <span>Beautiful & intuitive interface</span>
              </div>
              <div className="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
                <span>Works on all devices</span>
              </div>
              <div className="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
                <span>Secure & private</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-primary);
          padding: 24px;
          position: relative;
          overflow: hidden;
        }

        .auth-glow {
          position: fixed;
          border-radius: 50%;
          filter: blur(150px);
          opacity: 0.2;
          pointer-events: none;
        }

        .auth-glow-1 {
          width: 600px;
          height: 600px;
          background: var(--primary);
          top: -300px;
          left: -200px;
        }

        .auth-glow-2 {
          width: 500px;
          height: 500px;
          background: var(--secondary);
          bottom: -200px;
          right: -200px;
        }

        .auth-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          max-width: 1000px;
          width: 100%;
          background: var(--bg-card);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          overflow: hidden;
          position: relative;
          z-index: 1;
        }

        .auth-card {
          padding: 48px;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .auth-logo {
          display: inline-block;
          margin-bottom: 24px;
        }

        .auth-header h1 {
          font-size: 28px;
          margin-bottom: 8px;
        }

        .auth-header p {
          color: var(--text-secondary);
        }

        .alert {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          border-radius: var(--radius);
          margin-bottom: 24px;
        }

        .alert-success {
          background: var(--success-light);
          color: var(--success);
        }

        .alert-error {
          background: var(--danger-light);
          color: var(--danger);
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid transparent;
          border-top-color: currentColor;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        form {
          margin-bottom: 24px;
        }

        .auth-footer {
          text-align: center;
        }

        .auth-footer p {
          color: var(--text-secondary);
          font-size: 14px;
        }

        .auth-footer a {
          color: var(--primary);
          font-weight: 500;
        }

        .auth-visual {
          background: var(--gradient-primary);
          padding: 48px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .auth-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .auth-feature {
          position: relative;
          z-index: 1;
          color: white;
        }

        .feature-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(10px);
          border-radius: var(--radius-full);
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 24px;
        }

        .badge-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }

        .auth-feature h2 {
          font-size: 28px;
          color: white;
          margin-bottom: 12px;
          line-height: 1.2;
        }

        .auth-feature p {
          opacity: 0.9;
          margin-bottom: 32px;
          font-size: 16px;
          line-height: 1.6;
        }

        .feature-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 15px;
        }

        .feature-item svg {
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .auth-container {
            grid-template-columns: 1fr;
          }

          .auth-visual {
            display: none;
          }

          .auth-card {
            padding: 32px 24px;
          }
        }
      `}</style>
    </div>
  );
}

export default function SigninPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>Loading...</div>}>
      <SigninForm />
    </Suspense>
  );
}
