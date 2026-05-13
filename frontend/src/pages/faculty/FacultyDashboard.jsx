/**
 * FacultyDashboard v2 — Professional Productivity Hub
 *
 * Design concept: "Professional · Organized · Intelligent"
 * - Teaching metrics hero strip
 * - Today's schedule as a visual timeline
 * - Student performance snapshot
 * - Recent attendance summary
 * - Moderation alert panel
 * - Quick action grid
 */
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  Users, Clock, CheckSquare, Bell, BookOpen, BarChart3,
  ChevronRight, TrendingUp, Zap, Brain, ArrowUpRight,
  Layers, Calendar, AlertTriangle, Sparkles, Activity,
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
const stagger = { animate: { transition: { staggerChildren: 0.07 } } };

const DAY_LABELS = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/* ── Schedule timeline slot ── */
function ScheduleSlot({ slot, i, isNow }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 + i * 0.07 }}
      className={[
        'group flex items-center gap-4 rounded-2xl border p-3.5 transition-all duration-200',
        isNow
          ? 'border-emerald-500/25 bg-emerald-500/[0.06]'
          : 'border-white/[0.06] bg-white/[0.03] hover:border-white/[0.10] hover:bg-white/[0.05]',
      ].join(' ')}
    >
      {/* Time column */}
      <div className="w-14 shrink-0 text-center">
        <p className={`text-xs font-bold ${isNow ? 'text-emerald-400' : 'text-slate-500'}`}>
          {slot.start_time?.slice(0, 5)}
        </p>
        <div className="mx-auto mt-1 h-3 w-px bg-white/10" />
        <p className="text-[10px] text-slate-700">{slot.end_time?.slice(0, 5)}</p>
      </div>

      {/* Subject block */}
      <div className="flex flex-1 items-center gap-3 min-w-0">
        <div className={[
          'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1',
          isNow
            ? 'bg-emerald-500/15 ring-emerald-500/25'
            : 'bg-indigo-500/10 ring-indigo-500/20',
        ].join(' ')}>
          <BookOpen className={`h-4 w-4 ${isNow ? 'text-emerald-400' : 'text-indigo-400'}`} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-white">{slot.subject_name}</p>
          <p className="text-[11px] text-slate-600">
            {DAY_LABELS[slot.day_of_week]} · Sem {slot.semester} · §{slot.section}
          </p>
        </div>
      </div>

      {/* Live badge */}
      {isNow && (
        <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400 shrink-0">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          NOW
        </span>
      )}
    </motion.div>
  );
}

/* ── Quick tile ── */
function QuickTile({ to, icon: Icon, label, desc, gradient, glow }) {
  return (
    <motion.div whileHover={{ y: -3 }} className="group relative">
      <div className={`absolute -inset-px rounded-2xl opacity-0 blur-md transition-all duration-300 group-hover:opacity-60 ${glow}`} />
      <Link
        to={to}
        className="relative flex flex-col gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.04] p-4 backdrop-blur-xl transition-all hover:border-white/[0.12] hover:bg-white/[0.07]"
      >
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ring-1 ring-white/10 ${gradient}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">{label}</p>
          <p className="text-[11px] text-slate-600 mt-0.5">{desc}</p>
        </div>
        <ArrowUpRight className="absolute right-3 top-3 h-3.5 w-3.5 text-slate-700 opacity-0 transition group-hover:opacity-100 group-hover:text-slate-400" />
      </Link>
    </motion.div>
  );
}

export default function FacultyDashboard() {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/api/dashboard/faculty');
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

  const schedule  = data?.todaySchedule ?? data?.timetable ?? [];
  const statsData = data?.stats ?? {};
  const notices   = data?.recentNotices?.slice(0, 3) ?? [];
  const aiInsight = data?.aiInsight;
  const now = new Date();
  const currentHour = now.getHours();

  // Determine "live" slot (rough match by hour)
  function isLiveSlot(slot) {
    const start = parseInt(slot.start_time?.slice(0, 2) || '99');
    const end   = parseInt(slot.end_time?.slice(0, 2)   || '0');
    return currentHour >= start && currentHour < end;
  }

  return (
    <div className="relative space-y-8">

      {/* ── Hero ── */}
      <motion.div {...fadeUp(0)}>
        <div
          className="relative overflow-hidden rounded-3xl border border-white/[0.08] p-6 lg:p-7"
          style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.14) 0%, rgba(99,102,241,0.10) 50%, rgba(6,182,212,0.07) 100%)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.06) inset, 0 24px 64px rgba(0,0,0,0.4)',
          }}
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-blue-500/12 blur-3xl" />
          <div className="pointer-events-none absolute bottom-0 right-1/4 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 grid-texture opacity-40" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <Layers className="h-4 w-4 text-blue-400" />
              <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-500">
                Faculty Portal
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Teaching Dashboard</h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Your schedule, attendance, and student performance — all in one place.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              {[
                { label: `${statsData.totalClasses ?? 0} Total Classes`, color: 'from-blue-500/20 to-blue-600/10 border-blue-500/25 text-blue-300' },
                { label: `${statsData.studentsCount ?? 0} Students`, color: 'from-indigo-500/20 to-indigo-600/10 border-indigo-500/25 text-indigo-300' },
                { label: `${statsData.attendanceMarked ?? 0} Records`, color: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/25 text-cyan-300' },
              ].map((t) => (
                <div key={t.label} className={`flex items-center rounded-2xl border bg-gradient-to-br px-4 py-2.5 text-sm font-bold backdrop-blur ${t.color}`}>
                  {t.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── KPI strip ── */}
      <motion.div variants={stagger} initial="initial" animate="animate"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Classes"       value={statsData.totalClasses    ?? 0} icon={Layers}        delay={0.06} color="blue" />
        <StatCard label="Students Taught"     value={statsData.studentsCount   ?? 0} icon={Users}         delay={0.10} color="indigo" />
        <StatCard label="Attendance Sessions" value={statsData.attendanceMarked ?? 0} icon={CheckSquare}   delay={0.14} color="cyan" />
        <StatCard label="Notices Published"   value={statsData.noticesCount    ?? 0} icon={Bell}          delay={0.18} color="violet" />
      </motion.div>

      {/* ── Schedule + Insight ── */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Today's schedule — 2/3 */}
        <motion.div {...fadeUp(0.22)} className="lg:col-span-2">
          <GlassCard noPadding noAnimation>
            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-400" />
                <p className="text-sm font-bold text-white">Teaching Schedule</p>
              </div>
              <Link to="/faculty/timetable" className="text-xs font-semibold text-slate-600 hover:text-blue-400 transition flex items-center gap-1">
                Manage <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="space-y-2 p-4">
              {schedule.length > 0 ? (
                schedule.slice(0, 5).map((slot, i) => (
                  <ScheduleSlot key={slot.id} slot={slot} i={i} isNow={isLiveSlot(slot)} />
                ))
              ) : (
                <div className="flex flex-col items-center gap-2 py-12 text-center">
                  <Calendar className="h-7 w-7 text-slate-700" />
                  <p className="text-sm font-semibold text-slate-500">No classes scheduled</p>
                  <Link to="/faculty/timetable" className="text-xs text-indigo-400 hover:text-indigo-300 transition">
                    Add your first slot →
                  </Link>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* AI Insight — 1/3 */}
        <motion.div {...fadeUp(0.26)} className="space-y-4">
          {/* AI moderation insight */}
          <div
            className="relative overflow-hidden rounded-2xl border border-violet-500/20 p-4"
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.10) 0%, rgba(99,102,241,0.07) 100%)',
              boxShadow: '0 0 0 1px rgba(139,92,246,0.12) inset',
            }}
          >
            <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-violet-500/12 blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <p className="text-sm font-bold text-white">AI Insight</p>
              </div>
              {aiInsight ? (
                <p className="text-xs text-slate-400 leading-relaxed">{aiInsight.feedback || aiInsight.message || 'No insights yet.'}</p>
              ) : (
                <p className="text-xs text-slate-600">AI analytics loading…</p>
              )}
              <Link to="/faculty/ai-assistant" className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300 transition">
                <Sparkles className="h-3.5 w-3.5" />
                Open AI Assistant
              </Link>
            </div>
          </div>

          {/* Recent notices */}
          <GlassCard noPadding noAnimation>
            <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3.5">
              <div className="flex items-center gap-2">
                <Bell className="h-3.5 w-3.5 text-indigo-400" />
                <p className="text-xs font-bold text-white">Recent Notices</p>
              </div>
              <Link to="/faculty/notices" className="text-[10px] font-semibold text-slate-600 hover:text-indigo-400 transition">
                All →
              </Link>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {notices.length > 0 ? notices.map((n, i) => (
                <div key={n.id} className="flex items-start gap-3 px-4 py-3 transition hover:bg-white/[0.03]">
                  <div className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400 shadow-[0_0_4px_rgba(99,102,241,0.8)]" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-slate-300">{n.title}</p>
                    <p className="mt-0.5 text-[10px] text-slate-700">
                      {new Date(n.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="py-8 text-center">
                  <p className="text-[11px] text-slate-600">No notices yet</p>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* ── Quick Actions ── */}
      <motion.div {...fadeUp(0.30)}>
        <div className="mb-4 flex items-center gap-3">
          <Zap className="h-4 w-4 text-amber-400" />
          <p className="text-sm font-bold text-white">Quick Actions</p>
          <div className="h-px flex-1 bg-white/[0.06]" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <QuickTile to="/faculty/attendance" icon={CheckSquare}  label="Mark Attendance" desc="Record today's session"    gradient="from-emerald-500/30 to-emerald-600/20" glow="bg-emerald-500/20" />
          <QuickTile to="/faculty/results"    icon={BarChart3}    label="Manage Results"  desc="Upload & review grades"    gradient="from-indigo-500/30 to-indigo-600/20"   glow="bg-indigo-500/20" />
          <QuickTile to="/faculty/notices"    icon={Bell}         label="Post Notice"     desc="Broadcast announcements"   gradient="from-violet-500/30 to-violet-600/20"   glow="bg-violet-500/20" />
          <QuickTile to="/faculty/timetable"  icon={Calendar}     label="Timetable"       desc="Manage your schedule"      gradient="from-blue-500/30 to-blue-600/20"       glow="bg-blue-500/20" />
        </div>
      </motion.div>
    </div>
  );
}
