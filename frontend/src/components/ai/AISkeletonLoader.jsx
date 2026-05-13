/**
 * AISkeletonLoader — Animated skeleton loaders matching dark neon theme.
 * Multiple variants: card, list, table, chart, metric.
 */

import { motion } from 'framer-motion';

function Pulse({ className }) {
  return (
    <motion.div
      animate={{ opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
      className={`rounded-lg bg-slate-800/70 ${className}`}
    />
  );
}

/** Single metric card skeleton */
export function AIMetricSkeleton() {
  return (
    <div className="rounded-3xl border border-white/8 bg-slate-900/60 p-5">
      <div className="mb-3 flex items-center justify-between">
        <Pulse className="h-3 w-20" />
        <Pulse className="h-9 w-9 rounded-xl" />
      </div>
      <Pulse className="mb-2 h-10 w-28" />
      <Pulse className="h-3 w-16" />
    </div>
  );
}

/** Grid of metric card skeletons */
export function AIMetricGridSkeleton({ count = 4 }) {
  return (
    <div className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-${Math.min(count, 4)}`}>
      {[...Array(count)].map((_, i) => (
        <AIMetricSkeleton key={i} />
      ))}
    </div>
  );
}

/** Insight panel list skeleton */
export function AIInsightListSkeleton({ count = 4 }) {
  return (
    <div className="space-y-3">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="flex gap-3 rounded-2xl border border-white/8 bg-slate-900/50 p-4">
          <Pulse className="h-9 w-9 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Pulse className="h-3.5 w-32" />
            <Pulse className="h-3 w-full" />
            <Pulse className="h-3 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Chart area skeleton */
export function AIChartSkeleton({ height = 280 }) {
  return (
    <div
      className="flex items-end gap-2 rounded-2xl border border-white/8 bg-slate-900/50 px-4 pb-4 pt-6"
      style={{ height }}
    >
      {[45, 70, 55, 85, 40, 65, 90, 50, 75, 60].map((h, i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.1 }}
          className="flex-1 rounded-t-lg bg-slate-800/70"
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
}

/** Table skeleton */
export function AITableSkeleton({ rows = 6, cols = 5 }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/8 bg-slate-900/60">
      {/* Header */}
      <div className="flex gap-4 border-b border-white/8 bg-slate-950/40 px-5 py-3">
        {[...Array(cols)].map((_, i) => (
          <Pulse key={i} className="h-3 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {[...Array(rows)].map((_, r) => (
        <div key={r} className="flex gap-4 border-b border-white/5 px-5 py-4">
          {[...Array(cols)].map((_, c) => (
            <Pulse
              key={c}
              className="h-3 flex-1"
              style={{ opacity: 0.4 + (c === 0 ? 0.3 : 0) }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Full AI dashboard page skeleton */
export function AIDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <Pulse className="h-4 w-40" />
        <Pulse className="h-10 w-80" />
        <Pulse className="h-4 w-60" />
      </div>

      {/* KPI grid */}
      <AIMetricGridSkeleton count={4} />

      {/* Charts */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-3 rounded-3xl border border-white/8 bg-slate-900/60 p-5">
          <Pulse className="h-4 w-32" />
          <AIChartSkeleton height={240} />
        </div>
        <div className="space-y-3 rounded-3xl border border-white/8 bg-slate-900/60 p-5">
          <Pulse className="h-4 w-32" />
          <AIChartSkeleton height={240} />
        </div>
      </div>

      {/* Insights */}
      <div className="rounded-3xl border border-white/8 bg-slate-900/60 p-5">
        <Pulse className="mb-4 h-4 w-32" />
        <AIInsightListSkeleton count={3} />
      </div>
    </div>
  );
}
