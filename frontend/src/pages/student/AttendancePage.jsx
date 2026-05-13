/**
 * AttendancePage — Enterprise upgrade.
 * Previous: light table with bg-slate-50, no skeleton, no dark mode.
 * Now: dark neon table via DataTable, skeleton loading, progress ring,
 *      status badges, row animations, EmptyState.
 */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';
import { DataTable } from '../../components/ui/DataTable';
import { GlassCard } from '../../components/ui/GlassCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { Orb, GridTexture, fadeUp } from '../../utils/animations';
import { CheckCircle2, XCircle, Clock, CalendarDays, Percent } from 'lucide-react';

/* ── Status badge ── */
function StatusBadge({ status }) {
  const map = {
    present: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    late:    'bg-amber-500/15  text-amber-400  border-amber-500/20',
    absent:  'bg-rose-500/15   text-rose-400   border-rose-500/20',
  };
  const icons = {
    present: <CheckCircle2 className="h-3 w-3" />,
    late:    <Clock className="h-3 w-3" />,
    absent:  <XCircle className="h-3 w-3" />,
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${map[status] || map.absent}`}
    >
      {icons[status]}
      {status}
    </span>
  );
}

/* ── Attendance ring ── */
function Ring({ pct }) {
  const r    = 28;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 75 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444';

  return (
    <svg width="72" height="72" viewBox="0 0 72 72" aria-hidden="true">
      <circle cx="36" cy="36" r={r} fill="none" strokeWidth="6" stroke="rgba(255,255,255,0.06)" />
      <motion.circle
        cx="36" cy="36" r={r}
        fill="none" strokeWidth="6" stroke={color}
        strokeLinecap="round"
        strokeDasharray={`${circ}`}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        transform="rotate(-90 36 36)"
        style={{ filter: `drop-shadow(0 0 5px ${color}55)` }}
      />
      <text x="36" y="36" textAnchor="middle" dominantBaseline="middle"
        fill={color} fontSize="11" fontWeight="800">
        {pct}%
      </text>
    </svg>
  );
}

export default function AttendancePage() {
  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [s, r] = await Promise.all([
          api.get('/api/attendance/me/summary'),
          api.get('/api/attendance/me'),
        ]);
        setSummary(s.data.summary);
        setRecords(r.data.records || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const pct     = Number(summary?.percentage) || 0;
  const attColor = pct >= 75 ? 'text-emerald-400' : pct >= 60 ? 'text-amber-400' : 'text-rose-400';

  const columns = [
    {
      key: 'attendance_date',
      label: 'Date',
      width: '120px',
      render: (row) => (
        <div className="flex items-center gap-2">
          <CalendarDays className="h-3.5 w-3.5 text-slate-600 shrink-0" />
          <span className="font-mono text-xs">{row.attendance_date}</span>
        </div>
      ),
    },
    {
      key: 'subject_name',
      label: 'Subject',
      render: (row) => (
        <span className="font-semibold text-slate-200">{row.subject_name}</span>
      ),
    },
    {
      key: 'slot',
      label: 'Slot',
      render: (row) => (
        <span className="text-slate-400 text-xs">
          {row.start_time?.slice(0, 5)} – {row.end_time?.slice(0, 5)}
        </span>
      ),
    },
    {
      key: 'room',
      label: 'Room',
      render: (row) => (
        <span className="text-slate-500 text-xs">
          {row.building} · {row.classroom_name}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="relative space-y-8">
      <Orb className="h-80 w-80 -left-24 -top-16 bg-teal-600/10" />
      <Orb className="h-64 w-64 right-0 top-32 bg-indigo-600/8" />
      <GridTexture />

      {/* ── Header ── */}
      <PageHeader
        breadcrumb="Student · Attendance"
        title="Attendance"
        subtitle="Transparent session history for every recorded class."
      />

      {/* ── Summary Cards ── */}
      <motion.div {...fadeUp(0.06)} className="grid gap-4 sm:grid-cols-4">
        {/* Ring summary card */}
        <GlassCard noAnimation variant="bordered" className="col-span-1 p-5">
          <div className="flex flex-col items-center gap-3 text-center">
            {loading ? (
              <div className="shimmer h-[72px] w-[72px] rounded-full bg-white/[0.06]" />
            ) : (
              <Ring pct={pct} />
            )}
            <div>
              <p className={`text-2xl font-black ${attColor}`}>
                {loading ? '—' : `${pct}%`}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                Attendance score
              </p>
            </div>
          </div>
        </GlassCard>

        {/* Stat pills */}
        {[
          { label: 'Present', key: 'present', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle2 },
          { label: 'Late',    key: 'late',    color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20',   icon: Clock },
          { label: 'Absent',  key: 'absent',  color: 'text-rose-400',    bg: 'bg-rose-500/10 border-rose-500/20',    icon: XCircle },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + i * 0.06 }}
              className={`flex flex-col items-center justify-center gap-2 rounded-2xl border p-5 text-center ${item.bg}`}
            >
              <Icon className={`h-5 w-5 ${item.color}`} />
              <p className={`text-2xl font-black ${item.color}`}>
                {loading ? '—' : summary?.[item.key] ?? 0}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                {item.label}
              </p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── Session Log Table ── */}
      <motion.div {...fadeUp(0.12)}>
        <div className="mb-3 flex items-center gap-2">
          <Percent className="h-4 w-4 text-slate-500" />
          <h2 className="text-sm font-bold text-white">Session Log</h2>
          {!loading && (
            <span className="rounded-full border border-white/8 bg-white/[0.04] px-2 py-0.5 text-[10px] font-semibold text-slate-500">
              {records.length} records
            </span>
          )}
        </div>
        <DataTable
          columns={columns}
          rows={records}
          loading={loading}
          rowKey="id"
          emptyMessage="No attendance records yet"
          emptySub="Your session history will appear here once recorded"
          skeletonRows={6}
        />
      </motion.div>
    </div>
  );
}
