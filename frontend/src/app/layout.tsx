import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
  title: "TaskFlow - Simple & Beautiful Todo App",
  description: "Stay organized and productive with TaskFlow. Manage your tasks effortlessly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
