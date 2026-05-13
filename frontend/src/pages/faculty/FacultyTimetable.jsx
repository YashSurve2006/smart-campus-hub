/**
 * FacultyTimetable — Enterprise upgrade.
 * Previous: light theme (text-slate-900, border-slate-200, bg-white/90 inputs), no loading,
 *           no dark PageHeader, raw confirm() dialog, no empty state.
 * Now: dark ent-input/ent-select form fields, loading skeleton, dark list, animated rows,
 *      PageHeader, proper delete confirmation via Button/danger variant, empty state.
 */
import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  BookOpen, CalendarDays, Clock, Layers, MapPin,
  Plus, Trash2, X, ChevronRight,
} from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { Skeleton } from '../../components/ui/Skeleton';
import { Orb, GridTexture, fadeUp } from '../../utils/animations';

const DAYS = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_COLORS = [
  '', 'text-indigo-400', 'text-blue-400', 'text-cyan-400',
  'text-teal-400', 'text-emerald-400', 'text-amber-400', 'text-rose-400',
];

function SlotRow({ entry, onDelete, index }) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!window.confirm(`Delete "${entry.subject_name}" slot?`)) return;
    setDeleting(true);
    try {
      await api.delete(`/api/timetable/${entry.id}`);
      toast.success('Slot removed');
      onDelete(entry.id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
      setDeleting(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      transition={{ delay: index * 0.03 }}
      className="group flex items-start justify-between gap-4 border-t border-slate-800/60 px-5 py-4 transition-colors hover:bg-white/[0.02]"
    >
      <div className="flex items-start gap-3 min-w-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 ring-1 ring-indigo-500/20">
          <BookOpen className="h-4 w-4 text-indigo-400" />
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-slate-200 truncate">{entry.subject_name}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
            <span className={`flex items-center gap-1 font-medium ${DAY_COLORS[entry.day_of_week] || 'text-slate-400'}`}>
              <CalendarDays className="h-3 w-3" />
              {DAYS[entry.day_of_week] || `Day ${entry.day_of_week}`}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {entry.start_time?.slice(0, 5)} – {entry.end_time?.slice(0, 5)}
            </span>
            {entry.classroom_name && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {entry.building} · {entry.classroom_name}
              </span>
            )}
            {entry.section && (
              <span className="rounded bg-slate-800 px-1.5 py-0.5 font-mono">
                §{entry.section}
              </span>
            )}
            <span className="text-slate-600">Sem {entry.semester}</span>
          </div>
        </div>
      </div>
      <Button
        variant="danger"
        size="xs"
        loading={deleting}
        onClick={handleDelete}
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label={`Delete slot ${entry.subject_name}`}
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </motion.div>
  );
}

const EMPTY_FORM = {
  departmentId: '',
  semester: '1',
  dayOfWeek: '1',
  startTime: '09:00',
  endTime: '10:00',
  subjectName: '',
  classroomId: '',
  section: 'A',
};

export default function FacultyTimetable() {
  const user       = useAuthStore((s) => s.user);
  const [entries,    setEntries]    = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [showForm,   setShowForm]   = useState(false);

  const deptId = user?.profile?.departmentId;

  /* Auto-fill departmentId from user profile */
  useEffect(() => {
    if (deptId) setForm((f) => ({ ...f, departmentId: String(deptId) }));
  }, [deptId]);

  const loadEntries = useCallback(async () => {
    try {
      const { data } = await api.get('/api/timetable', { params: { mine: 1 } });
      setEntries(data.entries || []);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const [, cls] = await Promise.all([
        loadEntries(),
        api.get('/api/classrooms'),
      ]).catch(() => [null, { data: { classrooms: [] } }]);
      // cls is the second resolved value
      api.get('/api/classrooms').then(({ data }) => {
        setClassrooms(data.classrooms || []);
        if (data.classrooms?.[0]) {
          setForm((f) => ({ ...f, classroomId: String(data.classrooms[0].id) }));
        }
      }).catch(() => {});
    })();
  }, [loadEntries]);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/api/timetable', {
        departmentId: Number(form.departmentId),
        semester:     Number(form.semester),
        dayOfWeek:    Number(form.dayOfWeek),
        startTime:    `${form.startTime}:00`,
        endTime:      `${form.endTime}:00`,
        subjectName:  form.subjectName,
        classroomId:  Number(form.classroomId),
        section:      form.section,
      });
      toast.success('Slot created successfully');
      setForm((f) => ({ ...EMPTY_FORM, departmentId: f.departmentId, classroomId: f.classroomId }));
      setShowForm(false);
      setListLoading(true);
      loadEntries();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create slot');
    } finally {
      setSubmitting(false);
    }
  }

  function handleDelete(id) {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  return (
    <div className="relative space-y-8">
      <Orb className="h-80 w-80 -left-20 -top-16 bg-blue-600/10" />
      <Orb className="h-64 w-64 right-0 top-24 bg-indigo-600/8" />
      <GridTexture />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          breadcrumb="Faculty · Timetable"
          title="Timetable Management"
          subtitle="Create and manage your assigned teaching slots."
          badges={entries.length > 0 ? [{ label: `${entries.length} active slots`, color: 'blue' }] : []}
        />
        <Button
          variant={showForm ? 'danger' : 'primary'}
          size="sm"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? <><X className="h-3.5 w-3.5" /> Cancel</> : <><Plus className="h-3.5 w-3.5" /> Add Slot</>}
        </Button>
      </div>

      {/* Create form — collapsible */}
      {showForm && (
        <motion.div {...fadeUp(0.04)}>
          <GlassCard noPadding noAnimation>
            <div className="border-b border-slate-800/60 px-5 py-4">
              <h2 className="flex items-center gap-2 text-sm font-bold text-white">
                <Plus className="h-4 w-4 text-indigo-400" /> New Teaching Slot
              </h2>
            </div>
            <form className="grid gap-4 p-5 md:grid-cols-2" onSubmit={handleSubmit}>
              {/* Department */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Department ID
                </label>
                <input type="number" required {...field('departmentId')} className="ent-input" />
              </div>

              {/* Semester */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Semester
                </label>
                <select {...field('semester')} className="ent-select">
                  {[1,2,3,4,5,6,7,8].map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                  ))}
                </select>
              </div>

              {/* Day */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Weekday
                </label>
                <select {...field('dayOfWeek')} className="ent-select">
                  {DAYS.slice(1).map((d, i) => (
                    <option key={i+1} value={i+1}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Section */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Section
                </label>
                <input {...field('section')} placeholder="A" className="ent-input" />
              </div>

              {/* Start time */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Start Time
                </label>
                <input type="time" {...field('startTime')} className="ent-input" />
              </div>

              {/* End time */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  End Time
                </label>
                <input type="time" {...field('endTime')} className="ent-input" />
              </div>

              {/* Subject */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Subject Name
                </label>
                <input
                  required
                  {...field('subjectName')}
                  placeholder="e.g. Data Structures & Algorithms"
                  className="ent-input"
                />
              </div>

              {/* Classroom */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Classroom
                </label>
                <select {...field('classroomId')} className="ent-select">
                  {classrooms.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.building} · {c.name}
                      {c.capacity ? ` (cap. ${c.capacity})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <Button type="submit" loading={submitting} size="md">
                  <ChevronRight className="h-4 w-4" />
                  Create Slot
                </Button>
              </div>
            </form>
          </GlassCard>
        </motion.div>
      )}

      {/* Slots list */}
      <motion.div {...fadeUp(0.08)}>
        <GlassCard noPadding noAnimation>
          <div className="flex items-center justify-between border-b border-slate-800/60 px-5 py-4">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-indigo-400" />
              <h2 className="text-sm font-bold text-white">Your Slots</h2>
            </div>
            {!listLoading && (
              <span className="text-[11px] text-slate-500">{entries.length} total</span>
            )}
          </div>

          {listLoading ? (
            <div className="space-y-px p-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-3">
                  <Skeleton className="h-9 w-9 shrink-0" rounded="rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3.5 w-48" rounded="rounded-full" />
                    <Skeleton className="h-3 w-32" rounded="rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : entries.length > 0 ? (
            entries.map((entry, i) => (
              <SlotRow key={entry.id} entry={entry} onDelete={handleDelete} index={i} />
            ))
          ) : (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40">
                <CalendarDays className="h-7 w-7 text-slate-600" />
              </div>
              <p className="text-sm font-semibold text-slate-400">No slots created yet</p>
              <p className="text-xs text-slate-600">
                Click <span className="text-indigo-400">Add Slot</span> to schedule your first class
              </p>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </div>
  );
}
