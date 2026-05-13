/**
 * RiskStudentCard — At-risk student card with risk level badge,
 * trend indicators, fail count, and subject weak areas.
 */

import { motion } from 'framer-motion';
import { AlertTriangle, User, TrendingDown, BookOpen } from 'lucide-react';
import { AIAlertBadge } from './AIAlertBadge';

const RISK_CONFIG = {
  critical: {
    border: 'border-red-500/40',
    bg: 'bg-red-500/8',
    glow: 'shadow-red-500/15',
    cgpaColor: 'text-red-400',
  },
  high: {
    border: 'border-amber-500/35',
    bg: 'bg-amber-500/6',
    glow: 'shadow-amber-500/10',
    cgpaColor: 'text-amber-400',
  },
  medium: {
    border: 'border-yellow-500/30',
    bg: 'bg-yellow-500/5',
    glow: 'shadow-yellow-500/10',
    cgpaColor: 'text-yellow-400',
  },
  low: {
    border: 'border-white/10',
    bg: 'bg-slate-900/60',
    glow: 'shadow-black/10',
    cgpaColor: 'text-slate-400',
  },
};

function RiskScoreBar({ score }) {
  const color = score >= 60 ? '#ef4444' : score >= 35 ? '#f59e0b' : score >= 15 ? '#eab308' : '#10b981';
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, score)}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

export function RiskStudentCard({ student, delay = 0 }) {
  const riskLevel = student.riskLevel || 'low';
  const cfg = RISK_CONFIG[riskLevel] || RISK_CONFIG.low;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay }}
      whileHover={{ scale: 1.01, y: -2 }}
      className={`relative rounded-2xl border backdrop-blur-xl p-4 shadow-lg transition-all duration-300
        ${cfg.border} ${cfg.bg} ${cfg.glow}`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800/80 border border-white/10">
          <User className="h-5 w-5 text-slate-400" />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold text-white">
              {student.first_name} {student.last_name}
            </p>
            <AIAlertBadge severity={riskLevel === 'critical' ? 'critical' : riskLevel === 'high' ? 'warning' : 'info'} label={riskLevel.toUpperCase()} />
          </div>

          <p className="mt-0.5 text-xs text-slate-500">{student.student_code} · {student.department_name}</p>

          {/* Stats row */}
          <div className="mt-2 flex flex-wrap gap-3">
            <div>
              <p className="text-[10px] text-slate-600 uppercase tracking-wide">CGPA</p>
              <p className={`text-base font-black ${cfg.cgpaColor}`}>
                {Number(student.cgpa || 0).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-600 uppercase tracking-wide">Avg %</p>
              <p className="text-base font-black text-white">
                {Number(student.avg_percentage || 0).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-600 uppercase tracking-wide">Failures</p>
              <p className={`text-base font-black ${Number(student.fail_count) > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {student.fail_count || 0}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-600 uppercase tracking-wide">Semester</p>
              <p className="text-base font-black text-slate-300">
                {student.current_semester || '-'}
              </p>
            </div>
          </div>

          {/* Risk score bar */}
          <div>
            <div className="mt-2 flex items-center justify-between">
              <p className="text-[10px] text-slate-600 uppercase tracking-wide">Risk Score</p>
              <p className="text-[10px] font-semibold text-slate-400">{student.riskScore || 0}/100</p>
            </div>
            <RiskScoreBar score={student.riskScore || 0} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Compact table row variant for admin risk table
 */
export function RiskStudentRow({ student, index }) {
  const riskLevel = student.riskLevel || 'low';

  return (
    <motion.tr
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className="border-t border-white/5 hover:bg-indigo-500/5 transition-colors"
    >
      <td className="px-4 py-3">
        <p className="text-sm font-semibold text-white">{student.first_name} {student.last_name}</p>
        <p className="text-xs text-slate-500">{student.student_code}</p>
      </td>
      <td className="px-4 py-3 text-xs text-slate-400">{student.department_name}</td>
      <td className="px-4 py-3">
        <span className={`text-sm font-bold ${Number(student.cgpa) < 5 ? 'text-rose-400' : 'text-slate-300'}`}>
          {Number(student.cgpa || 0).toFixed(2)}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`text-sm font-bold ${Number(student.fail_count) > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
          {student.fail_count || 0}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-slate-300">{Number(student.avg_percentage || 0).toFixed(1)}%</td>
      <td className="px-4 py-3">
        <AIAlertBadge
          severity={riskLevel === 'critical' ? 'critical' : riskLevel === 'high' ? 'warning' : 'info'}
          label={riskLevel.toUpperCase()}
        />
      </td>
    </motion.tr>
  );
}
