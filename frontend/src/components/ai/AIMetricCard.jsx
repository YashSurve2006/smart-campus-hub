/**
 * AIMetricCard — Premium floating analytics card
 * Features animated counter, trend arrow, sparkline indicator,
 * gradient glow effect, and smooth entrance animation.
 */

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

function useAnimatedCounter(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    if (target === null || target === undefined) return;
    const numTarget = parseFloat(target) || 0;
    const startTime = performance.now();
    const startValue = 0;

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (numTarget - startValue) * eased;
      setCount(current);
      if (progress < 1) {
        raf.current = requestAnimationFrame(tick);
      }
    }

    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration]);

  return count;
}

const TREND_CONFIG = {
  improving: { icon: TrendingUp, color: 'text-emerald-400', label: '↑ Improving' },
  declining: { icon: TrendingDown, color: 'text-rose-400', label: '↓ Declining' },
  stable: { icon: Minus, color: 'text-slate-400', label: '→ Stable' },
  unknown: { icon: Minus, color: 'text-slate-500', label: '—' },
};

const CARD_COLORS = {
  cyan: {
    glow: 'shadow-cyan-500/20',
    border: 'border-cyan-500/25',
    iconBg: 'bg-cyan-500/15',
    iconColor: 'text-cyan-400',
    gradient: 'from-cyan-500/10 to-transparent',
    counter: 'text-cyan-300',
  },
  indigo: {
    glow: 'shadow-indigo-500/20',
    border: 'border-indigo-500/25',
    iconBg: 'bg-indigo-500/15',
    iconColor: 'text-indigo-400',
    gradient: 'from-indigo-500/10 to-transparent',
    counter: 'text-white',
  },
  emerald: {
    glow: 'shadow-emerald-500/20',
    border: 'border-emerald-500/25',
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
    gradient: 'from-emerald-500/10 to-transparent',
    counter: 'text-emerald-300',
  },
  amber: {
    glow: 'shadow-amber-500/20',
    border: 'border-amber-500/25',
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-400',
    gradient: 'from-amber-500/10 to-transparent',
    counter: 'text-amber-300',
  },
  rose: {
    glow: 'shadow-rose-500/20',
    border: 'border-rose-500/25',
    iconBg: 'bg-rose-500/15',
    iconColor: 'text-rose-400',
    gradient: 'from-rose-500/10 to-transparent',
    counter: 'text-rose-300',
  },
  purple: {
    glow: 'shadow-purple-500/20',
    border: 'border-purple-500/25',
    iconBg: 'bg-purple-500/15',
    iconColor: 'text-purple-400',
    gradient: 'from-purple-500/10 to-transparent',
    counter: 'text-purple-300',
  },
};

export function AIMetricCard({
  label,
  value,
  suffix = '',
  prefix = '',
  icon: Icon,
  color = 'indigo',
  trend,
  sub,
  delay = 0,
  decimals = 0,
  loading = false,
}) {
  const animatedValue = useAnimatedCounter(loading ? 0 : parseFloat(value) || 0);
  const cfg = CARD_COLORS[color] || CARD_COLORS.indigo;
  const trendCfg = trend ? TREND_CONFIG[trend] : null;
  const TrendIcon = trendCfg?.icon;

  if (loading) {
    return (
      <div className="h-36 animate-pulse rounded-3xl border border-white/10 bg-slate-900/60" />
    );
  }

  const displayValue = decimals > 0
    ? animatedValue.toFixed(decimals)
    : Math.round(animatedValue).toLocaleString();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      whileHover={{ y: -3, scale: 1.02 }}
      className={`relative overflow-hidden rounded-3xl border backdrop-blur-xl
        bg-slate-900/85 shadow-xl transition-all duration-300
        ${cfg.border} ${cfg.glow}`}
    >
      {/* Corner gradient glow */}
      <div className={`absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gradient-to-br ${cfg.gradient} blur-2xl`} />

      <div className="relative p-5">
        {/* Header row */}
        <div className="mb-3 flex items-center justify-between">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">{label}</p>
          {Icon && (
            <motion.div
              whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
              transition={{ duration: 0.4 }}
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${cfg.iconBg}`}
            >
              <Icon className={`h-4.5 w-4.5 ${cfg.iconColor}`} />
            </motion.div>
          )}
        </div>

        {/* Value */}
        <div className="flex items-baseline gap-1">
          {prefix && <span className="text-lg font-semibold text-slate-400">{prefix}</span>}
          <p className={`text-4xl font-black tracking-tight ${cfg.counter}`}>
            {displayValue}
          </p>
          {suffix && <span className="text-base font-semibold text-slate-400">{suffix}</span>}
        </div>

        {/* Footer row */}
        <div className="mt-2 flex items-center gap-2">
          {trendCfg && TrendIcon && (
            <div className={`flex items-center gap-1 text-[11px] font-semibold ${trendCfg.color}`}>
              <TrendIcon className="h-3 w-3" />
              {trendCfg.label}
            </div>
          )}
          {sub && <p className="text-[11px] text-slate-500">{sub}</p>}
        </div>
      </div>
    </motion.div>
  );
}
