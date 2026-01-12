"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace("/dashboard");
      } else {
        router.replace("/signin");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="container">
      <div className="card" style={{ textAlign: "center" }}>
        <p>Loading...</p>
      </div>
    </div>
  );
}
