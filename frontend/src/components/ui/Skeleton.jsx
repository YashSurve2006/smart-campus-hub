/**
 * Skeleton v2 — Next-Gen Enterprise Loading States
 * White-alpha shimmer on navy canvas for proper visual consistency.
 */
import { motion } from 'framer-motion';

/* ── Base shimmer block ── */
export function Skeleton({ className = '', rounded = 'rounded-xl' }) {
  return (
    <div
      className={[
        'shimmer relative overflow-hidden',
        'bg-white/[0.05]',
        rounded,
        className,
      ].join(' ')}
      aria-hidden="true"
    />
  );
}

/* ── Text line ── */
export function SkeletonLine({ width = 'w-full', className = '' }) {
  return <Skeleton className={`h-3.5 ${width} ${className}`} rounded="rounded-full" />;
}

/* ── Icon/avatar block ── */
export function SkeletonIcon({ size = 'h-10 w-10', className = '' }) {
  return <Skeleton className={`${size} ${className}`} rounded="rounded-xl" />;
}

/* ── Stat card skeleton ── */
export function CardSkeleton({ className = '' }) {
  return (
    <div
      className={[
        'rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5',
        className,
      ].join(' ')}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2.5 flex-1">
          <SkeletonLine width="w-24" />
          <Skeleton className="h-9 w-32 mt-3" rounded="rounded-xl" />
          <SkeletonLine width="w-20" />
        </div>
        <SkeletonIcon className="shrink-0" />
      </div>
    </div>
  );
}

/* ── Table skeleton ── */
export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03]">
      {/* Header */}
      <div className="flex gap-4 border-b border-white/[0.05] bg-white/[0.02] px-5 py-3.5">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonLine key={i} width="flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4 border-t border-white/[0.03] px-5 py-4">
          <div className="flex items-center gap-3 flex-1">
            <SkeletonIcon size="h-8 w-8" />
            <div className="space-y-1.5 flex-1">
              <SkeletonLine width="w-32" />
              <SkeletonLine width="w-24" />
            </div>
          </div>
          {Array.from({ length: cols - 1 }).map((_, c) => (
            <SkeletonLine key={c} width="flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ── Chart area skeleton ── */
export function ChartSkeleton({ height = 240 }) {
  return (
    <div
      className="rounded-2xl border border-white/[0.06] bg-white/[0.03] flex items-end gap-1.5 px-4 pb-4 pt-8"
      style={{ height }}
    >
      {[40, 65, 50, 80, 45, 70, 90, 55, 75, 60, 85, 50].map((h, i) => (
        <motion.div
          key={i}
          className="flex-1 rounded-t-lg shimmer bg-white/[0.05]"
          style={{ height: `${h}%` }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.09 }}
        />
      ))}
    </div>
  );
}

/* ── Full dashboard page skeleton ── */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="space-y-2.5">
        <SkeletonLine width="w-32" />
        <Skeleton className="h-10 w-72" rounded="rounded-xl" />
        <SkeletonLine width="w-56" />
      </div>
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
      {/* Charts */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 space-y-3">
          <SkeletonLine width="w-40" />
          <ChartSkeleton />
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 space-y-3">
          <SkeletonLine width="w-40" />
          <ChartSkeleton />
        </div>
      </div>
      {/* Table */}
      <TableSkeleton rows={4} cols={5} />
    </div>
  );
}
