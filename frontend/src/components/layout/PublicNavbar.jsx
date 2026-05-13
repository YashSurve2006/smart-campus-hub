import React, { useEffect, useState } from 'react';
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import { motion, AnimatePresence } from 'framer-motion';

import {
  Menu,
  X,
  Sparkles,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';

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

  const dash = user
    ? DASHBOARD_BY_ROLE[user.role] || '/student/dashboard'
    : null;

  const showBackButton =
    location.pathname !== '/';

  /* ─────────────────────────────────────────────
     Scroll Effect
  ───────────────────────────────────────────── */

  useEffect(() => {
    const onScroll = () =>
      setScrolled(window.scrollY > 20);

    window.addEventListener('scroll', onScroll, {
      passive: true,
    });

    return () =>
      window.removeEventListener('scroll', onScroll);
  }, []);

  /* ───────────────────────────────────────────── */

  const navLinkClass = ({ isActive }) =>
    `
      text-sm font-medium
      transition-colors duration-200
      ${isActive
      ? 'text-indigo-400'
      : 'text-slate-400 hover:text-white'
    }
    `;

  /* ───────────────────────────────────────────── */

  return (
    <motion.header
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      className={[
        'sticky top-0 z-50',
        'transition-all duration-300',
        scrolled
          ? `
            border-b border-white/[0.08]
            bg-[#050914]/85
            backdrop-blur-2xl
            shadow-xl shadow-black/20
          `
          : `
            border-b border-transparent
            bg-[#050914]/40
            backdrop-blur-xl
          `,
      ].join(' ')}
    >
      {/* Ambient Glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-0 top-0 h-24 w-24 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      {/* Container */}
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 md:px-6 md:py-4">

        {/* ─────────────────────────────────────────────
           LEFT SECTION
        ───────────────────────────────────────────── */}

        <div className="flex items-center gap-3">

          {/* Back Button */}
          {showBackButton && (
            <motion.button
              whileHover={{
                scale: 1.05,
                x: -2,
              }}
              whileTap={{
                scale: 0.96,
              }}
              onClick={() => {
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate('/');
                }
              }}
              className="
                group relative flex h-10 w-10 items-center justify-center
                overflow-hidden rounded-2xl
                border border-white/[0.10]
                bg-white/[0.05]
                backdrop-blur-xl
                transition-all duration-300
                hover:border-indigo-500/20
                hover:bg-indigo-500/[0.08]
              "
            >
              {/* Glow */}
              <div
                className="
                  absolute inset-0 opacity-0
                  bg-gradient-to-br
                  from-indigo-500/10
                  to-violet-500/10
                  transition-opacity duration-300
                  group-hover:opacity-100
                "
              />

              <ArrowLeft
                className="
                  relative z-10 h-4 w-4
                  text-slate-300
                  transition-all duration-300
                  group-hover:text-white
                "
              />
            </motion.button>
          )}

          {/* Brand */}
          <Link
            to="/"
            className="flex items-center gap-2.5 group"
            aria-label="Smart Campus Hub home"
          >
            {/* Logo */}
            <span
              className="
                relative flex h-10 w-10 items-center justify-center
                rounded-2xl
                bg-gradient-to-br
                from-indigo-500
                via-violet-500
                to-purple-600
                shadow-xl shadow-indigo-500/30
                transition-all duration-300
                group-hover:scale-105
                group-hover:shadow-indigo-500/50
              "
            >
              <Sparkles className="h-4 w-4 text-white" />

              {/* Shine */}
              <div
                className="
                  absolute inset-0 rounded-2xl
                  bg-gradient-to-br
                  from-white/10
                  to-transparent
                "
              />
            </span>

            {/* Text */}
            <div className="hidden sm:block">
              <p className="font-black tracking-tight text-white">
                Smart Campus Hub
              </p>

              <p
                className="
                  text-[10px]
                  uppercase
                  tracking-[0.20em]
                  text-indigo-400
                "
              >
                Enterprise Edition
              </p>
            </div>
          </Link>
        </div>

        {/* ─────────────────────────────────────────────
           DESKTOP NAVIGATION
        ───────────────────────────────────────────── */}

        <nav
          className="hidden items-center gap-7 md:flex"
          aria-label="Main navigation"
        >
          <NavLink
            to="/"
            end
            className={navLinkClass}
          >
            Home
          </NavLink>

          <NavLink
            to="/about"
            className={navLinkClass}
          >
            About
          </NavLink>

          <NavLink
            to="/contact"
            className={navLinkClass}
          >
            Contact
          </NavLink>
        </nav>

        {/* ─────────────────────────────────────────────
           DESKTOP ACTIONS
        ───────────────────────────────────────────── */}

        <div className="hidden items-center gap-3 md:flex">

          {user ? (
            <Link
              to={dash}
              className="
                group relative flex items-center gap-1.5
                overflow-hidden rounded-2xl
                bg-gradient-to-r
                from-indigo-600
                to-violet-600
                px-5 py-2.5
                text-sm font-semibold text-white
                shadow-xl shadow-indigo-500/25
                transition-all duration-300
                hover:-translate-y-0.5
                hover:shadow-indigo-500/40
              "
            >
              {/* Glow */}
              <div
                className="
                  absolute inset-0 opacity-0
                  bg-gradient-to-r
                  from-white/10
                  to-transparent
                  transition-opacity duration-300
                  group-hover:opacity-100
                "
              />

              <span className="relative z-10">
                Dashboard
              </span>

              <ChevronRight className="relative z-10 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <>
              {/* Sign In */}
              <Link
                to="/login"
                className="
                  text-sm font-medium text-slate-400
                  transition-colors duration-200
                  hover:text-white
                "
              >
                Sign in
              </Link>

              {/* Get Started */}
              <Link
                to="/register"
                className="
                  group relative flex items-center gap-1.5
                  overflow-hidden rounded-2xl
                  bg-gradient-to-r
                  from-indigo-600
                  to-violet-600
                  px-5 py-2.5
                  text-sm font-semibold text-white
                  shadow-xl shadow-indigo-500/25
                  transition-all duration-300
                  hover:-translate-y-0.5
                  hover:shadow-indigo-500/40
                "
              >
                <div
                  className="
                    absolute inset-0 opacity-0
                    bg-gradient-to-r
                    from-white/10
                    to-transparent
                    transition-opacity duration-300
                    group-hover:opacity-100
                  "
                />

                <span className="relative z-10">
                  Get started
                </span>

                <ChevronRight className="relative z-10 h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </Link>
            </>
          )}
        </div>

        {/* ─────────────────────────────────────────────
           MOBILE HAMBURGER
        ───────────────────────────────────────────── */}

        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="
            rounded-2xl border border-white/[0.10]
            bg-white/[0.06]
            p-2.5 text-white
            transition-all duration-300
            hover:bg-white/[0.10]
            md:hidden
          "
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* ─────────────────────────────────────────────
         MOBILE MENU
      ───────────────────────────────────────────── */}

      <AnimatePresence>
        {open && (
          <motion.div
            key="mobile-menu"
            initial={{
              height: 0,
              opacity: 0,
            }}
            animate={{
              height: 'auto',
              opacity: 1,
            }}
            exit={{
              height: 0,
              opacity: 0,
            }}
            transition={{
              duration: 0.25,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="
              overflow-hidden border-t border-white/[0.08]
              bg-[#050914]/95
              backdrop-blur-2xl
              md:hidden
            "
          >
            <div className="flex flex-col gap-4 px-5 py-5">

              {/* Nav Links */}
              <div className="flex flex-col gap-3">
                {[
                  {
                    to: '/',
                    label: 'Home',
                    end: true,
                  },
                  {
                    to: '/about',
                    label: 'About',
                  },
                  {
                    to: '/contact',
                    label: 'Contact',
                  },
                ].map(({ to, label, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `
                        text-sm font-medium transition-colors
                        ${isActive
                        ? 'text-indigo-400'
                        : 'text-slate-400 hover:text-white'
                      }
                      `
                    }
                  >
                    {label}
                  </NavLink>
                ))}
              </div>

              {/* Divider */}
              <div className="h-px bg-white/[0.06]" />

              {/* Auth */}
              {user ? (
                <Link
                  to={dash}
                  onClick={() => setOpen(false)}
                  className="
                    flex items-center justify-center gap-1.5
                    rounded-2xl
                    bg-gradient-to-r
                    from-indigo-600
                    to-violet-600
                    py-3
                    text-sm font-semibold text-white
                  "
                >
                  Go to Dashboard

                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <div className="flex flex-col gap-2">

                  {/* Sign In */}
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="
                      rounded-2xl border border-white/[0.10]
                      bg-white/[0.05]
                      py-3 text-center
                      text-sm font-medium text-slate-300
                    "
                  >
                    Sign in
                  </Link>

                  {/* Register */}
                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="
                      rounded-2xl
                      bg-gradient-to-r
                      from-indigo-600
                      to-violet-600
                      py-3 text-center
                      text-sm font-semibold text-white
                      shadow-lg shadow-indigo-500/25
                    "
                  >
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