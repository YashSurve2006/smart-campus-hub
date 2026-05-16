/* ─────────────────────────────────────────────
   AdminDashboard — Page Content Only
   DashboardShell owns sidebar, header, background, breadcrumbs.
   This file renders ONLY the page body content.
───────────────────────────────────────────── */

import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

import {
  BarChart3,
  Brain,
  ClipboardCheck,
  FolderOpen,
  GraduationCap,
  Megaphone,
  Radio,
  Sparkles,
  Users,
} from 'lucide-react';

import api from '../../services/api';

import { StatCard } from '../../components/cards/StatCard';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { DashboardSkeleton } from '../../components/ui/Skeleton';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

/* ───────────────────────────────────────────── */

const fadeUp = (d = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: {
    duration: 0.5,
    delay: d,
    ease: [0.25, 0.46, 0.45, 0.94],
  },
});

/* ───────────────────────────────────────────── */

function DarkTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#070b1d]/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
      <p className="mb-1 text-[11px] font-bold text-slate-400">
        {label}
      </p>

      {payload.map((p) => (
        <p
          key={p.dataKey}
          className="text-xs font-semibold"
          style={{ color: p.fill }}
        >
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

/* ───────────────────────────────────────────── */

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);

      const s = await api.get('/dashboard/admin');

      const dashboard = s.data.dashboard || s.data;
      setStats(dashboard);
      setActivity(dashboard.recentActivity || dashboard.activity || []);
    } catch (e) {
      console.error(e);

      toast.error(
        e.response?.data?.message ||
        e.message ||
        'Could not load dashboard'
      );

      setStats(null);
      setActivity([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <DashboardSkeleton />;

  const deptData =
    stats?.departmentStats?.map((d) => ({
      name: d.name?.slice(0, 10) || 'Dept',
      Students: Number(d.student_count || 0),
      Faculty: Number(d.faculty_count || 0),
    })) || [];

  /* ─────────────────────────────────────────────
     PAGE BODY — no wrapper, no sidebar, no header.
     DashboardShell provides all layout structure.
  ───────────────────────────────────────────── */
  return (
    <div className="space-y-8">

      {/* ── Hero Banner ── */}
      <motion.div {...fadeUp(0)}>
        <div
          className="relative overflow-hidden rounded-[32px] border border-white/[0.08] p-8"
          style={{
            background:
              'linear-gradient(135deg, rgba(99,102,241,0.14) 0%, rgba(139,92,246,0.10) 40%, rgba(6,182,212,0.07) 100%)',
          }}
        >
          <div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-indigo-500/10 blur-3xl" />

          <div className="relative grid gap-8 xl:grid-cols-12">

            {/* Left — branding + CTA */}
            <div className="xl:col-span-8">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-indigo-500/40 to-transparent" />
              </div>

              <h1 className="text-4xl font-black tracking-tight text-white">
                Smart Campus Hub
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
                AI-powered administration, analytics, realtime monitoring,
                intelligent campus operations, academic visibility, and
                enterprise management.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/admin/ai-results">
                  <Button variant="gradient">
                    <Brain className="h-4 w-4" />
                    Open AI Center
                  </Button>
                </Link>

                <Link to="/admin/analytics">
                  <Button variant="secondary">
                    <BarChart3 className="h-4 w-4" />
                    View Analytics
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right — quick KPI tiles */}
            <div className="grid gap-4 xl:col-span-4">
              {[
                {
                  label: 'Students',
                  value: stats?.totalStudents ?? 0,
                  icon: GraduationCap,
                },
                {
                  label: 'Faculty',
                  value: stats?.totalFaculty ?? 0,
                  icon: Users,
                },
                {
                  label: 'Attendance',
                  value: `${stats?.attendanceRate ?? stats?.overallAttendancePct ?? '—'}%`,
                  icon: ClipboardCheck,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="rounded-3xl border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur-xl"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500">
                          {item.label}
                        </p>
                        <p className="mt-1 text-3xl font-black text-white">
                          {item.value}
                        </p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10">
                        <Icon className="h-5 w-5 text-indigo-300" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </motion.div>

      {/* ── KPI Stats Row ── */}
      <motion.div {...fadeUp(0.08)}>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Students"
            value={stats?.totalStudents ?? 0}
            icon={GraduationCap}
            color="indigo"
          />
          <StatCard
            label="Faculty"
            value={stats?.totalFaculty ?? 0}
            icon={Users}
            color="violet"
          />
          <StatCard
            label="Notices"
            value={stats?.noticesLast30Days ?? stats?.activeNotices ?? 0}
            icon={Megaphone}
            color="cyan"
          />
          <StatCard
            label="Files"
            value={stats?.totalFiles ?? stats?.recentUploads?.length ?? 0}
            icon={FolderOpen}
            color="emerald"
          />
        </div>
      </motion.div>

      {/* ── Analytics Chart + Live Activity ── */}
      <motion.div {...fadeUp(0.16)}>
        <div className="grid gap-6 xl:grid-cols-12">

          {/* Department Bar Chart */}
          <div className="xl:col-span-8">
            <GlassCard noPadding noAnimation>
              <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
                <div>
                  <p className="text-sm font-bold text-white">
                    Department Analytics
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Student &amp; faculty distribution
                  </p>
                </div>
                <BarChart3 className="h-5 w-5 text-indigo-400" />
              </div>

              <div className="p-5" style={{ height: 340 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.04)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      stroke="transparent"
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <YAxis
                      stroke="transparent"
                      tick={{ fill: '#64748b', fontSize: 11 }}
                    />
                    <Tooltip content={<DarkTooltip />} />
                    <Bar
                      dataKey="Students"
                      fill="#818cf8"
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar
                      dataKey="Faculty"
                      fill="#2dd4bf"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>

          {/* Live Activity Feed */}
          <div className="xl:col-span-4">
            <GlassCard noPadding noAnimation>
              <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-5">
                <div>
                  <p className="text-sm font-bold text-white">
                    Live Activity
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Real-time campus activity
                  </p>
                </div>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>
              </div>

              <div className="overflow-y-auto" style={{ maxHeight: 340 }}>
                {activity.length > 0 ? (
                  activity.slice(0, 10).map((a, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-3 border-b border-white/[0.04] px-5 py-4"
                    >
                      <div className="mt-1 h-2 w-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(99,102,241,0.9)]" />
                      <div>
                        <p className="text-xs font-medium text-slate-300">
                          {a.message || a.action}
                        </p>
                        <p className="mt-1 text-[10px] text-slate-600">
                          {a.created_at
                            ? new Date(a.created_at).toLocaleTimeString()
                            : ''}
                        </p>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Radio className="h-6 w-6 text-slate-700" />
                    <p className="mt-2 text-xs text-slate-600">
                      No activity found
                    </p>
                  </div>
                )}
              </div>
            </GlassCard>
          </div>

        </div>
      </motion.div>

    </div>
  );
}