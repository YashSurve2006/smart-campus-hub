import { Outlet, useLocation } from 'react-router-dom';
import { PublicNavbar } from './PublicNavbar';
import { SiteFooter } from './SiteFooter';

export function PublicLayout() {
  const location = useLocation();

  // Hide footer only on landing page because Landing renders its own premium footer
  const hideFooterOnLanding = location.pathname === '/';

  return (
    <div
      className="relative flex min-h-screen flex-col overflow-x-hidden"
      style={{
        background: '#050914',
      }}
    >
      {/* Premium Ambient Background */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(ellipse 100% 60% at 20% 0%, rgba(99,102,241,0.12) 0%, transparent 55%),
            radial-gradient(ellipse 80% 55% at 85% 100%, rgba(139,92,246,0.09) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 20%, rgba(59,130,246,0.06) 0%, transparent 45%),
            radial-gradient(ellipse 50% 35% at 30% 70%, rgba(6,182,212,0.05) 0%, transparent 40%)
          `,
        }}
      />

      {/* Fine Grid Texture */}
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

      {/* Soft Glow Accents */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        aria-hidden="true"
      >
        <div className="absolute left-[-10%] top-[-10%] h-[400px] w-[400px] rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute right-[-10%] bottom-[-10%] h-[400px] w-[400px] rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute left-[40%] top-[50%] h-[280px] w-[280px] rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      {/* Navbar */}
      <header className="relative z-50">
        <PublicNavbar />
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1">
        <Outlet />
      </main>

      {/* Global Footer */}
      {!hideFooterOnLanding && (
        <footer className="relative z-10">
          <SiteFooter />
        </footer>
      )}
    </div>
  );
}