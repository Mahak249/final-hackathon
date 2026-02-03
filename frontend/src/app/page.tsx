"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
    }> = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = () => {
      particles = [];
      const particleCount = Math.min(80, Math.floor(window.innerWidth / 20));
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 0.5,
          alpha: Math.random() * 0.5 + 0.2,
        });
      }
    };

    const drawParticles = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 92, 246, ${p.alpha})`;
        ctx.fill();

        particles.forEach((p2, j) => {
          if (i >= j) return;
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.1 * (1 - dist / 150)})`;
            ctx.stroke();
          }
        });
      });

      animationFrameId = requestAnimationFrame(drawParticles);
    };

    resize();
    createParticles();
    drawParticles();

    window.addEventListener("resize", () => {
      resize();
      createParticles();
    });

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="landing">
      {/* Particle Background */}
      <canvas ref={canvasRef} className="particle-canvas" />

      {/* Navigation */}
      <nav className="nav">
        <div className="nav-bg" />
        <div className="container nav-content">
          <Link href="/" className="logo">
            <div className="logo-icon">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="10" fill="url(#logoGradient)" />
                <path
                  d="M9 13L14 18L23 9"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <defs>
                  <linearGradient id="logoGradient" x1="0" y1="0" x2="32" y2="32">
                    <stop stopColor="#8b5cf6" />
                    <stop offset="1" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="logo-text">TaskFlow</span>
          </Link>
          <div className="nav-links">
            <Link href="#features" className="nav-link">
              Features
            </Link>
            <Link href="/signin" className="btn btn-ghost btn-sm">
              Sign In
            </Link>
            <Link href="/signup" className="btn btn-primary btn-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-glow hero-glow-1" />
        <div className="hero-glow hero-glow-2" />
        <div className="hero-grid" />
        <div className="container hero-content">
          <div className="hero-text">
            <div className="hero-badge animate-fade-in">
              <span className="badge badge-primary">
                <span className="badge-dot" />
                AI-Powered Task Intelligence
              </span>
            </div>
            <h1 className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
              Master Your Workflow with
              <span className="text-gradient"> Intelligent Tasks</span>
            </h1>
            <p className="hero-description animate-slide-up" style={{ animationDelay: "0.2s" }}>
              Experience the next generation of productivity. TaskFlow combines
              elegant design with AI-powered insights to help you accomplish more,
              faster.
            </p>
            <div className="hero-actions animate-slide-up" style={{ animationDelay: "0.3s" }}>
              <Link href="/signup" className="btn btn-primary btn-lg">
                Start Free Today
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="#demo" className="btn btn-secondary btn-lg">
                See How It Works
              </Link>
            </div>
            <div className="hero-stats animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <div className="stat-item">
                <span className="stat-value">50K+</span>
                <span className="stat-label">Active Users</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <span className="stat-value">2M+</span>
                <span className="stat-label">Tasks Completed</span>
              </div>
              <div className="stat-divider" />
              <div className="stat-item">
                <span className="stat-value">4.9</span>
                <span className="stat-label">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  Rating
                </span>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="hero-visual animate-scale-in" style={{ animationDelay: "0.5s" }}>
            <div className="hero-card">
              <div className="card-header">
                <div className="card-dots">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="card-title">My Tasks</div>
                <div className="card-actions">
                  <span className="card-dot-action" />
                </div>
              </div>
              <div className="card-body">
                <div className="task-preview completed">
                  <div className="task-check">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20,6 9,17 4,12" />
                    </svg>
                  </div>
                  <span className="task-text">Design system architecture</span>
                  <span className="task-tag">Done</span>
                </div>
                <div className="task-preview">
                  <div className="task-check" />
                  <span className="task-text">Implement AI suggestions</span>
                  <span className="task-tag priority">High</span>
                </div>
                <div className="task-preview">
                  <div className="task-check" />
                  <span className="task-text">User testing session at 3pm</span>
                  <span className="task-tag time">Today</span>
                </div>
                <div className="task-preview">
                  <div className="task-check" />
                  <span className="task-text">Update documentation</span>
                </div>
              </div>
              <div className="card-footer">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: "65%" }} />
                </div>
                <span className="progress-text">65% complete</span>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="floating-badge floating-badge-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                <polyline points="22,4 12,14.01 9,11.01" />
              </svg>
              Task Done!
            </div>
            <div className="floating-badge floating-badge-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              2 min ago
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features">
        <div className="container">
          <div className="section-header text-center animate-fade-in">
            <span className="section-badge">Features</span>
            <h2>Everything you need to stay focused</h2>
            <p>
              Packed with powerful features designed to help you accomplish more
              with less stress
            </p>
          </div>
          <div className="features-grid">
            <div className="feature-card animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <h3>Lightning Quick Add</h3>
              <p>Add tasks in milliseconds with our optimized input. Just type, press enter, done.</p>
            </div>
            <div className="feature-card animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
              </div>
              <h3>Smart Categories</h3>
              <p>Organize with color-coded labels and custom categories that adapt to your workflow.</p>
            </div>
            <div className="feature-card animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </div>
              <h3>Instant Search</h3>
              <p>Find any task instantly with our powerful search and filtering system.</p>
            </div>
            <div className="feature-card animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
                  <polyline points="22,4 12,14.01 9,11.01" />
                </svg>
              </div>
              <h3>Satisfying Completion</h3>
              <p>One-click completion with smooth animations that make finishing tasks feel rewarding.</p>
            </div>
            <div className="feature-card animate-fade-in" style={{ animationDelay: "0.5s" }}>
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
              </div>
              <h3>Due Dates & Reminders</h3>
              <p>Never miss a deadline with smart due dates and gentle reminders.</p>
            </div>
            <div className="feature-card animate-fade-in" style={{ animationDelay: "0.6s" }}>
              <div className="feature-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
              </div>
              <h3>Secure & Private</h3>
              <p>Your data is encrypted and secure. Only you have access to your tasks.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta">
        <div className="cta-bg" />
        <div className="container">
          <div className="cta-card animate-fade-in">
            <div className="cta-content">
              <h2>Ready to level up your productivity?</h2>
              <p>Join thousands of productive people who trust TaskFlow every day.</p>
            </div>
            <Link href="/signup" className="btn btn-primary btn-lg cta-btn">
              Get Started Free
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <Link href="/" className="logo">
                <div className="logo-icon">
                  <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                    <rect width="32" height="32" rx="10" fill="url(#footerLogoGradient)" />
                    <path
                      d="M9 13L14 18L23 9"
                      stroke="white"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <defs>
                      <linearGradient id="footerLogoGradient" x1="0" y1="0" x2="32" y2="32">
                        <stop stopColor="#8b5cf6" />
                        <stop offset="1" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <span className="logo-text">TaskFlow</span>
              </Link>
              <p>Stay organized, stay productive.</p>
            </div>
            <div className="footer-links">
              <div className="footer-column">
                <h4>Product</h4>
                <a href="#">Features</a>
                <a href="#">Pricing</a>
                <a href="#">Changelog</a>
              </div>
              <div className="footer-column">
                <h4>Company</h4>
                <a href="#">About</a>
                <a href="#">Blog</a>
                <a href="#">Careers</a>
              </div>
              <div className="footer-column">
                <h4>Support</h4>
                <a href="#">Help Center</a>
                <a href="#">Contact</a>
                <a href="#">Privacy</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>2025 TaskFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        /* Particle Canvas */
        .particle-canvas {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        /* Navigation */
        .nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
        }

        .nav-bg {
          position: absolute;
          inset: 0;
          background: rgba(10, 10, 15, 0.8);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
        }

        .nav-content {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 72px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-icon {
          display: flex;
        }

        .logo-text {
          font-size: 20px;
          font-weight: 700;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .nav-link {
          padding: 8px 16px;
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          border-radius: var(--radius);
        }

        .nav-link:hover {
          color: var(--text-primary);
          background: var(--bg-glass);
        }

        /* Hero */
        .hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          position: relative;
          padding: 120px 0 80px;
          overflow: hidden;
        }

        .hero-glow {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.4;
          pointer-events: none;
        }

        .hero-glow-1 {
          width: 800px;
          height: 800px;
          background: var(--primary);
          top: -400px;
          right: -200px;
        }

        .hero-glow-2 {
          width: 600px;
          height: 600px;
          background: var(--secondary);
          bottom: -300px;
          left: -200px;
        }

        .hero-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
          pointer-events: none;
        }

        .hero-content {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          align-items: center;
        }

        .hero-text {
          max-width: 580px;
        }

        .hero-badge {
          margin-bottom: 24px;
        }

        .badge-dot {
          width: 8px;
          height: 8px;
          background: var(--success);
          border-radius: 50%;
          margin-right: 8px;
          animation: pulse 2s ease-in-out infinite;
        }

        .hero h1 {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 24px;
          letter-spacing: -0.03em;
        }

        .hero-description {
          font-size: 18px;
          margin-bottom: 40px;
          max-width: 520px;
        }

        .hero-actions {
          display: flex;
          gap: 16px;
          margin-bottom: 48px;
        }

        .hero-stats {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1;
        }

        .stat-label {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: var(--text-muted);
          margin-top: 8px;
        }

        .stat-label svg {
          color: var(--warning);
        }

        .stat-divider {
          width: 1px;
          height: 48px;
          background: var(--border);
        }

        /* Hero Visual */
        .hero-visual {
          position: relative;
          display: flex;
          justify-content: center;
        }

        .hero-card {
          background: var(--bg-card);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          width: 100%;
          max-width: 420px;
          overflow: hidden;
          animation: float 8s ease-in-out infinite;
          box-shadow: var(--shadow-lg);
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          background: var(--bg-glass);
          border-bottom: 1px solid var(--border);
        }

        .card-dots {
          display: flex;
          gap: 6px;
        }

        .card-dots span {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }

        .card-dots span:first-child { background: #f43f5e; }
        .card-dots span:nth-child(2) { background: #f59e0b; }
        .card-dots span:last-child { background: #10b981; }

        .card-title {
          flex: 1;
          font-weight: 600;
          color: var(--text-primary);
        }

        .card-dot-action {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--bg-glass-hover);
        }

        .card-body {
          padding: 16px;
        }

        .task-preview {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 12px;
          border-radius: var(--radius);
          transition: var(--transition);
        }

        .task-preview:hover {
          background: var(--bg-glass-hover);
        }

        .task-preview.completed .task-text {
          text-decoration: line-through;
          color: var(--text-muted);
        }

        .task-check {
          width: 22px;
          height: 22px;
          border: 2px solid var(--border);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: var(--transition);
        }

        .task-preview.completed .task-check {
          background: var(--success);
          border-color: var(--success);
          color: white;
        }

        .task-text {
          flex: 1;
          font-size: 14px;
          color: var(--text-primary);
        }

        .task-tag {
          font-size: 11px;
          padding: 4px 10px;
          border-radius: var(--radius-full);
          background: var(--bg-glass);
          color: var(--text-muted);
        }

        .task-tag.priority {
          background: var(--danger-light);
          color: var(--danger);
        }

        .task-tag.time {
          background: var(--warning-light);
          color: var(--warning);
        }

        .card-footer {
          padding: 16px 20px;
          border-top: 1px solid var(--border);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .progress-bar {
          flex: 1;
          height: 6px;
          background: var(--bg-glass);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--gradient-primary);
          border-radius: var(--radius-full);
          transition: width 0.5s ease;
        }

        .progress-text {
          font-size: 12px;
          color: var(--text-muted);
        }

        /* Floating Badges */
        .floating-badge {
          position: absolute;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: var(--bg-card);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
          animation: floatBadge 6s ease-in-out infinite;
        }

        .floating-badge-1 {
          top: 20%;
          right: -20px;
          animation-delay: 0s;
        }

        .floating-badge-2 {
          bottom: 20%;
          left: -30px;
          animation-delay: -2s;
        }

        @keyframes floatBadge {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        /* Features */
        .features {
          padding: 120px 0;
          position: relative;
        }

        .section-header {
          max-width: 600px;
          margin: 0 auto 60px;
        }

        .section-badge {
          display: inline-block;
          padding: 6px 14px;
          background: var(--primary-light);
          color: var(--primary);
          border-radius: var(--radius-full);
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .section-header h2 {
          font-size: 2.5rem;
          margin-bottom: 16px;
        }

        .section-header p {
          font-size: 18px;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .feature-card {
          background: var(--bg-card);
          backdrop-filter: blur(20px);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 32px;
          transition: var(--transition);
        }

        .feature-card:hover {
          border-color: var(--primary);
          transform: translateY(-4px);
          box-shadow: var(--shadow-glow);
        }

        .feature-icon {
          width: 52px;
          height: 52px;
          background: var(--gradient-primary);
          border-radius: var(--radius);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
          color: white;
        }

        .feature-card h3 {
          font-size: 18px;
          margin-bottom: 12px;
        }

        .feature-card p {
          font-size: 14px;
          line-height: 1.6;
        }

        /* CTA */
        .cta {
          padding: 100px 0;
          position: relative;
        }

        .cta-bg {
          position: absolute;
          inset: 0;
          background: var(--gradient-subtle);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }

        .cta-card {
          position: relative;
          background: var(--bg-card);
          backdrop-filter: blur(40px);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          padding: 60px 80px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 40px;
        }

        .cta-content h2 {
          font-size: 2rem;
          margin-bottom: 12px;
          color: var(--text-primary);
        }

        .cta-content p {
          font-size: 16px;
        }

        .cta-btn {
          flex-shrink: 0;
        }

        /* Footer */
        .footer {
          padding: 60px 0 24px;
          border-top: 1px solid var(--border);
        }

        .footer-content {
          display: flex;
          justify-content: space-between;
          margin-bottom: 48px;
        }

        .footer-brand .logo {
          margin-bottom: 16px;
        }

        .footer-brand p {
          font-size: 14px;
        }

        .footer-links {
          display: flex;
          gap: 60px;
        }

        .footer-column h4 {
          font-size: 14px;
          margin-bottom: 20px;
          color: var(--text-primary);
        }

        .footer-column a {
          display: block;
          color: var(--text-secondary);
          font-size: 14px;
          margin-bottom: 12px;
        }

        .footer-column a:hover {
          color: var(--primary);
        }

        .footer-bottom {
          text-align: center;
          padding-top: 24px;
          border-top: 1px solid var(--border);
        }

        .footer-bottom p {
          font-size: 13px;
          color: var(--text-muted);
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .hero-content {
            grid-template-columns: 1fr;
            gap: 60px;
            text-align: center;
          }

          .hero-text {
            max-width: 100%;
          }

          .hero-description {
            max-width: 100%;
          }

          .hero-actions {
            justify-content: center;
          }

          .hero-stats {
            justify-content: center;
          }

          .hero h1 {
            font-size: 2.75rem;
          }

          .features-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .cta-card {
            flex-direction: column;
            text-align: center;
            padding: 48px 32px;
          }
        }

        @media (max-width: 768px) {
          .hero h1 {
            font-size: 2rem;
          }

          .hero-actions {
            flex-direction: column;
          }

          .hero-stats {
            flex-wrap: wrap;
            gap: 24px;
          }

          .stat-divider {
            display: none;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .footer-content {
            flex-direction: column;
            gap: 40px;
          }

          .footer-links {
            flex-wrap: wrap;
            gap: 32px;
          }

          .nav-links .btn-ghost {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
