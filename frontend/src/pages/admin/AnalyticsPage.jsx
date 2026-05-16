import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  BarChart3,
  TrendingUp,
  Bell,
  Users,
  Activity,
  Calendar,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import api from '../../services/api';
import { GlassCard } from '../../components/ui/GlassCard';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

const Orb = ({ className }) => (
  <div className={`pointer-events-none absolute rounded-full blur-3xl ${className}`} />
);

const GridTexture = ({ color = '99,102,241' }) => (
  <div
    className="pointer-events-none absolute inset-0 opacity-[0.025]"
    style={{
      backgroundImage: `linear-gradient(rgba(${color},1) 1px, transparent 1px), linear-gradient(90deg, rgba(${color},1) 1px, transparent 1px)`,
      backgroundSize: '48px 48px',
    }}
  />
);

/* ── Shimmer skeleton ── */
const Shimmer = () => (
  <div className="space-y-5 p-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-800/50" />
    ))}
  </div>
);

/* ── Section panel wrapper ── */
const Panel = ({ children, delay = 0, glowColor = 'from-indigo-500/15 to-purple-500/10', className = '' }) => (
  <motion.div {...fadeUp(delay)} className={`group relative ${className}`}>
    <div className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-br ${glowColor} opacity-50 blur transition-opacity duration-500 group-hover:opacity-100`} />
    <div className="relative rounded-2xl border border-white/10 bg-slate-900/85 p-6 backdrop-blur-xl">
      {children}
    </div>
  </motion.div>
);

/* ── Panel header ── */
const PanelHeader = ({ icon: Icon, iconColor, title, subtitle, badge }) => (
  <div className="mb-5 flex items-start justify-between gap-3">
    <div className="flex items-center gap-3">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconColor} ring-1 ring-white/10`}>
        <Icon className="h-4.5 w-4.5 text-white" />
      </div>
      <div>
        <h2 className="text-sm font-bold text-white">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[11px] text-slate-500">{subtitle}</p>}
      </div>
    </div>
    {badge && (
      <span className="shrink-0 rounded-full border border-white/10 bg-slate-800/70 px-2.5 py-1 text-[10px] font-semibold text-slate-400">
        {badge}
      </span>
    )}
  </div>
);

/* ── Attendance bar row ── */
const AttBar = ({ dept, attended, total, maxTotal, index }) => {
  const pct = total > 0 ? Math.round((Number(attended) / Number(total)) * 100) : 0;
  const barW = total > 0 ? (Number(total) / maxTotal) * 100 : 0;
  const isGood = pct >= 75;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group/row rounded-xl border border-white/5 bg-slate-950/40 p-3 transition-all duration-200 hover:border-white/15 hover:bg-slate-800/40"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {isGood
            ? <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
            : <XCircle className="h-3.5 w-3.5 shrink-0 text-rose-400" />}
          <span className="truncate text-xs font-semibold text-slate-200">{dept}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isGood ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'}`}>
            {pct}%
          </span>
          <span className="text-[10px] text-slate-500">{attended}/{total}</span>
        </div>
      </div>
      <div className="mt-2.5 flex h-2 overflow-hidden rounded-full bg-slate-800">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${barW}%` }}
          transition={{ delay: index * 0.05 + 0.2, duration: 0.7, ease: 'easeOut' }}
          className="rounded-full bg-gradient-to-r from-teal-500 to-blue-500"
        />
      </div>
    </motion.div>
  );
};

/* ── Notice bar chart ── */
const NoticeBar = ({ n, max, index }) => {
  const h = max > 0 ? Math.max(6, (Number(n.cnt) / max) * 100) : 6;
  return (
    <motion.div
      initial={{ scaleY: 0, opacity: 0 }}
      animate={{ scaleY: 1, opacity: 1 }}
      transition={{ delay: index * 0.015, duration: 0.4, ease: 'easeOut' }}
      style={{ originY: 1 }}
      className="group/bar relative flex flex-1 flex-col items-center gap-1"
    >
      {/* Tooltip */}
      <div className="absolute bottom-full mb-1 hidden rounded-lg border border-white/15 bg-slate-900/95 px-2 py-1 text-[10px] font-semibold text-white shadow-xl backdrop-blur group-hover/bar:block whitespace-nowrap z-10">
        {String(n.day).slice(5)}: {n.cnt}
      </div>
      <div
        className="w-full rounded-t-sm bg-gradient-to-t from-purple-600 to-indigo-400/70 transition-all duration-200 group-hover/bar:from-purple-500 group-hover/bar:to-indigo-300"
        style={{ height: `${h}%` }}
      />
    </motion.div>
  );
};

/* ── Enrollment badge ── */
const EnrollBadge = ({ year, month, count, index }) => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const label = `${monthNames[(month - 1) % 12]} ${year}`;
  const intensity = Math.min(count * 15, 100);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -3, scale: 1.06 }}
      className="flex flex-col items-center gap-1 rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-3 min-w-[72px] transition-all duration-200 hover:border-indigo-500/30 hover:bg-indigo-500/10"
    >
      <p className="text-lg font-black text-white">{count}</p>
      <p className="text-[10px] font-semibold text-slate-400">{label}</p>
      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-slate-800">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${intensity}%` }}
          transition={{ delay: index * 0.04 + 0.3, duration: 0.5 }}
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-400"
        />
      </div>
    </motion.div>
  );
};

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        const { data: res } = await api.get('/analytics');
        if (!active) return;
        setData(res.analytics);
      } catch (e) {
        if (!active) return;
        toast.error(e.response?.data?.message || 'Could not load analytics');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <div className="relative isolate overflow-hidden">
        <Orb className="h-96 w-96 -left-32 top-10 bg-indigo-600/20" />
        <Shimmer />
      </div>
    );
  }

  if (!data) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 text-sm font-medium text-rose-300"
      >
        Could not load analytics data.
      </motion.div>
    );
  }

  const maxAtt = Math.max(1, ...data.attendanceByDept.map((d) => Number(d.total || 0)));
  const maxNotice = Math.max(1, ...data.noticesOverTime.map((n) => Number(n.cnt || 0)));

  const totalAttended = data.attendanceByDept.reduce((s, d) => s + Number(d.attended || 0), 0);
  const totalSessions = data.attendanceByDept.reduce((s, d) => s + Number(d.total || 0), 0);
  const overallPct = totalSessions > 0 ? Math.round((totalAttended / totalSessions) * 100) : 0;
  const totalNotices = data.noticesOverTime.reduce((s, n) => s + Number(n.cnt || 0), 0);
  const totalEnrolled = data.enrollmentTrend.reduce((s, e) => s + Number(e.new_users || 0), 0);

  return (
    <div className="relative overflow-hidden">
      <Orb className="h-[480px] w-[480px] -left-40 -top-20 bg-indigo-600/15" />
      <Orb className="h-72 w-72 right-0 top-40 bg-purple-600/10" />
      <Orb className="h-64 w-64 bottom-32 left-1/3 bg-teal-600/10" />
      <GridTexture />

      <div className="space-y-7">

        {/* ── Header ── */}
        <motion.div {...fadeUp(0)} className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="relative">
            <div className="pointer-events-none absolute -left-4 -top-4 h-20 w-48 rounded-full bg-indigo-500/10 blur-2xl" />
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Admin · Analytics</p>
            <h1 className="mt-1 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-4xl font-black tracking-tight text-transparent">
              Analytics
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">Attendance mix, enrollment cadence, and notice velocity.</p>
          </div>

          {/* Top-level KPIs */}
          <div className="flex flex-wrap gap-2">
            {[
              { icon: Activity, label: 'Overall att.', value: `${overallPct}%`, color: 'border-teal-500/25 bg-teal-500/10 text-teal-300' },
              { icon: Bell, label: 'Notices (30d)', value: totalNotices, color: 'border-purple-500/25 bg-purple-500/10 text-purple-300' },
              { icon: Users, label: 'Enrolled (12m)', value: totalEnrolled, color: 'border-blue-500/25 bg-blue-500/10 text-blue-300' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className={`flex items-center gap-2 rounded-xl border ${color} px-3 py-2 backdrop-blur`}>
                <Icon className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">{label}:</span>
                <span className="text-xs font-bold">{value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Top row ── */}
        <div className="grid gap-5 lg:grid-cols-2">

          {/* Attendance by dept */}
          <Panel delay={0.06} glowColor="from-teal-500/15 to-blue-500/10">
            <PanelHeader
              icon={Activity}
              iconColor="bg-teal-500/20"
              title="Attendance by department"
              subtitle="Attended vs total sessions — all time"
              badge={`${data.attendanceByDept.length} depts`}
            />
            <div className="space-y-2">
              {data.attendanceByDept.map((d, i) => (
                <AttBar
                  key={d.department}
                  dept={d.department}
                  attended={d.attended}
                  total={d.total}
                  maxTotal={maxAtt}
                  index={i}
                />
              ))}
              {!data.attendanceByDept.length && (
                <div className="flex flex-col items-center gap-2 py-10">
                  <Activity className="h-8 w-8 text-slate-700" />
                  <p className="text-sm text-slate-500">No attendance aggregates yet.</p>
                </div>
              )}
            </div>
          </Panel>

          {/* Notices per day */}
          <Panel delay={0.1} glowColor="from-purple-500/15 to-indigo-500/10">
            <PanelHeader
              icon={Bell}
              iconColor="bg-purple-500/20"
              title="Notices per day"
              subtitle="Notice publishing cadence — last 30 days"
              badge="30d window"
            />
            {data.noticesOverTime.length ? (
              <>
                <div className="flex h-44 items-end gap-0.5">
                  {data.noticesOverTime.map((n, i) => (
                    <NoticeBar key={n.day} n={n} max={maxNotice} index={i} />
                  ))}
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-slate-600">
                  <span>{String(data.noticesOverTime[0]?.day || '').slice(5)}</span>
                  <span>{String(data.noticesOverTime[data.noticesOverTime.length - 1]?.day || '').slice(5)}</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 py-10">
                <Bell className="h-8 w-8 text-slate-700" />
                <p className="text-sm text-slate-500">No notice activity in range.</p>
              </div>
            )}
          </Panel>
        </div>

        {/* ── Enrollment trend ── */}
        <Panel delay={0.14} glowColor="from-indigo-500/15 to-blue-500/10">
          <PanelHeader
            icon={TrendingUp}
            iconColor="bg-indigo-500/20"
            title="Student signups"
            subtitle="New enrollments per month — last 12 months"
            badge="12-month view"
          />
          {data.enrollmentTrend.length ? (
            <div className="flex flex-wrap gap-2">
              {data.enrollmentTrend.map((e, i) => (
                <EnrollBadge
                  key={`${e.year}-${e.month}`}
                  year={e.year}
                  month={e.month}
                  count={Number(e.new_users)}
                  index={i}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 py-10">
              <Users className="h-8 w-8 text-slate-700" />
              <p className="text-sm text-slate-500">No enrollments yet.</p>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}