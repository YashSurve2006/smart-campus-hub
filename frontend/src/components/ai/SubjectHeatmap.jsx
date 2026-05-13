/**
 * SubjectHeatmap — Color-coded subject performance visualization.
 * Renders a horizontal bar chart where bar color encodes difficulty
 * (red = hard, green = easy) with pass rate overlay and tooltips.
 */

import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceLine,
} from 'recharts';

/** Returns a gradient color between red and green based on score (0–100) */
function heatColor(score) {
  if (score >= 75) return '#10b981'; // emerald
  if (score >= 60) return '#0ea5e9'; // sky
  if (score >= 45) return '#f59e0b'; // amber
  if (score >= 30) return '#f97316'; // orange
  return '#ef4444';                  // red
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/95 p-3 shadow-2xl backdrop-blur-xl text-xs">
      <p className="mb-1 font-bold text-white">{d.code} — {d.name}</p>
      <p className="text-slate-400">Avg: <span className="font-semibold text-white">{d.avg_percentage}%</span></p>
      <p className="text-slate-400">Pass rate: <span className="font-semibold text-emerald-400">{d.pass_rate}%</span></p>
      <p className="text-slate-400">Failures: <span className="font-semibold text-rose-400">{d.failure_count}</span></p>
      <p className="text-slate-400">
        Difficulty: <span className="font-semibold" style={{ color: heatColor(d.heatScore) }}>
          {d.difficultyLabel}
        </span>
      </p>
    </div>
  );
}

function DifficultyLegend() {
  const items = [
    { label: 'Very Hard', color: '#ef4444' },
    { label: 'Hard', color: '#f97316' },
    { label: 'Moderate', color: '#f59e0b' },
    { label: 'Easy', color: '#0ea5e9' },
    { label: 'Very Easy', color: '#10b981' },
  ];
  return (
    <div className="mb-4 flex flex-wrap gap-3">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
          <span className="text-[10px] text-slate-500">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

export function SubjectHeatmap({ data = [], loading = false, height = 300 }) {
  if (loading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 animate-pulse rounded-lg bg-slate-800/60"
            style={{ width: `${60 + Math.random() * 40}%` }} />
        ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/50">
        <p className="text-sm text-slate-500">No subject data available</p>
      </div>
    );
  }

  // Sort by avg_percentage ascending (hardest first) and cap at 15
  const chartData = [...data]
    .sort((a, b) => Number(a.avg_percentage) - Number(b.avg_percentage))
    .slice(0, 15)
    .map((d) => ({
      ...d,
      avg_percentage: Number(d.avg_percentage),
      pass_rate: Number(d.pass_rate),
      heatScore: Number(d.heatScore),
    }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <DifficultyLegend />
      <ResponsiveContainer width="100%" height={height}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
        >
          <XAxis
            type="number"
            domain={[0, 100]}
            tick={{ fill: '#475569', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="code"
            width={70}
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <ReferenceLine x={40} stroke="#ef4444" strokeDasharray="3 3" strokeOpacity={0.4} />
          <ReferenceLine x={60} stroke="#f59e0b" strokeDasharray="3 3" strokeOpacity={0.4} />
          <Bar dataKey="avg_percentage" radius={[0, 6, 6, 0]} maxBarSize={22}>
            {chartData.map((entry) => (
              <Cell key={entry.code} fill={heatColor(entry.heatScore)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
