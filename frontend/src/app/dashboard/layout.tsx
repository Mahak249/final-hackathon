"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading, signout, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/signin");
    }
  }, [isAuthenticated, isLoading, router]);

  async function handleSignout() {
    await signout();
    router.push("/signin");
  }

  if (isLoading) {
    return (
      <div className="container">
        <div className="card" style={{ textAlign: "center" }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container">
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <h1>My Todos</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ color: "#666" }}>{user?.email}</span>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleSignout}
          >
            Sign Out
          </button>
        </div>
      </header>
      {children}
    </div>
  );
}
