"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import ChatBot from "@/components/chat/ChatBot";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading, signout, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
      <div className="loading-screen">
        <div className="loading-spinner">
          <div className="spinner-ring" />
        </div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${isMobileMenuOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <Link href="/" className="logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="10" fill="url(#sidebarLogoGradient)" />
              <path d="M9 13L14 18L23 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <defs>
                <linearGradient id="sidebarLogoGradient" x1="0" y1="0" x2="32" y2="32">
                  <stop stopColor="#8b5cf6" />
                  <stop offset="1" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            <span className="logo-text">TaskFlow</span>
          </Link>
        </div>

        <nav className="sidebar-nav">
          <Link href="/dashboard" className="nav-item active">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="9" rx="1"/>
              <rect x="14" y="3" width="7" height="5" rx="1"/>
              <rect x="14" y="12" width="7" height="9" rx="1"/>
              <rect x="3" y="16" width="7" height="5" rx="1"/>
            </svg>
            <span>Dashboard</span>
          </Link>
          <Link href="/dashboard" className="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
            <span>Today</span>
          </Link>
          <Link href="/dashboard" className="nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
            <span>Messages</span>
            <span className="nav-badge">3</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.email?.split("@")[0] || "User"}</span>
              <span className="user-email">{user?.email}</span>
            </div>
          </div>
          <button className="btn-signout" onClick={handleSignout}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
              <polyline points="16,17 21,12 16,7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Top Bar */}
        <header className="dashboard-header">
          <button
            className="mobile-menu-btn"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div className="header-search">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
            <input type="text" placeholder="Search tasks..." />
          </div>
          <div className="header-actions">
            <button className="header-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 01-3.46 0"/>
              </svg>
              <span className="notification-dot"></span>
            </button>
            <div className="header-avatar">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
        </header>

        <div className="dashboard-content">
          {children}
        </div>
      </main>

      {/* AI Chatbot */}
      <ChatBot />

      <style jsx>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
          background: var(--bg-primary);
        }

        /* Sidebar */
        .sidebar {
          width: 260px;
          background: var(--bg-card);
          backdrop-filter: blur(20px);
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          z-index: 100;
          transition: transform 0.3s ease;
        }

        .sidebar-header {
          padding: 20px;
          border-bottom: 1px solid var(--border);
        }

        .sidebar .logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .logo-text {
          font-size: 18px;
          font-weight: 700;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .sidebar-nav {
          flex: 1;
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: var(--radius);
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          transition: var(--transition);
        }

        .nav-item:hover {
          background: var(--bg-glass-hover);
          color: var(--text-primary);
        }

        .nav-item.active {
          background: var(--primary-light);
          color: var(--primary);
        }

        .nav-badge {
          margin-left: auto;
          background: var(--primary);
          color: white;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 10px;
        }

        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          min-width: 0;
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          background: var(--gradient-primary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          flex-shrink: 0;
        }

        .user-details {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .user-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .user-email {
          font-size: 12px;
          color: var(--text-muted);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .btn-signout {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: transparent;
          color: var(--text-muted);
          border-radius: var(--radius);
          cursor: pointer;
          transition: var(--transition);
          flex-shrink: 0;
        }

        .btn-signout:hover {
          background: var(--danger-light);
          color: var(--danger);
        }

        /* Mobile Overlay */
        .mobile-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 99;
        }

        /* Main Content */
        .dashboard-main {
          flex: 1;
          margin-left: 260px;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }

        .dashboard-header {
          height: 72px;
          background: rgba(10, 10, 15, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          padding: 0 24px;
          gap: 16px;
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .mobile-menu-btn {
          display: none;
          width: 40px;
          height: 40px;
          border: none;
          background: var(--bg-glass);
          color: var(--text-primary);
          border-radius: var(--radius);
          cursor: pointer;
          align-items: center;
          justify-content: center;
        }

        .mobile-menu-btn:hover {
          background: var(--bg-glass-hover);
        }

        .header-search {
          flex: 1;
          max-width: 400px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          background: var(--bg-glass);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          transition: var(--transition);
        }

        .header-search:focus-within {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
        }

        .header-search svg {
          color: var(--text-muted);
          flex-shrink: 0;
        }

        .header-search input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 14px;
          color: var(--text-primary);
          outline: none;
        }

        .header-search input::placeholder {
          color: var(--text-muted);
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-btn {
          width: 40px;
          height: 40px;
          border: none;
          background: var(--bg-glass);
          color: var(--text-secondary);
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          transition: var(--transition);
        }

        .header-btn:hover {
          background: var(--bg-glass-hover);
          color: var(--text-primary);
        }

        .notification-dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          background: var(--danger);
          border-radius: 50%;
          border: 2px solid var(--bg-primary);
        }

        .header-avatar {
          width: 36px;
          height: 36px;
          background: var(--gradient-primary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
        }

        .dashboard-content {
          flex: 1;
          padding: 24px;
        }

        /* Loading */
        .loading-screen {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          color: var(--text-secondary);
          background: var(--bg-primary);
        }

        .loading-spinner {
          position: relative;
          width: 40px;
          height: 40px;
        }

        .spinner-ring {
          position: absolute;
          inset: 0;
          border: 3px solid transparent;
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .spinner-ring::before {
          content: '';
          position: absolute;
          inset: 4px;
          border: 3px solid transparent;
          border-top-color: var(--secondary);
          border-radius: 50%;
          animation: spin 1.2s linear infinite reverse;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 968px) {
          .sidebar {
            transform: translateX(-100%);
          }

          .sidebar.open {
            transform: translateX(0);
          }

          .mobile-overlay {
            display: block;
          }

          .dashboard-main {
            margin-left: 0;
          }

          .mobile-menu-btn {
            display: flex;
          }

          .header-search {
            max-width: none;
          }
        }

        @media (max-width: 640px) {
          .dashboard-header {
            padding: 0 16px;
          }

          .dashboard-content {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
}
