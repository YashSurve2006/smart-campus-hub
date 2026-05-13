/**
 * StudentResultsPage — Enterprise upgrade.
 * Previous: light theme throughout (bg-white/80, border-slate-100, text-slate-900),
 *           broken loading (bg-slate-100 pulse), light chart axes, no PageHeader,
 *           bg-indigo-100/text-indigo-700 grade badges.
 * Now: unified dark surface, dark-themed Recharts (stroke/fill colors, dark tooltips/axes),
 *      animated result cards, grade badge using status utility, PageHeader,
 *      dark-neon hero banner, skeleton loading.
 */
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '../shared/useStudentResultsQuery';
import { GlassCard } from '../../components/ui/GlassCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { DashboardSkeleton } from '../../components/ui/Skeleton';
import { downloadMarksheetPdf } from '../../utils/marksheetPdf';
import { Orb, GridTexture, fadeUp, stagger, fadeUpVariant } from '../../utils/animations';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
} from 'recharts';
import { Download, GraduationCap, BarChart2, Award, Hash } from 'lucide-react';
import { Button } from '../../components/ui/Button';

/* ── Dark-themed chart tooltip ── */
function DarkTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/95 px-3 py-2 shadow-xl backdrop-blur-xl">
      <p className="text-[11px] font-bold text-slate-400 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="text-xs font-semibold" style={{ color: p.color }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
}

/* ── Grade badge ── */
function GradeBadge({ grade }) {
  const map = {
    O:  'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    'A+': 'bg-teal-500/15 text-teal-400 border-teal-500/25',
    A:  'bg-blue-500/15 text-blue-400 border-blue-500/25',
    'B+': 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25',
    B:  'bg-violet-500/15 text-violet-400 border-violet-500/25',
    C:  'bg-amber-500/15 text-amber-400 border-amber-500/25',
    F:  'bg-rose-500/15 text-rose-400 border-rose-500/25',
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold ${map[grade] || map.C}`}>
      {grade}
    </span>
  );
}

/* ── Progress bar ── */
function ProgressBar({ pct }) {
  const color = pct >= 75 ? 'from-emerald-500 to-teal-500'
    : pct >= 50 ? 'from-amber-500 to-orange-500'
    : 'from-rose-500 to-pink-500';
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
      <motion.div
        className={`h-full rounded-full bg-gradient-to-r ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, pct)}%` }}
        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
      />
    </div>
  );
}

export default function StudentResultsPage() {
  const { data, loading } = useQuery();

  const trendData = useMemo(() =>
    data?.semesters?.map((s) => ({
      semester: `S${s.semester}`,
      SGPA: Number(Number(s.sgpa).toFixed(2)),
      CGPA: Number(Number(s.cgpa).toFixed(2)),
    })) || [],
  [data]);

  const radarData = useMemo(() =>
    (data?.subjects || []).slice(0, 6).map((s) => ({
      subject: s.code,
      marks:   Number(s.percentage),
    })),
  [data]);

  const semesterMap = useMemo(() => {
    const map = {};
    (data?.subjects || []).forEach((s) => {
      if (!map[s.semester]) map[s.semester] = [];
      map[s.semester].push(s);
    });
    return map;
  }, [data]);

  if (loading) return <DashboardSkeleton />;
  if (!data)   return (
    <div className="flex flex-col items-center gap-3 py-20 text-center">
      <GraduationCap className="h-10 w-10 text-slate-600" />
      <p className="text-sm text-slate-500">No result data available yet.</p>
      <p className="text-xs text-slate-600">Results appear once your faculty publishes them.</p>
    </div>
  );

  const cgpa     = Number(data.summary?.cgpa ?? 0).toFixed(2);
  const division = data.summary?.division ?? '—';
  const rank     = data.summary?.rank;

  return (
    <div className="relative space-y-8">
      <Orb className="h-96 w-96 -left-32 -top-16 bg-indigo-600/10" />
      <Orb className="h-72 w-72 right-0 top-24 bg-cyan-600/8" />
      <GridTexture />

      {/* Header */}
      <PageHeader
        breadcrumb="Student · Results"
        title="Academic Result Portal"
        subtitle="Your SGPA, CGPA trajectory, subject grades, and downloadable marksheets."
      />

      {/* Hero summary banner */}
      <motion.div {...fadeUp(0.06)}>
        <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-900/60 via-slate-900/80 to-cyan-900/40 p-6 backdrop-blur-xl">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 left-1/3 h-40 w-40 rounded-full bg-cyan-500/8 blur-3xl" />
          <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'CGPA', value: cgpa, icon: Award, color: 'text-indigo-400' },
              { label: 'Division', value: division, icon: GraduationCap, color: 'text-violet-400' },
              { label: 'Department', value: data.student?.department_name || '—', icon: BarChart2, color: 'text-cyan-400' },
              { label: 'Dept. Rank', value: rank ? `#${rank}` : '—', icon: Hash, color: 'text-emerald-400' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.06 }}
                  className="rounded-2xl border border-white/8 bg-white/[0.04] p-4"
                >
                  <Icon className={`h-4 w-4 ${item.color} mb-2`} />
                  <p className="text-2xl font-black text-white">{item.value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mt-0.5">
                    {item.label}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Charts */}
      {(trendData.length > 0 || radarData.length > 0) && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* SGPA/CGPA trend */}
          <motion.div {...fadeUp(0.1)}>
            <GlassCard noPadding noAnimation>
              <div className="border-b border-slate-800/60 px-5 py-4">
                <p className="text-sm font-bold text-white">SGPA / CGPA Trend</p>
              </div>
              <div className="p-4" style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <XAxis
                      dataKey="semester"
                      stroke="#475569"
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      axisLine={{ stroke: '#1e293b' }}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 10]}
                      stroke="#475569"
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                      width={28}
                    />
                    <Tooltip content={<DarkTooltip />} />
                    <Line
                      type="monotone" dataKey="SGPA" name="SGPA"
                      stroke="#818cf8" strokeWidth={2.5} dot={{ fill: '#818cf8', r: 4 }}
                      activeDot={{ r: 6, fill: '#818cf8' }}
                    />
                    <Line
                      type="monotone" dataKey="CGPA" name="CGPA"
                      stroke="#38bdf8" strokeWidth={2.5} dot={{ fill: '#38bdf8', r: 4 }}
                      activeDot={{ r: 6, fill: '#38bdf8' }}
                      strokeDasharray="5 3"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </motion.div>

          {/* Subject Radar */}
          <motion.div {...fadeUp(0.13)}>
            <GlassCard noPadding noAnimation>
              <div className="border-b border-slate-800/60 px-5 py-4">
                <p className="text-sm font-bold text-white">Subject Strength Radar</p>
              </div>
              <div className="p-4" style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#1e293b" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: '#64748b', fontSize: 10 }}
                    />
                    <PolarRadiusAxis
                      domain={[0, 100]}
                      tick={{ fill: '#475569', fontSize: 9 }}
                      axisLine={false}
                      angle={30}
                    />
                    <Radar
                      name="Performance" dataKey="marks"
                      stroke="#2dd4bf" fill="#2dd4bf" fillOpacity={0.25}
                      strokeWidth={2}
                    />
                    <Tooltip content={<DarkTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}

      {/* Per-semester subject cards */}
      {Object.entries(semesterMap).map(([sem, rows]) => {
        const sgpaRow = data.semesters?.find((s) => String(s.semester) === String(sem));
        return (
          <motion.div key={sem} {...fadeUp(0.14)}>
            <GlassCard noPadding noAnimation>
              {/* Semester header */}
              <div className="flex flex-col gap-3 border-b border-slate-800/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-bold text-white">Semester {sem}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    SGPA: <span className="font-semibold text-indigo-400">{sgpaRow?.sgpa ?? '—'}</span>
                    &nbsp;·&nbsp;
                    Status: <span className={sgpaRow?.published ? 'text-emerald-400' : 'text-amber-400'}>
                      {sgpaRow?.published ? 'Published' : 'Pending'}
                    </span>
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadMarksheetPdf({
                    student: data.student,
                    semester: sem,
                    rows,
                    summary: { sgpa: sgpaRow?.sgpa, cgpa: sgpaRow?.cgpa, division: data.summary?.division },
                  })}
                >
                  <Download className="h-3.5 w-3.5" />
                  Marksheet PDF
                </Button>
              </div>

              {/* Subject grid */}
              <motion.div
                variants={stagger}
                initial="initial"
                animate="animate"
                className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3"
              >
                {rows.map((r) => (
                  <motion.div
                    key={r.id}
                    variants={fadeUpVariant}
                    className="group rounded-2xl border border-slate-800/60 bg-slate-900/50 p-4 transition-all hover:border-indigo-500/20 hover:bg-indigo-500/[0.03]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-200">
                          {r.name}
                        </p>
                        <p className="mt-0.5 text-[10px] font-mono text-slate-500">
                          {r.code} · {r.exam_type} · {r.credits} cr
                        </p>
                      </div>
                      <GradeBadge grade={r.grade} />
                    </div>

                    <ProgressBar pct={Number(r.percentage)} />

                    <div className="mt-2.5 flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300">
                        {r.marks_obtained}/{r.total_marks}
                        <span className="ml-1 text-slate-500">({Number(r.percentage).toFixed(1)}%)</span>
                      </span>
                      <span className={[
                        'rounded-full px-2 py-0.5 text-[10px] font-bold',
                        r.status === 'pass'
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : 'bg-rose-500/15 text-rose-400',
                      ].join(' ')}>
                        {r.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </GlassCard>
          </motion.div>
        );
      })}

      {/* Attendance correlation placeholder */}
      <motion.div {...fadeUp(0.18)}>
        <GlassCard noPadding noAnimation variant="bordered">
          <div className="flex items-center gap-3 px-5 py-4">
            <BarChart2 className="h-4 w-4 text-indigo-400 shrink-0" />
            <div>
              <p className="text-sm font-bold text-white">Attendance ↔ Performance Correlation</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Auto-maps attendance patterns with semester performance — available in the next release.
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
