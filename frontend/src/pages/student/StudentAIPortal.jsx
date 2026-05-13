/**
 * StudentAIPortal — AI-Powered Student Academic Intelligence Portal
 * Route: /student/ai-results
 *
 * Sections:
 *   1. Hero banner — CGPA, risk level, AI tier, predictive SGPA
 *   2. AI Feedback — personalized academic summary
 *   3. Performance Prediction — pass probability + trend
 *   4. SGPA/CGPA timeline chart
 *   5. Subject Strength Radar
 *   6. Personalized AI Recommendations
 *   7. Weak / Strong subject lists
 */

import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Brain, TrendingUp, TrendingDown, Target, Award, Sparkles,
  BookOpen, AlertTriangle, ChevronRight, BarChart3, Radar,
  Zap, GraduationCap, Activity,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Area, AreaChart, ReferenceLine,
} from 'recharts';
import { getStudentAIInsights } from '../../services/aiAnalyticsApi';
import { AIInsightPanel } from '../../components/ai/AIInsightPanel';
import { AIMetricCard } from '../../components/ai/AIMetricCard';
import { PerformanceRadar } from '../../components/ai/PerformanceRadar';
import { AIDashboardSkeleton } from '../../components/ai/AISkeletonLoader';

/* ------------------------------------------------------------------ */
/* HELPERS                                                             */
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

function SectionHeader({ icon: Icon, title, sub, color = 'text-indigo-400' }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800/80 border border-white/10">
        <Icon className={`h-4.5 w-4.5 ${color}`} />
      </div>
      <div>
        <h2 className="text-base font-bold text-white">{title}</h2>
        {sub && <p className="text-xs text-slate-500">{sub}</p>}
      </div>
    </div>
  );
}

const TIER_CONFIG = {
  Distinction: { color: 'text-amber-300', bg: 'bg-amber-500/15', border: 'border-amber-500/30', glow: 'shadow-amber-500/20' },
  'First Class': { color: 'text-indigo-300', bg: 'bg-indigo-500/15', border: 'border-indigo-500/30', glow: 'shadow-indigo-500/20' },
  'Second Class': { color: 'text-cyan-300', bg: 'bg-cyan-500/15', border: 'border-cyan-500/30', glow: 'shadow-cyan-500/20' },
  Pass: { color: 'text-emerald-300', bg: 'bg-emerald-500/15', border: 'border-emerald-500/30', glow: 'shadow-emerald-500/20' },
  'At Risk': { color: 'text-rose-300', bg: 'bg-rose-500/15', border: 'border-rose-500/30', glow: 'shadow-rose-500/20' },
  'N/A': { color: 'text-slate-400', bg: 'bg-slate-800/50', border: 'border-white/10', glow: '' },
};

function CustomLineTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/95 p-3 text-xs shadow-2xl backdrop-blur-xl">
      <p className="mb-1 font-bold text-slate-300">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
          {p.name}: {Number(p.value).toFixed(2)}
        </p>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* MAIN COMPONENT                                                       */
/* ------------------------------------------------------------------ */

export default function StudentAIPortal() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getStudentAIInsights()
      .then((d) => { setData(d); setLoading(false); })
      .catch((e) => {
        setError(e?.response?.data?.message || 'Failed to load AI insights.');
        setLoading(false);
      });
  }, []);

  // Derived data
  const trendData = useMemo(() => {
    if (!data?.cgpaHistory) return [];
    return data.cgpaHistory.map((s) => ({
      semester: `Sem ${s.semester}`,
      SGPA: Number(s.sgpa),
      CGPA: Number(s.cgpa),
    }));
  }, [data]);

  const radarData = useMemo(() => {
    if (!data?.weakSubjects && !data?.strongSubjects) return [];
    const all = [...(data.weakSubjects || []), ...(data.strongSubjects || [])];
    return all.slice(0, 8).map((s) => ({
      subject: s.code,
      marks: Number(s.percentage),
    }));
  }, [data]);

  const tierCfg = TIER_CONFIG[data?.performanceTier] || TIER_CONFIG['N/A'];
  const prediction = data?.prediction;
  const passFail = data?.passFail;
  const latestCgpa = data?.cgpaHistory?.length
    ? Number(data.cgpaHistory[data.cgpaHistory.length - 1].cgpa)
    : 0;
  const latestSgpa = data?.cgpaHistory?.length
    ? Number(data.cgpaHistory[data.cgpaHistory.length - 1].sgpa)
    : 0;

  if (loading) {
    return (
      <div className="text-white">
        <AIDashboardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center">
        <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-8 text-center max-w-md">
          <AlertTriangle className="mx-auto mb-3 h-10 w-10 text-rose-400" />
          <p className="text-white font-bold mb-1">Could not load AI insights</p>
          <p className="text-rose-300 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white">
      {/* ── HEADER ── */}
      <motion.div {...fadeUp(0)} className="mb-8">
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.25em] text-indigo-400">
          Student · AI Academic Portal
        </p>
        <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
          AI{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Intelligence
          </span>{' '}
          Hub
        </h1>
        <p className="mt-2 text-slate-400">
          {data?.student?.first_name} {data?.student?.last_name} · {data?.student?.department_name}
        </p>
      </motion.div>

      {/* ── HERO TIER BANNER ── */}
      <motion.div {...fadeUp(0.05)} className="mb-6">
        <div className={`relative overflow-hidden rounded-3xl border p-6 shadow-2xl
          ${tierCfg.border} ${tierCfg.bg} ${tierCfg.glow}`}>
          {/* Animated background orbs */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-purple-500/10 blur-3xl" />

          <div className="relative flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${tierCfg.border} ${tierCfg.bg}`}>
                <Brain className={`h-7 w-7 ${tierCfg.color}`} />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">AI Performance Tier</p>
                <p className={`text-3xl font-black ${tierCfg.color}`}>{data?.performanceTier || 'N/A'}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              {[
                { label: 'CGPA', value: latestCgpa.toFixed(2), color: 'text-white' },
                { label: 'SGPA (Last)', value: latestSgpa.toFixed(2), color: 'text-indigo-300' },
                {
                  label: 'Predicted SGPA',
                  value: prediction?.predictedSgpa != null ? Number(prediction.predictedSgpa).toFixed(2) : '—',
                  color: prediction?.trend === 'improving' ? 'text-emerald-300' : prediction?.trend === 'declining' ? 'text-rose-300' : 'text-slate-300',
                },
                {
                  label: 'Pass Probability',
                  value: passFail?.probability != null ? `${passFail.probability}%` : '—',
                  color: Number(passFail?.probability) >= 60 ? 'text-emerald-300' : 'text-rose-300',
                },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{item.label}</p>
                  <p className={`text-2xl font-black ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* AI Summary */}
          {data?.aiFeedback && (
            <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3">
              <div className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                <p className="text-sm leading-relaxed text-slate-300">{data.aiFeedback}</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── KPI METRICS ── */}
      <motion.div {...fadeUp(0.1)} className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AIMetricCard
          label="CGPA"
          value={latestCgpa}
          color="indigo"
          icon={GraduationCap}
          trend={prediction?.trend}
          sub="Cumulative Grade Point"
          decimals={2}
          delay={0.1}
        />
        <AIMetricCard
          label="Predicted SGPA"
          value={prediction?.predictedSgpa ?? 0}
          color="cyan"
          icon={Target}
          trend={prediction?.trend}
          sub={`Confidence: ${prediction?.confidence ?? 0}%`}
          decimals={2}
          delay={0.15}
        />
        <AIMetricCard
          label="Pass Probability"
          value={passFail?.probability ?? 0}
          suffix="%"
          color={Number(passFail?.probability) >= 60 ? 'emerald' : 'rose'}
          icon={Activity}
          sub={passFail?.prediction ?? '—'}
          delay={0.2}
        />
        <AIMetricCard
          label="Rank (Dept)"
          value={data?.rankData?.rank ?? '—'}
          suffix={data?.rankData?.rank ? `/${data?.rankData?.totalStudents}` : ''}
          color="amber"
          icon={Award}
          sub={data?.rankData?.percentile != null ? `Top ${100 - data.rankData.percentile}%` : '—'}
          delay={0.25}
        />
      </motion.div>

      {/* ── TREND CHARTS ── */}
      <motion.div {...fadeUp(0.15)} className="mb-6 grid gap-5 lg:grid-cols-2">
        {/* SGPA/CGPA Timeline */}
        <Panel className="p-5">
          <SectionHeader icon={BarChart3} title="Academic Growth Timeline" sub="SGPA & CGPA across semesters" />
          {trendData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sgpaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="cgpaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="semester" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 10]} tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomLineTooltip />} />
                  <ReferenceLine y={7.5} stroke="#6366f1" strokeDasharray="4 4" strokeOpacity={0.4} label={{ value: 'First Class', fill: '#6366f1', fontSize: 9 }} />
                  <Area type="monotone" dataKey="SGPA" stroke="#6366f1" strokeWidth={2.5} fill="url(#sgpaGrad)" dot={{ fill: '#6366f1', r: 4, strokeWidth: 0 }} activeDot={{ r: 6, fill: '#a5b4fc' }} />
                  <Area type="monotone" dataKey="CGPA" stroke="#06b6d4" strokeWidth={2} fill="url(#cgpaGrad)" dot={{ fill: '#06b6d4', r: 3, strokeWidth: 0 }} activeDot={{ r: 5, fill: '#67e8f9' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center">
              <p className="text-sm text-slate-500">No semester data available yet</p>
            </div>
          )}
        </Panel>

        {/* Subject Strength Radar */}
        <Panel className="p-5">
          <SectionHeader icon={Radar} title="Subject Strength Radar" sub="Performance across subjects" color="text-purple-400" />
          <PerformanceRadar data={radarData} height={240} showBenchmark />
        </Panel>
      </motion.div>

      {/* ── AI RECOMMENDATIONS ── */}
      {data?.recommendations?.length > 0 && (
        <motion.div {...fadeUp(0.2)} className="mb-6">
          <Panel className="p-5">
            <SectionHeader icon={Brain} title="AI Academic Recommendations" sub="Personalized insights for your improvement" color="text-indigo-400" />
            <div className="grid gap-3 sm:grid-cols-2">
              {data.recommendations.map((rec, i) => (
                <AIInsightPanel
                  key={i}
                  title={rec.title}
                  description={rec.description}
                  priority={rec.priority}
                  icon={rec.icon}
                  category={rec.category}
                  delay={i * 0.05}
                />
              ))}
            </div>
          </Panel>
        </motion.div>
      )}

      {/* ── WEAK & STRONG SUBJECTS ── */}
      <motion.div {...fadeUp(0.25)} className="mb-6 grid gap-5 lg:grid-cols-2">
        {/* Weak Subjects */}
        {data?.weakSubjects?.length > 0 && (
          <Panel className="p-5">
            <SectionHeader icon={AlertTriangle} title="Areas Needing Focus" sub="Subjects below 50%" color="text-rose-400" />
            <div className="space-y-2">
              {data.weakSubjects.map((s, i) => (
                <motion.div
                  key={s.code}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/8 px-4 py-3"
                >
                  <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-rose-500/20 shrink-0">
                    <BookOpen className="h-4 w-4 text-rose-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">{s.name}</p>
                    <p className="text-xs text-slate-500">{s.code}</p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-rose-500/20 px-2.5 py-1 text-xs font-bold text-rose-300">
                    {Number(s.percentage).toFixed(1)}%
                  </span>
                </motion.div>
              ))}
            </div>
          </Panel>
        )}

        {/* Strong Subjects */}
        {data?.strongSubjects?.length > 0 && (
          <Panel className="p-5">
            <SectionHeader icon={Award} title="Your Academic Strengths" sub="Subjects above 80%" color="text-emerald-400" />
            <div className="space-y-2">
              {data.strongSubjects.map((s, i) => (
                <motion.div
                  key={s.code}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-4 py-3"
                >
                  <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-emerald-500/20 shrink-0">
                    <Zap className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate">{s.name}</p>
                    <p className="text-xs text-slate-500">{s.code}</p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs font-bold text-emerald-300">
                    {Number(s.percentage).toFixed(1)}%
                  </span>
                </motion.div>
              ))}
            </div>
          </Panel>
        )}
      </motion.div>

      {/* ── PREDICTION CONFIDENCE ── */}
      {prediction?.historicalSemesters > 0 && (
        <motion.div {...fadeUp(0.3)} className="mb-6">
          <Panel className="p-5">
            <SectionHeader icon={Sparkles} title="AI Prediction Insights" sub="Statistical accuracy metrics" color="text-cyan-400" />
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/8 bg-slate-950/50 p-4 text-center">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Model Confidence</p>
                <p className="text-3xl font-black text-cyan-300">{prediction.confidence}%</p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-slate-950/50 p-4 text-center">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Trend</p>
                <p className={`text-xl font-black capitalize ${prediction.trend === 'improving' ? 'text-emerald-300' : prediction.trend === 'declining' ? 'text-rose-300' : 'text-slate-300'}`}>
                  {prediction.trend}
                </p>
              </div>
              <div className="rounded-2xl border border-white/8 bg-slate-950/50 p-4 text-center">
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Semesters Analyzed</p>
                <p className="text-3xl font-black text-white">{prediction.historicalSemesters}</p>
              </div>
            </div>
          </Panel>
        </motion.div>
      )}
    </div>
  );
}
