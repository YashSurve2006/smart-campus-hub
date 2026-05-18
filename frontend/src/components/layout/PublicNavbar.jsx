import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronRight, ArrowLeft, GraduationCap, Zap } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const DASHBOARD_BY_ROLE = {
  admin: '/admin/dashboard',
  faculty: '/faculty/dashboard',
  student: '/student/dashboard',
};

export function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  const navigate = useNavigate();

  const dash = user ? DASHBOARD_BY_ROLE[user.role] || '/student/dashboard' : null;
  const showBackButton = location.pathname !== '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinkClass = ({ isActive }) =>
    `text-sm font-semibold transition-colors duration-200 ${isActive ? 'text-white' : 'text-slate-500 hover:text-slate-200'
    }`;

  return (
    <motion.header
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(5,3,15,0.9)' : 'rgba(5,3,15,0.5)',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
        backdropFilter: 'blur(24px)',
        boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.4)' : 'none',
      }}
    >
      {/* Ambient top-edge glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: scrolled
            ? 'linear-gradient(90deg,transparent,rgba(139,92,246,0.4),rgba(34,211,238,0.2),transparent)'
            : 'transparent',
          transition: 'background 0.3s',
        }}
      />

      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 md:px-8 md:py-4">

        {/* ── LEFT ── */}
        <div className="flex items-center gap-3">

          {/* Back button */}
          {showBackButton && (
            <motion.button
              whileHover={{ scale: 1.05, x: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/'))}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-all hover:text-white"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </motion.button>
          )}

          {/* Brand */}
          <Link to="/" className="group flex items-center gap-2.5" aria-label="Smart Campus Hub home">
            <span
              className="relative flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                boxShadow: '0 0 16px rgba(139,92,246,0.45)',
              }}
            >
              <GraduationCap className="h-4 w-4 text-white" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent" />
            </span>

            <div className="hidden sm:block">
              <p className="text-[15px] font-black tracking-tight text-white leading-none">
                Smart Campus Hub
              </p>
              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.22em] text-violet-400">
                Enterprise Edition
              </p>
            </div>
          </Link>
        </div>

        {/* ── DESKTOP NAV ── */}
        <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
          <NavLink to="/" end className={navLinkClass}>Home</NavLink>
          <NavLink to="/about" className={navLinkClass}>About</NavLink>
          <NavLink to="/contact" className={navLinkClass}>Contact</NavLink>
        </nav>

        {/* ── DESKTOP ACTIONS ── */}
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <Link
              to={dash}
              className="group relative flex items-center gap-1.5 overflow-hidden rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-px"
              style={{
                background: 'linear-gradient(130deg, #6d28d9 0%, #a855f7 55%, #06b6d4 100%)',
                boxShadow: '0 4px 16px rgba(109,40,217,0.4)',
              }}
            >
              <span className="absolute inset-0 -translate-x-full skew-x-[-16deg] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
              <span className="relative z-10">Dashboard</span>
              <ChevronRight className="relative z-10 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-semibold text-slate-500 transition-colors hover:text-white"
              >
                Sign in
              </Link>

              <Link
                to="/register"
                className="group relative flex items-center gap-1.5 overflow-hidden rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all hover:-translate-y-px"
                style={{
                  background: 'linear-gradient(130deg, #6d28d9 0%, #a855f7 55%, #06b6d4 100%)',
                  boxShadow: '0 4px 16px rgba(109,40,217,0.4)',
                }}
              >
                <span className="absolute inset-0 -translate-x-full skew-x-[-16deg] bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
                <Zap className="relative z-10 h-3.5 w-3.5" />
                <span className="relative z-10">Get started</span>
              </Link>
            </>
          )}
        </div>

        {/* ── MOBILE HAMBURGER ── */}
        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition-all hover:text-white md:hidden"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {open ? (
              <motion.div
                key="x"
                initial={{ rotate: -45, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 45, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <X className="h-4 w-4" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 45, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -45, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <Menu className="h-4 w-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* ── MOBILE MENU ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden md:hidden"
            style={{
              borderTop: '1px solid rgba(255,255,255,0.07)',
              background: 'rgba(5,3,15,0.96)',
              backdropFilter: 'blur(24px)',
            }}
          >
            <div className="flex flex-col gap-4 px-5 py-5">

              {/* Nav links */}
              <div className="flex flex-col gap-1">
                {[
                  { to: '/', label: 'Home', end: true },
                  { to: '/about', label: 'About' },
                  { to: '/contact', label: 'Contact' },
                ].map(({ to, label, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${isActive
                        ? 'bg-white/[0.06] text-white'
                        : 'text-slate-500 hover:bg-white/[0.04] hover:text-slate-200'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                ))}
              </div>

              {/* Divider */}
              <div className="h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />

              {/* Auth */}
              {user ? (
                <Link
                  to={dash}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-bold text-white"
                  style={{
                    background: 'linear-gradient(130deg, #6d28d9, #a855f7 55%, #06b6d4)',
                    boxShadow: '0 4px 16px rgba(109,40,217,0.35)',
                  }}
                >
                  Go to Dashboard
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="rounded-xl py-3 text-center text-sm font-semibold text-slate-300 transition-all hover:text-white"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-1.5 rounded-xl py-3 text-sm font-bold text-white"
                    style={{
                      background: 'linear-gradient(130deg, #6d28d9, #a855f7 55%, #06b6d4)',
                      boxShadow: '0 4px 16px rgba(109,40,217,0.35)',
                    }}
                  >
                    <Zap className="h-3.5 w-3.5" />
                    Get started
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}