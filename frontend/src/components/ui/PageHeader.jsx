/**
 * PageHeader v2 — with Global Back Navigation System
 *
 * New features:
 * - Smart back button (useNavigate(-1) with glassmorphism styling)
 * - Animated ChevronLeft with hover translateX
 * - Breadcrumb shows current path context
 * - Title uses gradient text on key pages
 * - Larger, bolder heading hierarchy
 * - Support for `showBack` prop to control visibility
 */
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { fadeUp } from '../../utils/animations';

const BADGE_COLORS = {
  blue:    'border-blue-500/25 bg-blue-500/[0.10] text-blue-300',
  indigo:  'border-indigo-500/25 bg-indigo-500/[0.10] text-indigo-300',
  violet:  'border-violet-500/25 bg-violet-500/[0.10] text-violet-300',
  cyan:    'border-cyan-500/25 bg-cyan-500/[0.10] text-cyan-300',
  emerald: 'border-emerald-500/25 bg-emerald-500/[0.10] text-emerald-300',
  amber:   'border-amber-500/25 bg-amber-500/[0.10] text-amber-300',
  rose:    'border-rose-500/25 bg-rose-500/[0.10] text-rose-300',
};

/* ── Back button component ── */
function BackButton({ label = 'Back' }) {
  const navigate = useNavigate();
  const location = useLocation();

  /* Don't show back if this is a root portal page (e.g. /student/dashboard) */
  const pathParts = location.pathname.replace(/\/$/, '').split('/').filter(Boolean);
  if (pathParts.length <= 2) return null; // /role/dashboard — no back needed

  return (
    <motion.button
      type="button"
      onClick={() => navigate(-1)}
      className="back-btn group mb-4 inline-flex"
      whileHover={{ x: -2 }}
      whileTap={{ scale: 0.97 }}
      aria-label="Go back"
    >
      <ChevronLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
      {label}
    </motion.button>
  );
}

export function PageHeader({
  breadcrumb,
  title,
  subtitle,
  actions,
  badges = [],
  badge,
  className = '',
  showBack = true,
  backLabel = 'Back',
  gradient = true, // gradient title text
}) {
  const allBadges = badge ? [badge, ...badges] : badges;

  return (
    <motion.div {...fadeUp(0)} className={`space-y-0 ${className}`}>
      {/* Back button */}
      {showBack && <BackButton label={backLabel} />}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        {/* Left: title block */}
        <div className="relative">
          {/* Ambient halo */}
          <div className="pointer-events-none absolute -left-6 -top-6 h-24 w-52 rounded-full bg-indigo-500/[0.07] blur-3xl" />

          {breadcrumb && (
            <p className="relative text-[11px] font-bold uppercase tracking-[0.15em] text-slate-600 mb-1.5">
              {breadcrumb}
            </p>
          )}

          <h1
            className={[
              'relative font-black tracking-tight leading-none',
              breadcrumb ? 'text-[2.25rem]' : 'text-[2.25rem]',
              gradient
                ? 'bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent'
                : 'text-white',
            ].join(' ')}
          >
            {title}
          </h1>

          {subtitle && (
            <p className="relative mt-2 max-w-xl text-sm text-slate-500 leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Right: badges + actions */}
        {(allBadges.length > 0 || actions) && (
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {allBadges.map((b, i) => {
              const colorClass = BADGE_COLORS[b.color] || BADGE_COLORS.indigo;
              const Icon = b.icon;
              return (
                <div
                  key={i}
                  className={[
                    'flex items-center gap-2 rounded-xl border px-3 py-2 backdrop-blur text-xs font-semibold',
                    colorClass,
                  ].join(' ')}
                >
                  {Icon && <Icon className="h-3.5 w-3.5" />}
                  {b.label}
                </div>
              );
            })}
            {actions}
          </div>
        )}
      </div>
    </motion.div>
  );
}
