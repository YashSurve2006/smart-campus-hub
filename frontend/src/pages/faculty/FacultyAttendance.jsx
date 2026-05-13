/**
 * FacultyAttendance — Enterprise upgrade.
 * Previous: light form inputs (bg-white/90, border-slate-200), plain table.
 * Now: dark ent-input form fields, dark DataTable, animated rows, roster count badge,
 *      bulk action feedback, status color chips on select.
 */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { ClipboardList, Check, Users, Calendar, Layers } from 'lucide-react';
import api from '../../services/api';
import { Button } from '../../components/ui/Button';
import { GlassCard } from '../../components/ui/GlassCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { Orb, GridTexture, fadeUp } from '../../utils/animations';

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/* ── Status select with color indicator ── */
function StatusSelect({ value, onChange }) {
  const colors = {
    present: 'text-emerald-400 border-emerald-500/25 bg-emerald-500/10',
    late:    'text-amber-400  border-amber-500/25  bg-amber-500/10',
    absent:  'text-rose-400   border-rose-500/25   bg-rose-500/10',
  };
  return (
    <select
      value={value}
      onChange={onChange}
      className={[
        'cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-semibold',
        'outline-none transition-all duration-150 backdrop-blur',
        'focus:ring-2 focus:ring-indigo-500/30',
        colors[value] || colors.present,
      ].join(' ')}
    >
      <option value="present">Present</option>
      <option value="late">Late</option>
      <option value="absent">Absent</option>
    </select>
  );
}

/* ── Avatar initials ── */
function Avatar({ name }) {
  const initials = name?.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '??';
  const colors   = [
    'from-indigo-500 to-violet-500',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-rose-500 to-pink-500',
  ];
  const color = colors[initials.charCodeAt(0) % colors.length];
  return (
    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-xs font-bold text-white`}>
      {initials}
    </div>
  );
}

export default function FacultyAttendance() {
  const [slots,          setSlots]          = useState([]);
  const [slotId,         setSlotId]         = useState('');
  const [date,           setDate]           = useState(todayISO());
  const [roster,         setRoster]         = useState([]);
  const [statusMap,      setStatusMap]      = useState({});
  const [submitting,     setSubmitting]     = useState(false);
  const [rosterLoading,  setRosterLoading]  = useState(false);

  // Load faculty slots
  useEffect(() => {
    (async () => {
      const { data } = await api.get('/api/timetable', { params: { mine: 1 } });
      setSlots(data.entries || []);
      if (data.entries?.[0]) setSlotId(String(data.entries[0].id));
    })();
  }, []);

  // Load roster when slot changes
  useEffect(() => {
    if (!slotId) return;
    setRosterLoading(true);
    (async () => {
      try {
        const { data } = await api.get(`/api/attendance/roster/${slotId}`);
        const students = data.students || [];
        setRoster(students);
        const init = {};
        students.forEach((s) => { init[s.id] = 'present'; });
        setStatusMap(init);
      } finally {
        setRosterLoading(false);
      }
    })();
  }, [slotId]);

  async function submit() {
    try {
      setSubmitting(true);
      const records = roster.map((s) => ({
        studentId: s.id,
        status: statusMap[s.id] || 'present',
      }));
      await api.post('/api/attendance/mark', {
        timetableEntryId: Number(slotId),
        attendanceDate:   date,
        records,
      });
      toast.success(`Attendance saved for ${roster.length} students`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save attendance');
    } finally {
      setSubmitting(false);
    }
  }

  function setAll(status) {
    setStatusMap((prev) => {
      const next = { ...prev };
      roster.forEach((s) => { next[s.id] = status; });
      return next;
    });
  }

  const presentCount = Object.values(statusMap).filter((s) => s === 'present').length;
  const absentCount  = Object.values(statusMap).filter((s) => s === 'absent').length;
  const lateCount    = Object.values(statusMap).filter((s) => s === 'late').length;

  return (
    <div className="relative space-y-8">
      <Orb className="h-80 w-80 -left-20 -top-16 bg-emerald-600/10" />
      <Orb className="h-64 w-64 right-0 top-32 bg-indigo-600/8" />
      <GridTexture />

      {/* ── Header ── */}
      <PageHeader
        breadcrumb="Faculty · Attendance"
        title="Attendance Manager"
        subtitle="Select your class slot, then mark your roster in one pass."
        badges={roster.length > 0 ? [
          { label: `${roster.length} students`, color: 'blue', icon: Users },
        ] : []}
      />

      {/* ── Controls card ── */}
      <motion.div {...fadeUp(0.06)}>
        <GlassCard noAnimation>
          <div className="border-b border-white/8 px-5 py-4">
            <h2 className="flex items-center gap-2 text-sm font-bold text-white">
              <Layers className="h-4 w-4 text-indigo-400" />
              Session Settings
            </h2>
          </div>
          <div className="grid gap-5 p-5 md:grid-cols-3">
            {/* Slot select */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <Layers className="h-3 w-3" /> Class slot
              </label>
              <select
                value={slotId}
                onChange={(e) => setSlotId(e.target.value)}
                className="ent-select w-full"
              >
                {slots.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.subject_name} · Day {s.day_of_week} · {s.start_time?.slice(0, 5)}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <Calendar className="h-3 w-3" /> Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="ent-input"
              />
            </div>

            {/* Bulk actions */}
            <div className="flex items-end gap-2">
              <Button
                variant="success"
                size="sm"
                onClick={() => setAll('present')}
                disabled={!roster.length}
              >
                <Check className="h-3.5 w-3.5" /> All Present
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setAll('absent')}
                disabled={!roster.length}
              >
                All Absent
              </Button>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* ── Live stat pills ── */}
      {roster.length > 0 && (
        <motion.div {...fadeUp(0.1)} className="flex flex-wrap gap-2">
          {[
            { label: 'Present', count: presentCount, color: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400' },
            { label: 'Late',    count: lateCount,    color: 'border-amber-500/25  bg-amber-500/10  text-amber-400' },
            { label: 'Absent',  count: absentCount,  color: 'border-rose-500/25   bg-rose-500/10   text-rose-400' },
          ].map((p) => (
            <div key={p.label} className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold backdrop-blur ${p.color}`}>
              {p.count} {p.label}
            </div>
          ))}
        </motion.div>
      )}

      {/* ── Roster Table ── */}
      <motion.div {...fadeUp(0.14)}>
        <GlassCard noPadding noAnimation>
          <div className="flex items-center justify-between border-b border-white/8 px-5 py-4">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-indigo-400" />
              <h2 className="text-sm font-bold text-white">Student Roster</h2>
            </div>
            {roster.length > 0 && (
              <span className="text-[11px] text-slate-500">{roster.length} students</span>
            )}
          </div>

          <div className="overflow-x-auto scrollbar-thin">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/8">
                  {['Student', 'Code', 'Status'].map((h) => (
                    <th key={h} className="ent-table-header px-5 py-3.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rosterLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-t border-white/[0.04]">
                      {[1, 2, 3].map((c) => (
                        <td key={c} className="px-5 py-4">
                          <div className="shimmer h-3.5 w-24 rounded-full bg-white/[0.06]" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : roster.length > 0 ? (
                  roster.map((s, i) => (
                    <motion.tr
                      key={s.id}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="ent-table-row"
                    >
                      <td className="ent-table-cell">
                        <div className="flex items-center gap-3">
                          <Avatar name={`${s.first_name} ${s.last_name}`} />
                          <div>
                            <p className="font-semibold text-slate-200">{s.first_name} {s.last_name}</p>
                            {s.email && (
                              <p className="text-[11px] text-slate-600">{s.email}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="ent-table-cell">
                        <span className="rounded-lg bg-slate-800/60 px-2.5 py-1 font-mono text-xs font-semibold text-slate-300">
                          {s.student_code}
                        </span>
                      </td>
                      <td className="ent-table-cell">
                        <StatusSelect
                          value={statusMap[s.id] || 'present'}
                          onChange={(e) =>
                            setStatusMap((prev) => ({ ...prev, [s.id]: e.target.value }))
                          }
                        />
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3}>
                      <div className="flex flex-col items-center gap-2 py-12">
                        <Users className="h-8 w-8 text-slate-700" />
                        <p className="text-sm font-medium text-slate-500">No students in this cohort</p>
                        <p className="text-xs text-slate-600">Select a different class slot</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-white/8 p-4">
            <Button
              onClick={submit}
              loading={submitting}
              disabled={!roster.length || submitting}
              size="md"
            >
              <ClipboardList className="h-4 w-4" />
              Save Attendance
            </Button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
