/**
 * PublicLayout v2.1 — CONTRAST REBALANCE
 *
 * Changes from v2:
 * - Mesh radial gradients opacity reduced ~40% (content wins over background)
 * - Grid texture opacity reduced (0.03 → 0.02) — subtler, doesn't compete
 * - Both fixed layers retain blur/spread so atmospheric depth is preserved
 * - No layout changes
 */
import { Outlet } from 'react-router-dom';
import { PublicNavbar } from './PublicNavbar';
import { SiteFooter } from './SiteFooter';

export function PublicLayout() {
  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ background: '#050914' }}
    >
      {/*
        Ambient mesh — v2.1 REBALANCED:
        Opacity cut from 0.20/0.15/0.10/0.08 → 0.12/0.09/0.06/0.05
        Background supports content, not competes.
      */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(ellipse 100% 60% at 20% 0%,   rgba(99,102,241,0.12) 0%, transparent 55%),
            radial-gradient(ellipse 80%  55% at 85% 100%, rgba(139,92,246,0.09) 0%, transparent 50%),
            radial-gradient(ellipse 60%  40% at 80% 20%,  rgba(59,130,246,0.06) 0%, transparent 45%),
            radial-gradient(ellipse 50%  35% at 30% 70%,  rgba(6,182,212,0.05)  0%, transparent 40%)
          `,
        }}
      />

      {/*
        Fine grid texture — v2.1 REBALANCED:
        Opacity reduced 0.03 → 0.02 — present but non-intrusive
      */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99,102,241,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Navbar */}
      <div className="relative z-50">
        <PublicNavbar />
      </div>

      {/* Page content */}
      <main className="relative z-10 flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <div className="relative z-10">
        <SiteFooter />
      </div>
    </div>
  );
}