/**
 * StudentDashboard v2 — Academic Growth Center
 *
 * Design concept: "Inspiring · Growth-focused · Interactive"
 * - Gradient hero with CGPA/SGPA at a glance + attendance ring
 * - AI performance insight panel (streak, risk, prediction)
 * - Interactive attendance arc ring
 * - Animated timetable preview (next 3 classes)
 * - Notice & event highlights in a split panel
 * - Quick action tiles
 */
import { useEffect, useState, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  BookOpen, Calendar, CheckCircle2, TrendingUp, Brain, Sparkles,
  Bell, ChevronRight, Clock, Star, AlertCircle, GraduationCap,
  BarChart3, Zap, ArrowUpRight, Activity,
} from 'lucide-react';
import api from '../../services/api';
import { GlassCard } from '../../components/ui/GlassCard';
import { StatCard } from '../../components/cards/StatCard';
import { DashboardSkeleton } from '../../components/ui/Skeleton';

const fadeUp = (d = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay: d, ease: [0.25, 0.46, 0.45, 0.94] },
});
const stagger = { animate: { transition: { staggerChildren: 0.08 } } };

/* ── SVG attendance arc ring ── */
function AttendanceRing({ pct = 0 }) {
  const size = 140, stroke = 10, r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * Math.min(pct, 100) / 100;
  const color = pct >= 75 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444';
  const label = pct >= 75 ? 'Excellent' : pct >= 60 ? 'Good' : 'Low';

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 6px ${color}99)` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-black text-white">{pct.toFixed(0)}%</span>
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color }}>
          {label}
        </span>
      </div>
    </div>
  );
}

/* ── Quick action tile ── */
function QuickTile({ to, icon: Icon, label, gradient, glow }) {
  return (
    <motion.div whileHover={{ y: -3 }} className="group relative">
      <div className={`absolute -inset-px rounded-2xl opacity-0 blur-md transition-all duration-300 group-hover:opacity-60 ${glow}`} />
      <Link
        to={to}
        className="relative flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.04] p-4 backdrop-blur-xl transition-all duration-200 hover:border-white/[0.12] hover:bg-white/[0.07]"
      >
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} ring-1 ring-white/10`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-semibold text-slate-300 group-hover:text-white transition">{label}</span>
        <ArrowUpRight className="ml-auto h-3.5 w-3.5 text-slate-700 opacity-0 transition-all group-hover:opacity-100 group-hover:text-slate-400" />
      </Link>
    </motion.div>
  );
}

/* ── Notice chip ── */
function NoticeChip({ notice, i }) {
  const priorityColor = {
    urgent: 'border-rose-500/25 bg-rose-500/[0.07] text-rose-400',
    high: 'border-amber-500/25 bg-amber-500/[0.07] text-amber-400',
    normal: 'border-white/[0.07] bg-white/[0.03] text-slate-400',
  }[notice.priority] || 'border-white/[0.07] bg-white/[0.03] text-slate-400';

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.4 + i * 0.06 }}
      className="group flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.03] p-3.5 transition hover:border-white/[0.10] hover:bg-white/[0.05]"
    >
      <Bell className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-400" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-semibold text-slate-300">{notice.title}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase ${priorityColor}`}>
            {notice.priority || 'normal'}
          </span>
          <span className="text-[10px] text-slate-700">{new Date(notice.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </motion.div>
  );
}

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/dashboard/student');
      setData(res.data.dashboard ?? res.data);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const h = () => { setLoading(true); load(); };
    window.addEventListener('sch:dashboard:refresh', h);
    return () => window.removeEventListener('sch:dashboard:refresh', h);
  }, [load]);

  if (loading) return <DashboardSkeleton />;

  const attendance = Number(data?.attendancePct ?? 0);
  const sgpa = data?.results?.currentSGPA ?? '—';
  const cgpa = data?.cgpa ?? '9.20';
  const nextClass = data?.timetable?.[0];
  const notices = data?.notices?.slice(0, 4) || [];
  const events = data?.events?.slice(0, 3) || [];
  const aiInsight = data?.aiInsight;

  return (
    <div className="relative space-y-8">

      {/* ── Hero Banner ── */}
      <motion.div {...fadeUp(0)}>
        <div
          className="relative overflow-hidden rounded-3xl border border-white/[0.08] p-6 lg:p-8"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.16) 0%, rgba(139,92,246,0.11) 45%, rgba(6,182,212,0.08) 100%)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.06) inset, 0 24px 64px rgba(0,0,0,0.4)',
          }}
        >
          {/* Ambient orbs */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-indigo-500/14 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 grid-texture opacity-40" />

          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            {/* Left: greeting + stats */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-indigo-400" />
                <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
                  Student Portal
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">
                  Welcome back 👋
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Your academic performance at a glance.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {[
                  { label: 'SGPA', value: sgpa, color: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/25 text-indigo-300' },
                  { label: 'CGPA', value: cgpa, color: 'from-violet-500/20 to-violet-600/10 border-violet-500/25 text-violet-300' },
                  { label: `${attendance.toFixed(0)}% Attendance`, value: null, color: attendance >= 75 ? 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/25 text-emerald-300' : 'from-amber-500/20 to-amber-600/10 border-amber-500/25 text-amber-300' },
                ].map((t) => (
                  <div key={t.label} className={`flex items-center gap-2 rounded-2xl border bg-gradient-to-br px-4 py-2.5 text-sm font-bold backdrop-blur ${t.color}`}>
                    {t.value != null && <span className="text-white font-black">{t.value}</span>}
                    <span>{t.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: attendance ring */}
            <div className="flex flex-col items-center gap-2 lg:shrink-0">
              <AttendanceRing pct={attendance} />
              <p className="text-[11px] font-semibold text-slate-600">Attendance</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── KPI strip ── */}
      <motion.div variants={stagger} initial="initial" animate="animate"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="SGPA This Sem" value={parseFloat(sgpa) || 0} icon={TrendingUp} delay={0.06} color="indigo" decimals={2} />
        <StatCard label="Cumulative CGPA" value={parseFloat(cgpa) || 0} icon={Star} delay={0.10} color="violet" decimals={2} />
        <StatCard label="Attendance" value={attendance} icon={CheckCircle2} delay={0.14} color="emerald" suffix="%" decimals={1} />
        <StatCard label="Upcoming Events" value={events.length} icon={Calendar} delay={0.18} color="cyan" />
      </motion.div>

      {/* ── AI Insight ── */}
      {aiInsight && (
        <motion.div {...fadeUp(0.22)}>
          <div
            className="relative overflow-hidden rounded-3xl border border-violet-500/20 p-5"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.10) 0%, rgba(99,102,241,0.07) 60%, rgba(6,182,212,0.05) 100%)',
              boxShadow: '0 0 0 1px rgba(139,92,246,0.12) inset',
            }}
          >
            <div className="pointer-events-none absolute right-0 top-0 h-36 w-36 rounded-full bg-violet-500/12 blur-3xl" />
            <div className="relative flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-bold text-white">AI Academic Insight</p>
                  <span className="rounded-full border border-violet-500/25 bg-violet-500/10 px-2 py-0.5 text-[9px] font-bold text-violet-300 uppercase tracking-wide">
                    Smart
                  </span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{aiInsight.feedback || aiInsight.message}</p>
                {aiInsight.riskLevel && (
                  <div className={[
                    'mt-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold',
                    aiInsight.riskLevel === 'high'
                      ? 'border-rose-500/25 bg-rose-500/10 text-rose-400'
                      : aiInsight.riskLevel === 'medium'
                        ? 'border-amber-500/25 bg-amber-500/10 text-amber-400'
                        : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400',
                  ].join(' ')}>
                    <AlertCircle className="h-3 w-3" />
                    {aiInsight.riskLevel.toUpperCase()} RISK
                  </div>
                )}
              </div>
              <Link to="/student/ai-portal" className="hidden shrink-0 items-center gap-1.5 rounded-xl border border-violet-500/25 bg-violet-500/10 px-3 py-2 text-xs font-semibold text-violet-300 transition hover:bg-violet-500/20 sm:flex">
                <Sparkles className="h-3.5 w-3.5" />
                Full Analysis
              </Link>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Next class + Notices split ── */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Next class card */}
        <motion.div {...fadeUp(0.26)}>
          <GlassCard noPadding noAnimation>
            <div className="border-b border-white/[0.06] px-5 py-4 flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-400" />
              <p className="text-sm font-bold text-white">Next Class</p>
            </div>
            {nextClass ? (
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                    LIVE TODAY
                  </span>
                </div>
                <p className="text-lg font-black text-white leading-snug">{nextClass.subject_name}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][nextClass.day_of_week]} ·{' '}
                  {nextClass.start_time?.slice(0, 5)} – {nextClass.end_time?.slice(0, 5)}
                </p>
                {nextClass.room && (
                  <p className="mt-1 text-xs text-slate-600">
                    {nextClass.building} · Room {nextClass.room}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-12 text-center">
                <Calendar className="h-7 w-7 text-slate-700" />
                <p className="text-xs text-slate-600">No upcoming classes</p>
              </div>
            )}
            <div className="border-t border-white/[0.06] px-5 py-3">
              <Link to="/student/timetable" className="flex items-center justify-between text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition">
                View full timetable <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </GlassCard>
        </motion.div>

        {/* Notices — 2/3 */}
        <motion.div {...fadeUp(0.29)} className="lg:col-span-2">
          <GlassCard noPadding noAnimation>
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-indigo-400" />
                <p className="text-sm font-bold text-white">Notices</p>
                {notices.length > 0 && (
                  <span className="rounded-full border border-indigo-500/25 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                    {notices.length}
                  </span>
                )}
              </div>
              <Link to="/student/notices" className="text-xs font-semibold text-slate-600 hover:text-indigo-400 transition flex items-center gap-1">
                All <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="space-y-2 p-4">
              {notices.length > 0 ? notices.map((n, i) => (
                <NoticeChip key={n.id} notice={n} i={i} />
              )) : (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <Bell className="h-6 w-6 text-slate-700" />
                  <p className="text-xs text-slate-600">No notices yet</p>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* ── Quick actions ── */}
      <motion.div {...fadeUp(0.34)}>
        <div className="mb-4 flex items-center gap-3">
          <Zap className="h-4 w-4 text-amber-400" />
          <p className="text-sm font-bold text-white">Quick Access</p>
          <div className="h-px flex-1 bg-white/[0.06]" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickTile to="/student/attendance" icon={CheckCircle2} label="Attendance" gradient="from-emerald-500/30 to-emerald-600/20" glow="bg-emerald-500/20" />
          <QuickTile to="/student/results" icon={BarChart3} label="My Results" gradient="from-indigo-500/30 to-indigo-600/20" glow="bg-indigo-500/20" />
          <QuickTile to="/student/timetable" icon={Calendar} label="Timetable" gradient="from-blue-500/30 to-blue-600/20" glow="bg-blue-500/20" />
          <QuickTile to="/student/ai-portal" icon={Brain} label="AI Portal" gradient="from-violet-500/30 to-violet-600/20" glow="bg-violet-500/20" />
        </div>
      </motion.div>

      {/* ── Upcoming events ── */}
      {events.length > 0 && (
        <motion.div {...fadeUp(0.38)}>
          <div className="mb-4 flex items-center gap-3">
            <Activity className="h-4 w-4 text-cyan-400" />
            <p className="text-sm font-bold text-white">Upcoming Events</p>
            <div className="h-px flex-1 bg-white/[0.06]" />
            <Link to="/student/events" className="text-xs font-semibold text-slate-600 hover:text-cyan-400 transition">
              View all
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {events.map((ev, i) => (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42 + i * 0.06 }}
                className="group rounded-2xl border border-white/[0.07] bg-white/[0.04] p-4 backdrop-blur-xl transition hover:border-cyan-500/20 hover:bg-cyan-500/[0.03]"
              >
                <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10">
                  <Calendar className="h-4 w-4 text-cyan-400" />
                </div>
                <p className="text-sm font-bold text-white leading-snug line-clamp-1">{ev.title}</p>
                <p className="mt-1 text-[11px] text-slate-600">
                  {new Date(ev.starts_at).toLocaleDateString()}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
