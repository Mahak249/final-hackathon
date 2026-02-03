"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      await signup(email, password);
      router.push("/signin?success=Account created successfully");
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Link href="/" className="auth-logo">
              <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="#6366f1"/>
                <path d="M8 12L14 18L24 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <h1>Create your account</h1>
            <p>Start organizing your tasks today</p>
          </div>

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
                minLength={8}
                placeholder="At least 8 characters"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm your password"
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
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{" "}
              <Link href="/signin">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="auth-visual">
          <div className="auth-bg-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
          <div className="auth-feature">
            <h2>Stay organized, stay productive</h2>
            <p>Join thousands of users who trust TaskFlow to manage their daily tasks.</p>
            <div className="feature-list">
              <div className="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
                <span>Quick & easy task creation</span>
              </div>
              <div className="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
                <span>Organize with categories</span>
              </div>
              <div className="feature-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
                <span>Track your progress</span>
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
          background: var(--background);
          padding: 24px;
        }

        .auth-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          max-width: 1000px;
          width: 100%;
          background: var(--surface);
          border-radius: var(--radius-xl);
          box-shadow: var(--shadow-lg);
          overflow: hidden;
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
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          padding: 48px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .auth-bg-shapes {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .shape {
          position: absolute;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
        }

        .shape-1 {
          width: 300px;
          height: 300px;
          top: -100px;
          right: -100px;
        }

        .shape-2 {
          width: 200px;
          height: 200px;
          bottom: -50px;
          left: -50px;
        }

        .shape-3 {
          width: 150px;
          height: 150px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .auth-feature {
          position: relative;
          z-index: 1;
          color: white;
        }

        .auth-feature h2 {
          font-size: 28px;
          color: white;
          margin-bottom: 12px;
        }

        .auth-feature p {
          opacity: 0.9;
          margin-bottom: 32px;
          font-size: 16px;
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
