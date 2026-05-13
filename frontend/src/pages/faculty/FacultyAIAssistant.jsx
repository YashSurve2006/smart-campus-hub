/**
 * FacultyAIAssistant — AI-Powered Faculty Academic Assistant
 * Route: /faculty/ai-results
 *
 * Sections:
 *   1. Header with dept/semester filters
 *   2. KPI: moderation needed, anomalies, failure rate, at-risk students
 *   3. Smart Moderation Panel — subjects needing moderation with grace suggestions
 *   4. Anomaly Detection Report — flagged entries with severity
 *   5. Subject Difficulty Heatmap
 *   6. Failure Rate Analysis Matrix
 *   7. AI Smart Report Download
 */

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, AlertTriangle, BarChart3, Shield, FileDown,
  RefreshCw, SlidersHorizontal, CheckCircle2, XCircle,
  TrendingDown, Zap, AlertCircle, Eye,
} from 'lucide-react';
import { toast } from 'react-toastify';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell,
} from 'recharts';
import api from '../../services/api';
import {
  getFacultyModeration, getFacultyAnomalies, getSubjectDifficulty, getFailureMatrix
} from '../../services/aiAnalyticsApi';
import { AIMetricCard } from '../../components/ai/AIMetricCard';
import { AIAlertBadge, AIAlertCard } from '../../components/ai/AIAlertBadge';
import { SubjectHeatmap } from '../../components/ai/SubjectHeatmap';
import { SmartReportModal } from '../../components/ai/SmartReportModal';
import { AIMetricGridSkeleton, AIInsightListSkeleton, AIChartSkeleton, AITableSkeleton } from '../../components/ai/AISkeletonLoader';

/* ------------------------------------------------------------------ */
/* SMALL HELPERS                                                        */
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
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800/80 border border-white/10">
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

function SelectBox({ value, onChange, children }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="rounded-xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition-all focus:border-indigo-500"
    >
      {children}
    </select>
  );
}

const DIFFICULTY_COLORS = {
  'Very Hard': '#ef4444',
  'Hard': '#f97316',
  'Moderate': '#f59e0b',
  'Easy': '#0ea5e9',
  'Very Easy': '#10b981',
};

/* ------------------------------------------------------------------ */
/* MODERATION TABLE                                                     */
/* ------------------------------------------------------------------ */

function ModerationTable({ candidates, loading }) {
  if (loading) return <AITableSkeleton rows={5} cols={7} />;
  if (!candidates?.length) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <CheckCircle2 className="mx-auto mb-2 h-10 w-10 text-emerald-400" />
          <p className="text-sm text-slate-400">No moderation required for this selection</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-white/8 bg-slate-950/40">
            {['Subject', 'Avg %', 'Fail %', 'Failures', 'Urgency', 'Grace Marks', 'Proj. Pass %'].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {candidates.map((c, i) => (
            <motion.tr
              key={c.subject_id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="border-t border-white/5 hover:bg-white/3 transition-colors"
            >
              <td className="px-4 py-3">
                <p className="font-semibold text-white">{c.code}</p>
                <p className="text-xs text-slate-500">{c.name}</p>
              </td>
              <td className="px-4 py-3 text-slate-300">{c.avgPercentage}%</td>
              <td className="px-4 py-3">
                <span className={`font-bold ${c.failRate >= 60 ? 'text-rose-400' : c.failRate >= 30 ? 'text-amber-400' : 'text-slate-300'}`}>
                  {c.failRate}%
                </span>
              </td>
              <td className="px-4 py-3 text-slate-300">{c.failCount}/{c.totalEntries}</td>
              <td className="px-4 py-3">
                <AIAlertBadge
                  severity={c.moderationUrgency === 'urgent' ? 'critical' : c.moderationUrgency === 'recommended' ? 'warning' : 'info'}
                  label={c.moderationUrgency?.toUpperCase() || 'NONE'}
                />
              </td>
              <td className="px-4 py-3">
                <span className={`font-bold ${c.graceSuggestion?.graceMarks > 0 ? 'text-amber-300' : 'text-slate-500'}`}>
                  +{c.graceSuggestion?.graceMarks || 0}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="text-emerald-400 font-semibold">
                  {c.projectedPassRateAfterModeration != null ? `${Number(c.projectedPassRateAfterModeration).toFixed(0)}%` : '—'}
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
/* ANOMALY LIST                                                         */
/* ------------------------------------------------------------------ */

function AnomalyList({ anomalies, loading }) {
  if (loading) return <AIInsightListSkeleton count={4} />;
  if (!anomalies?.length) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="text-center">
          <Shield className="mx-auto mb-2 h-8 w-8 text-emerald-400" />
          <p className="text-sm text-slate-400">No anomalies detected — results look clean!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {anomalies.slice(0, 10).map((a, i) => (
        <AIAlertCard
          key={i}
          severity={a.severity === 'critical' ? 'critical' : a.severity === 'warning' ? 'warning' : 'info'}
          title={`[${a.type?.replace(/_/g, ' ').toUpperCase()}] ${a.subject || ''}`}
          message={a.detail}
          delay={i * 0.05}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* DIFFICULTY CHART                                                     */
/* ------------------------------------------------------------------ */

function DifficultyChart({ data, loading }) {
  if (loading) return <AIChartSkeleton height={260} />;
  if (!data?.length) return (
    <div className="flex h-48 items-center justify-center">
      <p className="text-sm text-slate-500">No difficulty data available</p>
    </div>
  );

  const chartData = data.slice(0, 12).map((d) => ({
    code: d.code,
    difficultyScore: Number(d.difficultyScore),
    label: d.difficultyLabel,
    avgPct: Number(d.avg_percentage),
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <XAxis dataKey="code" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.[0]) return null;
            const d = payload[0].payload;
            return (
              <div className="rounded-xl border border-white/10 bg-slate-900/95 p-3 text-xs shadow-2xl backdrop-blur-xl">
                <p className="mb-1 font-bold text-white">{d.code}</p>
                <p className="text-slate-400">Difficulty: <span className="font-semibold text-white">{d.difficultyScore}/100</span></p>
                <p className="text-slate-400">Avg: <span className="font-semibold text-white">{d.avgPct}%</span></p>
                <p className="text-slate-400">Label: <span className="font-semibold" style={{ color: DIFFICULTY_COLORS[d.label] || '#6366f1' }}>{d.label}</span></p>
              </div>
            );
          }}
          cursor={{ fill: 'rgba(255,255,255,0.03)' }}
        />
        <Bar dataKey="difficultyScore" radius={[6, 6, 0, 0]} maxBarSize={32}>
          {chartData.map((entry) => (
            <Cell key={entry.code} fill={DIFFICULTY_COLORS[entry.label] || '#6366f1'} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* ------------------------------------------------------------------ */
/* MAIN COMPONENT                                                       */
/* ------------------------------------------------------------------ */

export default function FacultyAIAssistant() {
  const [departmentId, setDepartmentId] = useState(1);
  const [semester, setSemester] = useState(5);
  const [departments, setDepartments] = useState([]);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('moderation');

  const [moderation, setModeration] = useState(null);
  const [anomalies, setAnomalies] = useState(null);
  const [difficulty, setDifficulty] = useState(null);

  const [loadingModeration, setLoadingModeration] = useState(false);
  const [loadingAnomalies, setLoadingAnomalies] = useState(false);
  const [loadingDifficulty, setLoadingDifficulty] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/departments')
      .then((r) => r.json())
      .then((d) => setDepartments(d.departments || []))
      .catch(console.error);
  }, []);

  const fetchAll = useCallback(async () => {
    const params = { departmentId, semester };

    setLoadingModeration(true);
    setLoadingAnomalies(true);
    setLoadingDifficulty(true);

    try {
      const [mod, anom, diff] = await Promise.allSettled([
        getFacultyModeration(params),
        getFacultyAnomalies(params),
        getSubjectDifficulty(params),
      ]);

      if (mod.status === 'fulfilled') setModeration(mod.value);
      else toast.error('Moderation data unavailable');

      if (anom.status === 'fulfilled') setAnomalies(anom.value);
      else toast.error('Anomaly data unavailable');

      if (diff.status === 'fulfilled') setDifficulty(diff.value);
      else toast.error('Difficulty data unavailable');
    } finally {
      setLoadingModeration(false);
      setLoadingAnomalies(false);
      setLoadingDifficulty(false);
    }
  }, [departmentId, semester]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const TAB_LIST = [
    { id: 'moderation', label: 'Moderation', icon: Shield },
    { id: 'anomalies', label: 'Anomalies', icon: AlertTriangle },
    { id: 'difficulty', label: 'Difficulty', icon: BarChart3 },
    { id: 'heatmap', label: 'Heatmap', icon: Eye },
  ];

  const currentDeptName = departments.find((d) => d.id === departmentId)?.name || '';

  return (
    <div className="text-white">
      {/* ── HEADER ── */}
      <motion.div {...fadeUp(0)} className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.25em] text-indigo-400">
            Faculty · AI Academic Assistant
          </p>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            AI{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Moderation
            </span>{' '}
            Suite
          </h1>
          <p className="mt-2 text-slate-400">Smart mark analysis, anomaly detection, and moderation recommendations.</p>
        </div>

        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={fetchAll}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-800 px-4 py-2.5 text-sm font-semibold transition hover:border-indigo-500/40"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setReportModalOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-indigo-500/40 bg-indigo-500/20 px-4 py-2.5 text-sm font-semibold text-indigo-300 transition hover:bg-indigo-500/30"
          >
            <FileDown className="h-4 w-4" />
            AI Report
          </motion.button>
        </div>
      </motion.div>

      {/* ── FILTERS ── */}
      <motion.div {...fadeUp(0.05)}>
        <Panel className="mb-6 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <SlidersHorizontal className="h-4 w-4 text-slate-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Filters</span>
            <SelectBox value={departmentId} onChange={(e) => setDepartmentId(Number(e.target.value))}>
              {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </SelectBox>
            <SelectBox value={semester} onChange={(e) => setSemester(Number(e.target.value))}>
              {Array.from({ length: 8 }).map((_, i) => (
                <option key={i} value={i + 1}>Semester {i + 1}</option>
              ))}
            </SelectBox>
          </div>
        </Panel>
      </motion.div>

      {/* ── KPI CARDS ── */}
      <motion.div {...fadeUp(0.1)} className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AIMetricCard
          label="Moderation Needed"
          value={moderation?.summary?.moderationNeeded ?? 0}
          color="amber"
          icon={Shield}
          loading={loadingModeration}
          sub="Subjects requiring action"
          delay={0.1}
        />
        <AIMetricCard
          label="Urgent Cases"
          value={moderation?.summary?.urgentCases ?? 0}
          color="rose"
          icon={AlertTriangle}
          loading={loadingModeration}
          sub="Immediate attention required"
          delay={0.15}
        />
        <AIMetricCard
          label="Anomalies Detected"
          value={anomalies?.totalAnomalies ?? 0}
          color="purple"
          icon={Zap}
          loading={loadingAnomalies}
          sub={`${anomalies?.critical ?? 0} critical`}
          delay={0.2}
        />
        <AIMetricCard
          label="Total Subjects"
          value={moderation?.summary?.totalSubjects ?? 0}
          color="cyan"
          icon={BarChart3}
          loading={loadingModeration}
          sub="In this dept + semester"
          delay={0.25}
        />
      </motion.div>

      {/* ── TABS ── */}
      <motion.div {...fadeUp(0.15)} className="mb-4">
        <div className="flex flex-wrap gap-1 rounded-2xl border border-white/8 bg-slate-950/50 p-1">
          {TAB_LIST.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
                activeTab === id
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
              {id === 'anomalies' && anomalies?.critical > 0 && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white">
                  {anomalies.critical}
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
          {/* MODERATION TAB */}
          {activeTab === 'moderation' && (
            <Panel>
              <PanelHeader
                icon={Shield}
                title="Smart Moderation Analysis"
                sub="AI-recommended grace marks and subject intervention strategy"
                color="text-amber-400"
              />
              <div className="p-5">
                {moderation?.classFeedback && (
                  <div className="mb-4 rounded-2xl border border-indigo-500/20 bg-indigo-500/8 p-4">
                    <div className="flex items-start gap-2">
                      <Brain className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                      <p className="text-sm text-slate-300 leading-relaxed">{moderation.classFeedback}</p>
                    </div>
                  </div>
                )}
                <ModerationTable
                  candidates={moderation?.moderationCandidates}
                  loading={loadingModeration}
                />
              </div>
            </Panel>
          )}

          {/* ANOMALIES TAB */}
          {activeTab === 'anomalies' && (
            <Panel>
              <PanelHeader
                icon={AlertTriangle}
                title="Anomaly Detection Report"
                sub="Statistical outliers, duplicate marks, and distribution anomalies"
                color="text-rose-400"
                action={
                  anomalies && (
                    <div className="flex gap-2">
                      {anomalies.critical > 0 && <AIAlertBadge severity="critical" label={`${anomalies.critical} Critical`} />}
                      {anomalies.warning > 0 && <AIAlertBadge severity="warning" label={`${anomalies.warning} Warning`} />}
                      {anomalies.info > 0 && <AIAlertBadge severity="info" label={`${anomalies.info} Info`} />}
                    </div>
                  )
                }
              />
              <div className="p-5">
                <AnomalyList
                  anomalies={anomalies?.anomalies}
                  loading={loadingAnomalies}
                />
              </div>
            </Panel>
          )}

          {/* DIFFICULTY TAB */}
          {activeTab === 'difficulty' && (
            <Panel>
              <PanelHeader
                icon={BarChart3}
                title="Subject Difficulty Analysis"
                sub="Ranked by difficulty score — identify and address hard subjects"
                color="text-purple-400"
              />
              <div className="p-5">
                <DifficultyChart
                  data={difficulty?.subjectDifficulty}
                  loading={loadingDifficulty}
                />
              </div>
            </Panel>
          )}

          {/* HEATMAP TAB */}
          {activeTab === 'heatmap' && (
            <Panel>
              <PanelHeader
                icon={Eye}
                title="Subject Performance Heatmap"
                sub="Color-coded performance map — red = hardest, green = easiest"
                color="text-cyan-400"
              />
              <div className="p-5">
                <SubjectHeatmap
                  data={difficulty?.subjectDifficulty?.map((d) => ({
                    code: d.code,
                    name: d.name,
                    avg_percentage: d.avg_percentage,
                    pass_rate: 100 - Number(d.fail_rate),
                    failure_count: d.fail_count,
                    heatScore: 100 - Number(d.difficultyScore),
                    difficultyLabel: d.difficultyLabel,
                  })) || []}
                  loading={loadingDifficulty}
                  height={340}
                />
              </div>
            </Panel>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── REPORT MODAL ── */}
      <SmartReportModal
        open={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        departmentId={departmentId}
        semester={semester}
        departmentName={currentDeptName}
      />
    </div>
  );
}
