/**
 * DashboardShell v3 — Ultra Enterprise Shell
 *
 * Updates:
 * - Smart back button
 * - Advanced floating sidebar
 * - Better header UX
 * - Breadcrumb support
 * - Improved animations
 * - Better responsive behavior
 * - Premium glassmorphism
 * - Role-aware gradients
 */

import { useMemo, useState, useEffect } from 'react';

import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';

import {
  motion,
  AnimatePresence,
} from 'framer-motion';

import {
  LogOut,
  Menu,
  Monitor,
  Moon,
  Sparkles,
  Sun,
  Wifi,
  WifiOff,
  X,
  ChevronLeft,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';

import api from '../../services/api';

import { disconnectSocket } from '../../services/socket';

import { useAuthStore } from '../../store/authStore';

import {
  studentNav,
  facultyNav,
  adminNav,
} from '../../data/navLinks';

import { NotificationCenter } from '../dashboard/NotificationCenter';

import { AIAssistant } from '../dashboard/AIAssistant';

import { useThemeStore } from '../../store/themeStore';

import { useSocketStore } from '../../store/socketStore';

/* ───────────────────────────────────────────── */

const navByRole = {
  student: studentNav,
  faculty: facultyNav,
  admin: adminNav,
};

/* ─────────────────────────────────────────────
   Avatar
───────────────────────────────────────────── */

function UserAvatar({
  user,
  size = 'sm',
}) {
  const name =
    `${user?.firstName || ''} ${user?.lastName || ''}`.trim() ||
    user?.email ||
    '?';

  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const palettes = [
    'from-indigo-500 via-violet-500 to-purple-500',
    'from-blue-500 via-cyan-500 to-teal-500',
    'from-emerald-500 via-teal-500 to-cyan-500',
    'from-amber-500 via-orange-500 to-rose-500',
    'from-rose-500 via-pink-500 to-fuchsia-500',
  ];

  const palette =
    palettes[
    (initials.charCodeAt(0) || 0) %
    palettes.length
    ];

  const sz =
    size === 'sm'
      ? 'h-8 w-8 text-xs'
      : 'h-10 w-10 text-sm';

  return (
    <div
      className={[
        `shrink-0 flex items-center justify-center rounded-xl font-bold text-white`,
        `bg-gradient-to-br ${palette}`,
        'shadow-lg ring-1 ring-white/20',
        sz,
      ].join(' ')}
    >
      {initials}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Nav Divider
───────────────────────────────────────────── */

function NavDivider({ label }) {
  return (
    <div className="mt-5 mb-1.5 px-3">
      <p
        className="
          text-[9px]
          font-black
          uppercase
          tracking-[0.15em]
          text-slate-700
        "
      >
        {label}
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Admin Groups
───────────────────────────────────────────── */

const adminNavGroups = [
  {
    label: 'Overview',
    keys: ['/admin/dashboard'],
  },

  {
    label: 'People',
    keys: [
      '/admin/students',
      '/admin/faculty',
    ],
  },

  {
    label: 'Content',
    keys: [
      '/admin/notices',
      '/admin/events',
      '/admin/files',
    ],
  },

  {
    label: 'Intelligence',
    keys: [
      '/admin/analytics',
      '/admin/results',
      '/admin/ai-results',
    ],
  },

  {
    label: 'System',
    keys: [
      '/admin/notifications',
      '/admin/audit',
      '/admin/profile',
    ],
  },
];

/* ─────────────────────────────────────────────
   Nav Item
───────────────────────────────────────────── */

function NavItemLink({
  to,
  label,
  Icon,
  onClose,
}) {
  return (
    <NavLink
      to={to}
      onClick={onClose}
      className={({ isActive }) =>
        [
          'group relative flex items-center gap-3 rounded-xl px-3 py-2.5',
          'text-sm font-medium transition-all duration-200',
          isActive
            ? 'nav-item-active'
            : 'nav-item-inactive',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          {/* Active pill */}
          {isActive && (
            <motion.span
              layoutId="nav-active-pill"
              className="
                absolute left-0 top-2 bottom-2
                w-1 rounded-r-full
                bg-indigo-400
              "
              transition={{
                type: 'spring',
                stiffness: 400,
                damping: 35,
              }}
            />
          )}

          {/* Icon */}
          <Icon
            className={[
              'h-4 w-4 shrink-0 transition-all duration-200',
              isActive
                ? `
                  text-indigo-400
                  drop-shadow-[0_0_6px_rgba(99,102,241,0.8)]
                `
                : `
                  text-slate-600
                  group-hover:text-slate-400
                `,
            ].join(' ')}
          />

          {/* Label */}
          <span className="truncate">
            {label}
          </span>

          {/* Hover glow */}
          {isActive && (
            <span
              className="
                absolute inset-0 rounded-xl
                bg-indigo-500/5
                pointer-events-none
              "
            />
          )}
        </>
      )}
    </NavLink>
  );
}

/* ─────────────────────────────────────────────
   Admin Grouped Nav
───────────────────────────────────────────── */

function AdminNavGrouped({
  items,
  onClose,
}) {
  return (
    <>
      {adminNavGroups.map((group) => {
        const groupItems = items.filter(
          (item) =>
            group.keys.some(
              (k) =>
                item.to === k ||
                item.to.startsWith(k + '/')
            )
        );

        if (!groupItems.length) return null;

        return (
          <div key={group.label}>
            <NavDivider label={group.label} />

            {groupItems.map(
              ({
                to,
                label,
                icon: Icon,
              }) => (
                <NavItemLink
                  key={to}
                  to={to}
                  label={label}
                  Icon={Icon}
                  onClose={onClose}
                />
              )
            )}
          </div>
        );
      })}
    </>
  );
}

/* ─────────────────────────────────────────────
   MAIN SHELL
───────────────────────────────────────────── */

export function DashboardShell() {
  const user = useAuthStore(
    (s) => s.user
  );

  const logoutStore = useAuthStore(
    (s) => s.logout
  );

  const themeMode = useThemeStore(
    (s) => s.mode
  );

  const setThemeMode = useThemeStore(
    (s) => s.setMode
  );

  const socketConn = useSocketStore(
    (s) => s.connected
  );

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const location = useLocation();

  const navigate = useNavigate();

  /* ───────────────────────────────────────────── */

  function cycleTheme() {
    const next =
      themeMode === 'light'
        ? 'dark'
        : themeMode === 'dark'
          ? 'system'
          : 'light';

    setThemeMode(next);
  }

  /* ───────────────────────────────────────────── */

  const items =
    navByRole[user?.role] || studentNav;

  const isAdmin =
    user?.role === 'admin';

  /* ───────────────────────────────────────────── */

  async function handleLogout() {
    try {
      await api.post('/auth/logout');
    } catch {
      /* ignore */
    }

    disconnectSocket();

    logoutStore();

    window.location.href = '/login';
  }

  /* ───────────────────────────────────────────── */

  const fullName =
    [user?.firstName, user?.lastName]
      .filter(Boolean)
      .join(' ') || 'User';

  const closeSidebar = () =>
    setSidebarOpen(false);

  /* track desktop breakpoint so Framer Motion doesn't override md:translate-x-0 */
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.innerWidth >= 768
  );

  useEffect(() => {
    function onResize() {
      setIsDesktop(window.innerWidth >= 768);
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /* On desktop the sidebar is always visible (x:0).
     On mobile it slides in only when sidebarOpen. */
  const sidebarX = isDesktop ? 0 : sidebarOpen ? 0 : '-100%';

  const roleAccent = {
    admin: 'text-violet-400',
    faculty: 'text-cyan-400',
    student: 'text-indigo-400',
  }[user?.role] || 'text-indigo-400';

  /* ─────────────────────────────────────────────
     Breadcrumbs
  ───────────────────────────────────────────── */

  const breadcrumbs = useMemo(() => {
    return location.pathname
      .split('/')
      .filter(Boolean);
  }, [location.pathname]);

  /* ───────────────────────────────────────────── */

  return (
    <div className="dark min-h-screen">

      {/* Background */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: '#050914',
        }}
      />

      {/* Mesh */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 90% 70% at 15% 5%, rgba(99,102,241,0.16) 0%, transparent 55%),
            radial-gradient(ellipse 70% 55% at 85% 90%, rgba(139,92,246,0.13) 0%, transparent 50%),
            radial-gradient(ellipse 60% 45% at 80% 15%, rgba(59,130,246,0.09) 0%, transparent 45%),
            radial-gradient(ellipse 50% 40% at 45% 70%, rgba(6,182,212,0.07) 0%, transparent 40%)
          `,
        }}
      />

      {/* Texture */}
      <div className="fixed inset-0 pointer-events-none grid-texture-fine" />

      <div className="relative min-h-screen">

        {/* Mobile Menu */}
        <button
          type="button"
          aria-label="Open navigation menu"
          className="
            fixed left-4 top-4 z-50
            rounded-xl border border-white/10
            bg-white/[0.06]
            p-2.5 text-white
            shadow-xl backdrop-blur-xl
            md:hidden
          "
          onClick={() =>
            setSidebarOpen(true)
          }
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: 0.2,
              }}
              className="
                fixed inset-0 z-30
                bg-black/60
                backdrop-blur-md
                md:hidden
              "
              onClick={closeSidebar}
            />
          )}
        </AnimatePresence>

        {/* SIDEBAR */}
        <motion.aside
          initial={false}
          animate={{
            x: sidebarX,
          }}
          transition={{
            duration: 0.3,
            ease: [
              0.25,
              0.46,
              0.45,
              0.94,
            ],
          }}
          className={[
            'fixed z-40 flex flex-col',

            'md:translate-x-0 md:transition-none',
            'md:top-4 md:bottom-4 md:left-4 md:w-60 md:rounded-3xl',

            'top-0 bottom-0 left-0 w-64',

            'border border-white/[0.08] backdrop-blur-3xl',

            'glass-sidebar',
          ].join(' ')}
        >
          {/* Ambient */}
          <div className="pointer-events-none absolute inset-0 rounded-3xl overflow-hidden">
            <div className="absolute -top-20 -left-10 h-48 w-48 rounded-full bg-indigo-600/15 blur-3xl" />

            <div className="absolute -bottom-16 -right-8 h-40 w-40 rounded-full bg-violet-600/12 blur-3xl" />
          </div>

          {/* Logo */}
          <div className="relative flex shrink-0 items-center justify-between gap-2 px-4 py-5">

            <Link
              to="/"
              className="flex items-center gap-2.5 hover:opacity-90 transition-opacity"
            >
              <div
                className="
                  relative flex h-9 w-9 items-center justify-center
                  rounded-xl
                  bg-gradient-to-br
                  from-indigo-500
                  via-violet-500
                  to-purple-600
                  shadow-xl shadow-indigo-500/30
                "
              >
                <Sparkles className="h-4 w-4 text-white" />

                <div
                  className="
                    absolute inset-0 rounded-xl
                    bg-gradient-to-br
                    from-indigo-400/20
                    to-transparent
                  "
                />
              </div>

              <div className="leading-tight">
                <p
                  className="
                    text-sm font-black
                    text-white tracking-tight
                  "
                >
                  Smart Campus
                </p>

                <p
                  className={`
                    text-[10px]
                    font-semibold uppercase
                    tracking-[0.12em]
                    ${roleAccent}
                  `}
                >
                  {user?.role || 'Hub'}
                </p>
              </div>
            </Link>

            {/* Mobile Close */}
            <button
              type="button"
              aria-label="Close navigation menu"
              className="
                rounded-lg p-1.5
                text-slate-600
                hover:text-white
                transition md:hidden
              "
              onClick={closeSidebar}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Nav */}
          <nav
            className="
              scrollbar-thin relative
              flex-1 overflow-y-auto
              px-2.5 pb-4
            "
          >
            {isAdmin ? (
              <AdminNavGrouped
                items={items}
                onClose={closeSidebar}
              />
            ) : (
              <div className="space-y-0.5 pt-1">
                {items.map(
                  ({
                    to,
                    label,
                    icon: Icon,
                  }) => (
                    <NavItemLink
                      key={to}
                      to={to}
                      label={label}
                      Icon={Icon}
                      onClose={closeSidebar}
                    />
                  )
                )}
              </div>
            )}
          </nav>

          {/* User Card */}
          <div className="relative shrink-0 border-t border-white/[0.06] p-3">

            <div
              className="
                rounded-2xl border border-white/[0.06]
                bg-white/[0.04]
                p-3
              "
            >
              <div className="mb-3 flex items-center gap-2.5">

                <UserAvatar
                  user={user}
                  size="sm"
                />

                <div className="min-w-0 flex-1">
                  <p
                    className="
                      truncate text-xs
                      font-bold text-white
                    "
                  >
                    {fullName}
                  </p>

                  <p
                    className="
                      truncate text-[10px]
                      text-slate-600
                    "
                  >
                    {user?.email}
                  </p>
                </div>

                {/* Connection */}
                <span
                  title={
                    socketConn
                      ? 'Connected'
                      : 'Disconnected'
                  }
                  className={[
                    'h-2 w-2 shrink-0 rounded-full',
                    socketConn
                      ? `
                        bg-emerald-400
                        shadow-[0_0_6px_rgba(52,211,153,0.8)]
                      `
                      : 'bg-rose-500',
                  ].join(' ')}
                />
              </div>

              {/* Logout */}
              <button
                type="button"
                onClick={handleLogout}
                className={[
                  'flex w-full items-center justify-center gap-2',

                  'rounded-xl border border-rose-500/15 bg-rose-500/[0.06]',

                  'py-2 text-xs font-semibold text-rose-400/80',

                  'transition-all duration-200 hover:bg-rose-500/12 hover:text-rose-300',
                ].join(' ')}
              >
                <LogOut className="h-3.5 w-3.5" />

                Sign out
              </button>
            </div>
          </div>
        </motion.aside>

        {/* MAIN */}
        <div className="relative min-h-screen md:ml-[17rem]">

          {/* HEADER */}
          <motion.header
            initial={{
              opacity: 0,
              y: -8,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.4,
            }}
            className={[
              'sticky top-0 z-20',

              'border-b border-white/[0.06]',

              'backdrop-blur-2xl',

              'px-4 py-3 md:px-8',
            ].join(' ')}
            style={{
              background:
                'rgba(5,9,20,0.80)',
            }}
          >
            <div
              className="
                mx-auto flex max-w-7xl
                items-center justify-between gap-4
              "
            >

              {/* LEFT */}
              <div className="flex items-center gap-4 min-w-0">

                {/* Back Button */}
                <motion.button
                  whileHover={{
                    scale: 1.04,
                    x: -2,
                  }}
                  whileTap={{
                    scale: 0.95,
                  }}
                  onClick={() => {
                    if (
                      window.history.length > 1
                    ) {
                      navigate(-1);
                    } else {
                      navigate('/');
                    }
                  }}
                  className="
                    group flex h-10 w-10 shrink-0
                    items-center justify-center
                    rounded-2xl
                    border border-white/[0.08]
                    bg-white/[0.04]
                    transition-all duration-300
                    hover:border-indigo-500/20
                    hover:bg-indigo-500/[0.08]
                  "
                >
                  <ArrowLeft
                    className="
                      h-4 w-4 text-slate-400
                      transition-all duration-300
                      group-hover:text-white
                    "
                  />
                </motion.button>

                {/* Greeting */}
                <div className="hidden sm:flex items-center gap-3 min-w-0">

                  <div
                    className="
                      h-1.5 w-1.5 rounded-full
                      bg-indigo-400
                      shadow-[0_0_6px_rgba(99,102,241,0.9)]
                    "
                  />

                  <div className="min-w-0">

                    {/* Breadcrumb */}
                    <div className="flex items-center gap-1 text-[10px] uppercase tracking-[0.12em] text-slate-600">

                      {breadcrumbs.map(
                        (crumb, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1"
                          >
                            {idx > 0 && (
                              <ChevronRight className="h-3 w-3" />
                            )}

                            <span>
                              {crumb.replace(
                                '-',
                                ' '
                              )}
                            </span>
                          </div>
                        )
                      )}
                    </div>

                    <p
                      className="
                        text-sm font-bold text-white
                        truncate max-w-[240px]
                      "
                    >
                      Welcome back, {fullName}
                    </p>
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="ml-auto flex items-center gap-2">

                {/* Theme */}
                <button
                  type="button"
                  onClick={cycleTheme}
                  title={`Theme: ${themeMode}`}
                  className={[
                    'rounded-xl border border-white/[0.08] bg-white/[0.04] p-2 text-slate-500',

                    'transition-all duration-200 hover:border-white/15 hover:text-white hover:bg-white/[0.07]',
                  ].join(' ')}
                >
                  {themeMode ===
                    'light' ? (
                    <Sun className="h-4 w-4" />
                  ) : themeMode ===
                    'dark' ? (
                    <Moon className="h-4 w-4" />
                  ) : (
                    <Monitor className="h-4 w-4" />
                  )}
                </button>

                {/* Socket */}
                <span
                  title={
                    socketConn
                      ? 'Realtime: connected'
                      : 'Realtime: disconnected'
                  }
                  className="
                    hidden sm:flex items-center gap-1.5
                    rounded-xl border border-white/[0.08]
                    bg-white/[0.04]
                    px-2.5 py-2
                    text-[10px] font-semibold
                  "
                >
                  {socketConn ? (
                    <>
                      <Wifi className="h-3.5 w-3.5 text-emerald-400" />

                      <span className="text-emerald-400">
                        Live
                      </span>
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-3.5 w-3.5 text-rose-400" />

                      <span className="text-rose-400">
                        Offline
                      </span>
                    </>
                  )}
                </span>

                {/* Notifications */}
                <NotificationCenter dark />

                {/* Site */}
                <Link
                  to="/"
                  className="
                    hidden text-xs font-semibold
                    text-slate-600
                    hover:text-white
                    transition sm:inline
                  "
                >
                  ↗ Site
                </Link>

                {/* Avatar */}
                <UserAvatar
                  user={user}
                  size="sm"
                />
              </div>
            </div>
          </motion.header>

          {/* PAGE */}
          <div
            className="
              relative mx-auto
              max-w-7xl
              px-4 py-8 md:px-8
            "
          >
            <Outlet />
          </div>
        </div>

        {/* AI */}
        <AIAssistant dark />
      </div>
    </div>
  );
}