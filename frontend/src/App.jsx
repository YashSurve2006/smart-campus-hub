import { Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';

import { useAuthBootstrap } from './hooks/useAuthBootstrap';
import { useRealtime } from './hooks/useRealtime';

import { AppRoutes } from './routes/AppRoutes';

import { ThemeSync } from './components/theme/ThemeSync';

/* ─────────────────────────────────────────────
   Enterprise App Loader
───────────────────────────────────────────── */

function AppLoader() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050914]">

      {/* Ambient Background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-10%] h-[420px] w-[420px] rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="absolute bottom-[-10%] right-[-10%] h-[420px] w-[420px] rounded-full bg-violet-500/10 blur-3xl" />

        <div className="absolute left-[40%] top-[60%] h-[260px] w-[260px] rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      {/* Grid Texture */}
      <div className="absolute inset-0 grid-texture-fine opacity-40" />

      {/* Loader */}
      <div className="relative z-10 flex flex-col items-center">

        {/* Logo */}
        <div
          className="
            relative flex h-20 w-20 items-center justify-center
            rounded-3xl
            bg-gradient-to-br
            from-indigo-500
            via-violet-500
            to-purple-600
            shadow-[0_0_50px_rgba(99,102,241,0.35)]
          "
        >
          {/* Pulse */}
          <div
            className="
              absolute inset-0 rounded-3xl
              animate-ping
              bg-indigo-500/20
            "
          />

          {/* Icon */}
          <div className="relative z-10">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-10 w-10 text-white"
            >
              <path
                d="M12 3L20 7V17L12 21L4 17V7L12 3Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path
                d="M12 12L20 7"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />

              <path
                d="M12 12V21"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />

              <path
                d="M12 12L4 7"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1
          className="
            mt-8 text-3xl font-black
            tracking-tight text-white
          "
        >
          Smart Campus Hub
        </h1>

        <p
          className="
            mt-2 text-sm
            tracking-wide text-slate-500
          "
        >
          Enterprise Edition
        </p>

        {/* Loading Dots */}
        <div className="mt-8 flex items-center gap-2">

          <span
            className="
              h-2.5 w-2.5 rounded-full
              bg-indigo-400
              animate-bounce
            "
          />

          <span
            className="
              h-2.5 w-2.5 rounded-full
              bg-violet-400
              animate-bounce
              [animation-delay:120ms]
            "
          />

          <span
            className="
              h-2.5 w-2.5 rounded-full
              bg-cyan-400
              animate-bounce
              [animation-delay:240ms]
            "
          />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN APP
───────────────────────────────────────────── */

export default function App() {

  /* Bootstrap Auth */
  useAuthBootstrap();

  /* Realtime Socket */
  useRealtime();

  return (
    <>
      {/* Theme Synchronization */}
      <ThemeSync />

      {/* Animated Route Container */}
      <AnimatePresence mode="popLayout">

        {/* Lazy Route Fallback */}
        <Suspense fallback={<AppLoader />}>

          {/* Routes */}
          <AppRoutes />

        </Suspense>

      </AnimatePresence>
    </>
  );
}