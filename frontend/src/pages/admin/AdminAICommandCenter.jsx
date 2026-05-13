/**
 * AdminAICommandCenter — AI-Powered Admin Academic Command Center
 * Route: /admin/ai-results
 *
 * Sections:
 *   1. University-wide AI KPI grid with animated counters
 *   2. AI University Intelligence summary + health score
 *   3. Department Performance Rankings
 *   4. Subject Heatmap (university-wide)
 *   5. At-Risk Student Tracker
 *   6. Semester Trend Chart
 *   7. Grade Distribution
 *   8. AI Report download
 */

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, BarChart3, Users, TrendingUp, AlertTriangle, Award,
  Building2, Target, RefreshCw, FileDown, Filter, Map,
  GraduationCap, Activity, Sparkles, Shield,
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, BarChart, Bar, PieChart, Pie, Cell, Legend,
  Area, AreaChart,
} from 'recharts';
import {
  getAdminOverview,
  getDepartmentRankings,
  getRiskStudents,
  getSubjectHeatmap,
  getToppers,
} from '../../services/aiAnalyticsApi';
import { AIMetricCard } from '../../components/ai/AIMetricCard';
import { AIAlertBadge } from '../../components/ai/AIAlertBadge';
import { SubjectHeatmap } from '../../components/ai/SubjectHeatmap';
import { RiskStudentRow } from '../../components/ai/RiskStudentCard';
import { SmartReportModal } from '../../components/ai/SmartReportModal';
import { AIDashboardSkeleton, AITableSkeleton, AIChartSkeleton } from '../../components/ai/AISkeletonLoader';

/* ------------------------------------------------------------------ */
/* HELPERS                                                              */
/* ------------------------------------------------------------------ */

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay },
  };
}

function Panel({ children, className = '' }) {
  return (
    <div className={`rounded-3xl border border-white/10 bg-slate-900/85 backdrop-blur-xl ${className}`}>
      {children}
    </div>
  );
}

function PanelHeader({ icon: Icon, title, sub, color = 'text-indigo-400', action }) {
  return (
    <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 border border-white/10">
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">{title}</h3>
          {sub && <p className="text-xs text-slate-500">{sub}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

const GRADE_COLORS = {
  O: '#10b981',
  'A+': '#0ea5e9',
  A: '#6366f1',
  'B+': '#a855f7',
  B: '#f59e0b',
  C: '#f97316',
  F: '#ef4444',
};

const TIER_COLORS = {
  Excellent: '#10b981',
  Good: '#0ea5e9',
  Average: '#f59e0b',
  'Below Average': '#f97316',
  Critical: '#ef4444',
};

function GradeTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/95 p-2.5 text-xs shadow-2xl backdrop-blur-xl">
      <p className="font-bold" style={{ color: payload[0]?.payload?.fill || 'white' }}>
        Grade {payload[0]?.name}: {payload[0]?.value}
      </p>
    </div>
  );
}

function LineTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/95 p-3 text-xs shadow-2xl backdrop-blur-xl">
      <p className="mb-1 font-bold text-slate-300">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.name}: {Number(p.value).toFixed(1)}{p.name.includes('%') || p.name.includes('Rate') ? '%' : ''}
        </p>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* DEPT RANKINGS TABLE                                                  */
/* ------------------------------------------------------------------ */

function DeptRankingsTable({ rankings, loading }) {
  if (loading) return <AITableSkeleton rows={6} cols={6} />;
  if (!rankings?.length) return (
    <div className="flex items-center justify-center py-10">
      <p className="text-sm text-slate-500">No department data available</p>
    </div>
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-white/8 bg-slate-950/40">
            {['Rank', 'Department', 'Students', 'Avg %', 'Avg CGPA', 'Pass %', 'Tier'].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rankings.map((dept, i) => (
            <motion.tr
              key={dept.department_id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="border-t border-white/5 hover:bg-white/3 transition-colors"
            >
              <td className="px-4 py-3">
                <span className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-black ${i === 0 ? 'bg-amber-500/20 text-amber-300' :
                    i === 1 ? 'bg-slate-500/20 text-slate-300' :
                      i === 2 ? 'bg-orange-500/20 text-orange-300' :
                        'bg-slate-800 text-slate-500'
                  }`}>
                  #{dept.rank}
                </span>
              </td>
              <td className="px-4 py-3">
                <p className="font-semibold text-white">{dept.department_name}</p>
                <p className="text-xs text-slate-500">{dept.department_code}</p>
              </td>
              <td className="px-4 py-3 text-slate-300">{dept.student_count}</td>
              <td className="px-4 py-3 font-semibold text-white">{dept.avg_percentage}%</td>
              <td className="px-4 py-3 font-semibold text-indigo-300">{dept.avg_cgpa}</td>
              <td className="px-4 py-3">
                <span className={`font-bold ${Number(dept.pass_rate) >= 70 ? 'text-emerald-400' : Number(dept.pass_rate) >= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {dept.pass_rate}%
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style={{
                    background: `${TIER_COLORS[dept.performanceTier] || '#6366f1'}20`,
                    color: TIER_COLORS[dept.performanceTier] || '#a5b4fc',
                    border: `1px solid ${TIER_COLORS[dept.performanceTier] || '#6366f1'}40`,
                  }}>
                  {dept.performanceTier}
                </span>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* TOPPERS TABLE                                                        */
/* ------------------------------------------------------------------ */

function ToppersTable({ toppers }) {
  if (!toppers?.length) return (
    <div className="flex items-center justify-center py-8">
      <p className="text-sm text-slate-500">No topper data available</p>
    </div>
  );

  return (
    <div className="space-y-2">
      {toppers.slice(0, 8).map((t, i) => (
        <motion.div
          key={t.student_id}
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.05 }}
          className="flex items-center gap-3 rounded-xl border border-white/8 bg-slate-950/40 px-4 py-3"
        >
          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black ${i === 0 ? 'bg-amber-500/20 text-amber-300' :
              i === 1 ? 'bg-slate-400/10 text-slate-300' :
                i === 2 ? 'bg-orange-500/15 text-orange-300' :
                  'bg-slate-800 text-slate-500'
            }`}>
            #{i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">{t.first_name} {t.last_name}</p>
            <p className="text-xs text-slate-500">{t.student_code} · {t.department_name}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-black text-indigo-300">{Number(t.avg_percentage).toFixed(1)}%</p>
            <p className="text-[10px] text-slate-500">CGPA {Number(t.cgpa).toFixed(2)}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* MAIN COMPONENT                                                       */
/* ------------------------------------------------------------------ */

export default function AdminAICommandCenter() {
  const [overview, setOverview] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [riskStudents, setRiskStudents] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [toppers, setToppers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingRisk, setLoadingRisk] = useState(true);

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [riskDeptFilter, setRiskDeptFilter] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const fetchCore = useCallback(async () => {
    setLoading(true);
    try {
      const [ov, rk, hm, tp] = await Promise.allSettled([
        getAdminOverview(),
        getDepartmentRankings(),
        getSubjectHeatmap(),
        getToppers({ limit: 10 }),
      ]);
      if (ov.status === 'fulfilled') setOverview(ov.value);
      if (rk.status === 'fulfilled') setRankings(rk.value?.rankings || []);
      if (hm.status === 'fulfilled') setHeatmap(hm.value?.heatmap || []);
      if (tp.status === 'fulfilled') setToppers(tp.value?.toppers || []);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRisk = useCallback(async () => {
    setLoadingRisk(true);
    try {
      const params = riskDeptFilter ? { departmentId: riskDeptFilter } : {};
      const res = await getRiskStudents(params);
      setRiskStudents(res?.riskStudents || []);
    } finally {
      setLoadingRisk(false);
    }
  }, [riskDeptFilter]);

  useEffect(() => { fetchCore(); }, [fetchCore]);
  useEffect(() => { fetchRisk(); }, [fetchRisk]);

  const kpis = overview?.kpis || {};
  const insight = overview?.universityInsight;

  const TAB_LIST = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'rankings', label: 'Rankings', icon: Award },
    { id: 'risk', label: 'At-Risk Students', icon: AlertTriangle },
    { id: 'heatmap', label: 'Subject Heatmap', icon: Map },
    { id: 'toppers', label: 'Toppers', icon: GraduationCap },
  ];

  if (loading) {
    return (
      <div className="text-white">
        <AIDashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="text-white">
      {/* ── HEADER ── */}
      <motion.div {...fadeUp(0)} className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.25em] text-indigo-400">
            Admin · AI Academic Command Center
          </p>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            AI{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Command
            </span>{' '}
            Center
          </h1>
          <p className="mt-2 text-slate-400">University-wide academic intelligence, rankings, and risk monitoring.</p>
        </div>

        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={fetchCore}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-sm font-semibold transition hover:border-indigo-500/40"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={() => setReportModalOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-500/20 px-4 py-2.5 text-sm font-semibold text-indigo-300 transition hover:bg-indigo-500/30"
          >
            <FileDown className="h-4 w-4" />
            AI Report
          </motion.button>
        </div>
      </motion.div>

      {/* ── UNIVERSITY HEALTH BANNER ── */}
      {insight && (
        <motion.div {...fadeUp(0.05)} className="mb-6">
          <div className="relative overflow-hidden rounded-3xl border border-indigo-500/25 bg-gradient-to-r from-indigo-500/10 via-purple-500/8 to-cyan-500/10 p-5 shadow-xl shadow-indigo-500/10">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
            <div className="relative flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 border border-indigo-500/30">
                  <Brain className="h-6 w-6 text-indigo-400" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-indigo-400">AI University Intelligence</p>
                  <p className="text-2xl font-black text-white">Health Score: {insight.healthScore}/100</p>
                </div>
              </div>
              <div className="flex-1 min-w-64">
                <p className="text-sm leading-relaxed text-slate-300">{insight.insight}</p>
              </div>
              <div className="shrink-0">
                <div className="h-2 w-48 overflow-hidden rounded-full bg-slate-800">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${insight.healthScore}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
                    className="h-full rounded-full"
                    style={{
                      background: insight.healthScore >= 80
                        ? 'linear-gradient(90deg, #10b981, #06d6a0)'
                        : insight.healthScore >= 60
                          ? 'linear-gradient(90deg, #6366f1, #8b5cf6)'
                          : insight.healthScore >= 40
                            ? 'linear-gradient(90deg, #f59e0b, #f97316)'
                            : 'linear-gradient(90deg, #ef4444, #dc2626)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── KPI GRID ── */}
      <motion.div {...fadeUp(0.1)} className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AIMetricCard label="Students with Results" value={kpis.total_students_with_results ?? 0} color="cyan" icon={Users} sub="Across all departments" delay={0.1} />
        <AIMetricCard label="Overall Pass Rate" value={kpis.overall_pass_rate ?? 0} suffix="%" color="emerald" icon={TrendingUp} sub="University-wide" delay={0.15} />
        <AIMetricCard label="Average CGPA" value={kpis.avg_cgpa ?? 0} color="indigo" icon={GraduationCap} sub="All students" decimals={2} delay={0.2} />
        <AIMetricCard label="Total Failures" value={kpis.total_failures ?? 0} color="rose" icon={AlertTriangle} sub={`${kpis.active_departments ?? 0} departments`} delay={0.25} />
      </motion.div>

      {/* ── TABS ── */}
      <motion.div {...fadeUp(0.15)} className="mb-4">
        <div className="flex flex-wrap gap-1 rounded-2xl border border-white/8 bg-slate-950/50 p-1">
          {TAB_LIST.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${activeTab === id
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-500 hover:text-slate-300'
                }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
              {id === 'risk' && riskStudents.filter((s) => s.riskLevel === 'critical').length > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white">
                  {riskStudents.filter((s) => s.riskLevel === 'critical').length}
                </span>
              )}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── TAB CONTENT ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
        >
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="grid gap-5 lg:grid-cols-2">
              {/* Semester Trend */}
              <Panel className="p-5">
                <PanelHeader icon={TrendingUp} title="University Semester Trend" sub="Avg % and pass rate over semesters" color="text-emerald-400" />
                <div className="mt-4 h-64">
                  {overview?.semesterTrend?.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={overview.semesterTrend} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="avgGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="passGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="semester" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip content={<LineTooltip />} />
                        <Area type="monotone" dataKey="avg_percentage" name="Avg %" stroke="#6366f1" strokeWidth={2.5} fill="url(#avgGrad)" dot={{ fill: '#6366f1', r: 3 }} />
                        <Area type="monotone" dataKey="pass_rate" name="Pass Rate" stroke="#10b981" strokeWidth={2} fill="url(#passGrad)" dot={{ fill: '#10b981', r: 3 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <AIChartSkeleton height={240} />
                  )}
                </div>
              </Panel>

              {/* Grade Distribution */}
              <Panel className="p-5">
                <PanelHeader icon={BarChart3} title="Grade Distribution" sub="University-wide grade breakdown" color="text-purple-400" />
                <div className="mt-4 h-64">
                  {overview?.gradeBreakdown?.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={overview.gradeBreakdown}
                          dataKey="cnt"
                          nameKey="grade"
                          outerRadius={95}
                          innerRadius={40}
                          paddingAngle={2}
                        >
                          {overview.gradeBreakdown.map((entry) => (
                            <Cell key={entry.grade} fill={GRADE_COLORS[entry.grade] || '#6366f1'} />
                          ))}
                        </Pie>
                        <Tooltip content={<GradeTooltip />} />
                        <Legend
                          formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 11 }}>{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <AIChartSkeleton height={240} />
                  )}
                </div>
              </Panel>
            </div>
          )}

          {/* RANKINGS TAB */}
          {activeTab === 'rankings' && (
            <Panel>
              <PanelHeader icon={Award} title="Department Performance Rankings" sub="Ranked by average percentage and CGPA" color="text-amber-400" />
              <div className="p-5">
                <DeptRankingsTable rankings={rankings} loading={loading} />
              </div>
            </Panel>
          )}

          {/* RISK STUDENTS TAB */}
          {activeTab === 'risk' && (
            <Panel>
              <PanelHeader
                icon={AlertTriangle}
                title="At-Risk Student Tracker"
                sub={`${riskStudents.length} students flagged · sorted by risk level`}
                color="text-rose-400"
              />
              <div className="p-5">
                {loadingRisk ? (
                  <AITableSkeleton rows={8} cols={6} />
                ) : riskStudents.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Shield className="mx-auto mb-2 h-10 w-10 text-emerald-400" />
                      <p className="text-sm text-slate-400">No at-risk students detected — excellent academic health!</p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/8 bg-slate-950/40">
                          {['Student', 'Department', 'CGPA', 'Failures', 'Avg %', 'Risk Level'].map((h) => (
                            <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {riskStudents.map((s, i) => (
                          <RiskStudentRow key={s.student_id} student={s} index={i} />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </Panel>
          )}

          {/* HEATMAP TAB */}
          {activeTab === 'heatmap' && (
            <Panel>
              <PanelHeader icon={Map} title="University Subject Performance Heatmap" sub="All subjects ranked by performance — red = hardest" color="text-cyan-400" />
              <div className="p-5">
                <SubjectHeatmap data={heatmap} loading={loading} height={400} />
              </div>
            </Panel>
          )}

          {/* TOPPERS TAB */}
          {activeTab === 'toppers' && (
            <Panel>
              <PanelHeader icon={GraduationCap} title="University Top Performers" sub="Highest scoring students across all departments" color="text-emerald-400" />
              <div className="p-5">
                <ToppersTable toppers={toppers} />
              </div>
            </Panel>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── REPORT MODAL ── */}
      <SmartReportModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        departmentId={null}
        semester={1}
        departmentName="All Departments"
      />
    </div>
  );
}
