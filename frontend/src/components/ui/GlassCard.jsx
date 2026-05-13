/**
 * GlassCard v2.1 — CONTRAST REBALANCE
 *
 * Key changes:
 * - bg lifted: 0.04→0.07 (default), 0.06→0.09 (elevated) — cards no longer vanish
 * - inset top highlights strengthened: 0.06→0.10 / 0.08→0.13 — glass edge visible
 * - outer shadows deeper for genuine elevation layering
 * - gradient-border variant gets stronger opacity
 * - navy variant gets a visible border
 * - shine top edge helper now brighter (0.10→0.18 peak)
 * - No layout/animation/variant changes
 */
import { motion } from 'framer-motion';

const VARIANTS = {
  default: {
    base: 'border-white/[0.09] backdrop-blur-2xl',           /* was /[0.08] */
    bg: 'bg-white/[0.07]',                                  /* was /[0.04] */
    shadow: '0 1px 0 rgba(255,255,255,0.10) inset, 0 8px 32px rgba(0,0,0,0.42)',
  },
  elevated: {
    base: 'border-white/[0.11] backdrop-blur-2xl',           /* was /[0.10] */
    bg: 'bg-white/[0.09]',                                  /* was /[0.06] */
    shadow: '0 1px 0 rgba(255,255,255,0.13) inset, 0 20px 60px rgba(0,0,0,0.52), 0 0 0 1px rgba(255,255,255,0.06)',
  },
  bordered: {
    base: 'border-indigo-500/[0.28] backdrop-blur-xl',       /* was /[0.22] */
    bg: 'bg-indigo-500/[0.06]',                             /* was /[0.04] */
    shadow: '0 0 0 1px rgba(99,102,241,0.18) inset, 0 8px 32px rgba(99,102,241,0.10)',
  },
  interactive: {
    base: 'border-white/[0.09] backdrop-blur-2xl cursor-pointer',
    bg: 'bg-white/[0.07]',
    shadow: '0 1px 0 rgba(255,255,255,0.10) inset, 0 8px 32px rgba(0,0,0,0.42)',
    hoverShadow: '0 24px 52px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.12)',
  },
  ghost: {
    base: 'border-transparent',
    bg: 'bg-transparent',
    shadow: 'none',
  },
  navy: {
    base: 'border-white/[0.08] backdrop-blur-2xl',           /* was /[0.07] */
    bg: 'bg-[#080c2a]/85',                                  /* slightly lighter */
    shadow: '0 1px 0 rgba(255,255,255,0.07) inset, 0 12px 40px rgba(0,0,0,0.55)',
  },
};

export function GlassCard({
  children,
  className = '',
  delay = 0,
  variant = 'default',
  noPadding = false,
  noAnimation = false,
  onClick,
  ...props
}) {
  const v = VARIANTS[variant] || VARIANTS.default;

  const inner = (
    <div
      className={[
        'rounded-2xl border',
        v.base,
        v.bg,
        onClick ? 'cursor-pointer' : '',
        /*
         * Shine top edge — v2.1 REBALANCED:
         * Peak opacity lifted 0.10→0.18 so the glass edge is actually visible
         * on the lifted card backgrounds.
         */
        'before:absolute before:inset-x-0 before:top-0 before:h-px before:rounded-t-2xl',
        'before:bg-gradient-to-r before:from-transparent before:via-white/[0.18] before:to-transparent',
        'before:pointer-events-none',
        'relative overflow-hidden',
        className,
      ].filter(Boolean).join(' ')}
      style={{ boxShadow: v.shadow }}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );

  if (noAnimation) return inner;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={onClick ? {
        y: -3,
        boxShadow: v.hoverShadow || '0 28px 56px rgba(0,0,0,0.55)',
      } : undefined}
    >
      {inner}
    </motion.div>
  );
}