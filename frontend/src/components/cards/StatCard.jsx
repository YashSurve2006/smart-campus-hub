/**
 * StatCard v2 — Next-Gen Enterprise KPI Card
 * White-alpha glass on navy, layered glow, animated counter, premium hover.
 */
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { fadeUp } from '../../utils/animations';

/* ── Animated counter ── */
function AnimatedNumber({ value, decimals = 0, prefix = '', suffix = '' }) {
  const ref = useRef(null);
  const prevRef = useRef(0);

  useEffect(() => {
    const target = parseFloat(value) || 0;
    const start  = prevRef.current;
    const dur    = 900;
    const startT = performance.now();

    function step(now) {
      const progress = Math.min((now - startT) / dur, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const cur  = start + (target - start) * ease;
      if (ref.current) ref.current.textContent = prefix + cur.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else prevRef.current = target;
    }

    requestAnimationFrame(step);
  }, [value, decimals, prefix, suffix]);

  return (
    <span ref={ref}>
      {prefix}{parseFloat(value || 0).toFixed(decimals)}{suffix}
    </span>
  );
}

/* ── Color presets — vivid on navy canvas ── */
const PRESETS = {
  indigo: {
    glow:   'rgba(99,102,241,0.20)',
    ring:   'rgba(99,102,241,0.15)',
    icon:   'from-indigo-500/20 to-indigo-600/10 ring-indigo-500/25',
    text:   'text-indigo-400',
    bar:    'from-indigo-500 to-violet-500',
    orb:    'bg-indigo-500/15',
  },
  blue: {
    glow:   'rgba(59,130,246,0.18)',
    ring:   'rgba(59,130,246,0.12)',
    icon:   'from-blue-500/20 to-blue-600/10 ring-blue-500/25',
    text:   'text-blue-400',
    bar:    'from-blue-500 to-cyan-500',
    orb:    'bg-blue-500/15',
  },
  cyan: {
    glow:   'rgba(6,182,212,0.18)',
    ring:   'rgba(6,182,212,0.12)',
    icon:   'from-cyan-500/20 to-cyan-600/10 ring-cyan-500/25',
    text:   'text-cyan-400',
    bar:    'from-cyan-500 to-teal-500',
    orb:    'bg-cyan-500/15',
  },
  violet: {
    glow:   'rgba(139,92,246,0.18)',
    ring:   'rgba(139,92,246,0.12)',
    icon:   'from-violet-500/20 to-violet-600/10 ring-violet-500/25',
    text:   'text-violet-400',
    bar:    'from-violet-500 to-purple-500',
    orb:    'bg-violet-500/15',
  },
  emerald: {
    glow:   'rgba(16,185,129,0.18)',
    ring:   'rgba(16,185,129,0.12)',
    icon:   'from-emerald-500/20 to-emerald-600/10 ring-emerald-500/25',
    text:   'text-emerald-400',
    bar:    'from-emerald-500 to-teal-500',
    orb:    'bg-emerald-500/15',
  },
  amber: {
    glow:   'rgba(245,158,11,0.18)',
    ring:   'rgba(245,158,11,0.12)',
    icon:   'from-amber-500/20 to-amber-600/10 ring-amber-500/25',
    text:   'text-amber-400',
    bar:    'from-amber-500 to-orange-500',
    orb:    'bg-amber-500/15',
  },
  rose: {
    glow:   'rgba(239,68,68,0.18)',
    ring:   'rgba(239,68,68,0.12)',
    icon:   'from-rose-500/20 to-rose-600/10 ring-rose-500/25',
    text:   'text-rose-400',
    bar:    'from-rose-500 to-pink-500',
    orb:    'bg-rose-500/15',
  },
  teal: {
    glow:   'rgba(20,184,166,0.18)',
    ring:   'rgba(20,184,166,0.12)',
    icon:   'from-teal-500/20 to-teal-600/10 ring-teal-500/25',
    text:   'text-teal-400',
    bar:    'from-teal-500 to-cyan-500',
    orb:    'bg-teal-500/15',
  },
};

function TrendBadge({ trend }) {
  if (!trend) return null;
  const up = String(trend).startsWith('+') || trend === 'up';
  return (
    <div className={[
      'flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold',
      up ? 'bg-emerald-500/12 text-emerald-400 border border-emerald-500/20'
         : 'bg-rose-500/12 text-rose-400 border border-rose-500/20',
    ].join(' ')}>
      {up ? <TrendingUp className="h-2.5 w-2.5" /> : <TrendingDown className="h-2.5 w-2.5" />}
      {typeof trend === 'string' ? trend : ''}
    </div>
  );
}

export function StatCard({
  label,
  value    = 0,
  sub,
  icon: Icon,
  delay    = 0,
  color    = 'indigo',
  trend,
  prefix   = '',
  suffix   = '',
  decimals = 0,
  loading  = false,
}) {
  const p = PRESETS[color] || PRESETS.indigo;

  if (loading) {
    return (
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2.5 flex-1">
            <div className="shimmer h-3 w-20 rounded-full bg-white/[0.06]" />
            <div className="shimmer h-9 w-28 mt-2 rounded-xl bg-white/[0.06]" />
            <div className="shimmer h-3 w-16 rounded-full bg-white/[0.06]" />
          </div>
          <div className="shimmer h-10 w-10 rounded-xl bg-white/[0.06] shrink-0" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      {...fadeUp(delay)}
      whileHover={{ y: -4, scale: 1.01 }}
      className="group relative"
    >
      {/* Ambient glow halo — appears on hover */}
      <div
        className="absolute -inset-0.5 rounded-2xl opacity-0 blur-lg transition-all duration-500 group-hover:opacity-100"
        style={{ background: p.glow }}
      />

      {/* Card surface */}
      <div
        className={[
          'relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.04]',
          'backdrop-blur-2xl p-5',
        ].join(' ')}
        style={{
          boxShadow: `0 1px 0 rgba(255,255,255,0.05) inset, 0 8px 32px rgba(0,0,0,0.3)`,
        }}
      >
        {/* Corner orb accent */}
        <div className={`absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl opacity-40 transition-opacity duration-500 group-hover:opacity-70 ${p.orb}`} />

        {/* Top shine edge */}
        <div className="absolute inset-x-0 top-0 h-px rounded-t-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Content */}
        <div className="relative flex items-start justify-between gap-3">
          {Icon && (
            <div className={[
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
              'bg-gradient-to-br ring-1 transition-transform duration-300 group-hover:scale-110',
              p.icon,
            ].join(' ')}>
              <Icon className={`h-5 w-5 ${p.text}`} />
            </div>
          )}
          <TrendBadge trend={trend} />
        </div>

        <div className="relative mt-4">
          <p className="text-3xl font-black tracking-tight text-white">
            <AnimatedNumber value={value} decimals={decimals} prefix={prefix} suffix={suffix} />
          </p>
          <p className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-600">
            {label}
          </p>
          {sub && (
            <p className="mt-0.5 text-xs text-slate-600 truncate">{sub}</p>
          )}
        </div>

        {/* Bottom accent bar */}
        <div
          className={[
            'absolute bottom-0 left-0 h-[2px] w-0 rounded-full',
            'transition-all duration-500 group-hover:w-full',
            `bg-gradient-to-r ${p.bar}`,
          ].join(' ')}
        />
      </div>
    </motion.div>
  );
}
