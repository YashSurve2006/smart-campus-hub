/**
 * Button v2.1 — CONTRAST REBALANCE
 *
 * Key changes:
 * - Primary: shadow amplified (0.25→0.40 opacity, spread wider)
 * - Primary hover: stronger glow (0.35→0.50)
 * - Ghost: border lifted /[0.08]→/[0.11], text slate-300→slate-200
 * - Outline: border and bg opacity up for visible separation
 * - Danger/Success: text brightened one step
 * - All variants: hover translate-y increased -0.5→-1 for more lift feel
 * - No new variants or size changes
 */
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary:
    'bg-gradient-to-r from-indigo-600 to-violet-600 text-white ' +
    /* AMPLIFIED shadow — clear CTA separation */
    'shadow-[0_4px_20px_rgba(99,102,241,0.40),0_1px_4px_rgba(0,0,0,0.35)] ' +
    'hover:from-indigo-500 hover:to-violet-500 ' +
    'hover:shadow-[0_8px_28px_rgba(99,102,241,0.50),0_2px_8px_rgba(0,0,0,0.40)] ' +
    'hover:-translate-y-1 active:translate-y-0 ' +                 /* more lift */
    'focus-visible:ring-indigo-500 ' +
    'border border-indigo-500/30',

  secondary:
    'bg-gradient-to-r from-slate-700/80 to-slate-600/80 text-white ' +
    'backdrop-blur border border-white/[0.12] shadow-md ' +
    'hover:from-slate-600/90 hover:to-slate-500/90 hover:border-white/[0.18] ' +
    'hover:-translate-y-1 active:translate-y-0 ' +
    'focus-visible:ring-slate-500',

  /* REBALANCED: ghost now legible — brighter border + text */
  ghost:
    'border border-white/[0.11] bg-white/[0.06] text-slate-200 backdrop-blur ' +
    'hover:bg-white/[0.10] hover:text-white hover:border-white/[0.18] ' +
    'hover:-translate-y-1 active:translate-y-0 ' +
    'focus-visible:ring-white/30',

  /* REBALANCED: outline — border and bg lifted for visibility */
  outline:
    'border border-indigo-500/[0.40] bg-indigo-500/[0.10] text-indigo-200 backdrop-blur ' +
    'hover:bg-indigo-500/[0.18] hover:border-indigo-500/[0.60] hover:text-indigo-100 ' +
    'hover:shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-1 active:translate-y-0 ' +
    'focus-visible:ring-indigo-500',

  /* REBALANCED: danger text brightened */
  danger:
    'border border-rose-500/[0.28] bg-rose-500/[0.09] text-rose-300 backdrop-blur ' +
    'hover:bg-rose-500/[0.16] hover:border-rose-500/[0.48] hover:text-rose-200 ' +
    'hover:-translate-y-1 active:translate-y-0 ' +
    'focus-visible:ring-rose-500',

  /* REBALANCED: success text brightened */
  success:
    'border border-emerald-500/[0.28] bg-emerald-500/[0.09] text-emerald-300 backdrop-blur ' +
    'hover:bg-emerald-500/[0.16] hover:border-emerald-500/[0.48] hover:text-emerald-200 ' +
    'hover:-translate-y-1 active:translate-y-0 ' +
    'focus-visible:ring-emerald-500',

  gradient:
    'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 text-white ' +
    'shadow-[0_4px_20px_rgba(59,130,246,0.35)] border border-blue-400/20 ' +
    'hover:shadow-[0_8px_28px_rgba(59,130,246,0.45)] hover:-translate-y-1 active:translate-y-0 ' +
    'focus-visible:ring-blue-500',
};

const SIZES = {
  xs: 'h-7  px-3   text-xs  gap-1.5 rounded-lg',
  sm: 'h-8  px-3.5 text-xs  gap-2   rounded-xl',
  md: 'h-10 px-4   text-sm  gap-2   rounded-xl',
  lg: 'h-11 px-5   text-sm  gap-2.5 rounded-xl',
  xl: 'h-12 px-6   text-base gap-3  rounded-2xl',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  icon: Icon,
  iconRight: IconRight,
  type = 'button',
  ...props
}) {
  const base = [
    'inline-flex items-center justify-center font-semibold',
    'transition-all duration-200',
    'active:scale-[0.97]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    'disabled:opacity-40 disabled:pointer-events-none disabled:cursor-not-allowed',
    'select-none',
  ].join(' ');

  const variantClass = VARIANTS[variant] || VARIANTS.primary;
  const sizeClass = SIZES[size] || SIZES.md;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${base} ${variantClass} ${sizeClass} ${className}`}
      style={{ '--tw-ring-offset-color': 'var(--bg-canvas)' }}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
      ) : Icon ? (
        <Icon className="h-4 w-4 shrink-0" />
      ) : null}
      {children}
      {IconRight && !loading && (
        <IconRight className="h-4 w-4 shrink-0" />
      )}
    </button>
  );
}