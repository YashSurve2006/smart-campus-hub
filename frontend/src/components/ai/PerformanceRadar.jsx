/**
 * PerformanceRadar — Enhanced dark-neon radar chart wrapper.
 * Uses Recharts RadarChart with dark theme, animated entrance,
 * and custom tooltip.
 */

import { motion } from 'framer-motion';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/95 p-2.5 text-xs shadow-2xl backdrop-blur-xl">
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.name}: {Number(p.value).toFixed(1)}%
        </p>
      ))}
    </div>
  );
}

export function PerformanceRadar({
  data = [],          // [{ subject: 'CS101', marks: 85, benchmark: 60 }]
  loading = false,
  height = 280,
  showBenchmark = false,
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <div className="h-40 w-40 animate-pulse rounded-full bg-slate-800/60" />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl border border-white/10 bg-slate-900/50"
        style={{ height }}
      >
        <p className="text-sm text-slate-500">No performance data yet</p>
      </div>
    );
  }

  const displayData = data.slice(0, 8).map((d) => ({
    subject: d.subject?.length > 8 ? d.subject.slice(0, 8) : d.subject,
    marks: Number(d.marks || 0),
    benchmark: Number(d.benchmark || 60),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <ResponsiveContainer width="100%" height={height}>
        <RadarChart data={displayData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
          />
          <PolarRadiusAxis
            domain={[0, 100]}
            tick={{ fill: '#475569', fontSize: 9 }}
            axisLine={false}
            tickCount={4}
          />

          {showBenchmark && (
            <Radar
              name="Benchmark"
              dataKey="benchmark"
              stroke="#475569"
              fill="#475569"
              fillOpacity={0.08}
              strokeDasharray="4 4"
            />
          )}

          <Radar
            name="Performance"
            dataKey="marks"
            stroke="#6366f1"
            fill="#6366f1"
            fillOpacity={0.25}
            strokeWidth={2}
            dot={{ fill: '#6366f1', r: 3 }}
            activeDot={{ fill: '#a5b4fc', r: 5, strokeWidth: 0 }}
          />

          <Tooltip content={<CustomTooltip />} />
          {showBenchmark && (
            <Legend
              wrapperStyle={{ fontSize: 11, color: '#64748b' }}
            />
          )}
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
