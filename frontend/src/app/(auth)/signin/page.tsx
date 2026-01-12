"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";

export default function SigninPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signin } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const success = searchParams.get("success");

  useEffect(() => {
    if (success) {
      // Auto-fill email from signup if available in query params
      // For now, just show the success message
    }
  }, [success]);

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
    <div className="container">
      <div className="card" style={{ maxWidth: "400px", margin: "40px auto" }}>
        <h1 style={{ textAlign: "center", marginBottom: "24px" }}>Sign In</h1>

        {success && (
          <div className="success-message">{success}</div>
        )}

        {error && <div className="error-message">{error}</div>}

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
            className="btn btn-primary"
            style={{ width: "100%" }}
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "16px" }}>
          Don&apos;t have an account?{" "}
          <Link href="/signup" style={{ color: "#0070f3" }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
