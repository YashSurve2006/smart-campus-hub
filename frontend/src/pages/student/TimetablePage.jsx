/**
 * TimetablePage — Enterprise upgrade.
 * Previous: plain spinner, no skeleton, no empty state, bare card list.
 * Now: skeleton loading, EmptyState, animated slot cards with live indicator,
 *      improved day filter pills, dark neon consistent styling.
 */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';
import { GlassCard } from '../../components/ui/GlassCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { Skeleton } from '../../components/ui/Skeleton';
import { Orb, GridTexture, fadeUp } from '../../utils/animations';
import { CalendarDays, Clock, MapPin, User2, BookOpen } from 'lucide-react';

const DAYS = [
  { v: 1, label: 'Mon', full: 'Monday' },
  { v: 2, label: 'Tue', full: 'Tuesday' },
  { v: 3, label: 'Wed', full: 'Wednesday' },
  { v: 4, label: 'Thu', full: 'Thursday' },
  { v: 5, label: 'Fri', full: 'Friday' },
  { v: 6, label: 'Sat', full: 'Saturday' },
  { v: 7, label: 'Sun', full: 'Sunday' },
];

/* ── Timetable slot card ── */
function SlotCard({ entry, index }) {
  const now = new Date();
  const today = now.getDay() || 7; // JS Sunday=0, convert to 7
  const [startH, startM] = (entry.start_time || '0:0').split(':').map(Number);
  const [endH, endM] = (entry.end_time || '0:0').split(':').map(Number);
  const startMin = startH * 60 + startM;
  const endMin = endH * 60 + endM;
  const nowMin = now.getHours() * 60 + now.getMinutes();
  // Is this class happening right now (only meaningful if today matches)
  const isLive = nowMin >= startMin && nowMin <= endMin;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ y: -2 }}
      className={[
        'group relative rounded-2xl border p-5 transition-all duration-200',
        isLive
          ? 'border-emerald-500/30 bg-emerald-500/[0.05] shadow-emerald-500/10 shadow-lg'
          : 'border-white/8 bg-slate-900/60 hover:border-white/15 hover:bg-slate-800/50',
      ].join(' ')}
    >
      {/* Live indicator */}
      {isLive && (
        <div className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Live Now
        </div>
      )}

      {/* Subject header */}
      <div className="flex items-start gap-3">
        <div
          className={[
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            isLive
              ? 'bg-emerald-500/15 ring-1 ring-emerald-500/30'
              : 'bg-indigo-500/10 ring-1 ring-indigo-500/20',
          ].join(' ')}
        >
          <BookOpen className={`h-5 w-5 ${isLive ? 'text-emerald-400' : 'text-indigo-400'}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-white">{entry.subject_name}</p>
          {(entry.subject_code || entry.code) && (
            <p className="mt-0.5 text-[11px] font-mono text-slate-500">
              {entry.subject_code || entry.code}
            </p>
          )}
        </div>
      </div>

      {/* Details grid */}
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <Clock className="h-3.5 w-3.5 shrink-0 text-slate-600" />
          <span className="text-xs text-slate-400 font-medium">
            {entry.start_time?.slice(0, 5)} – {entry.end_time?.slice(0, 5)}
          </span>
        </div>
        {entry.building && (
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-600" />
            <span className="text-xs text-slate-400 truncate">
              {entry.building} · {entry.classroom_name || entry.room}
            </span>
          </div>
        )}
        {(entry.faculty_first_name || entry.faculty_last_name) && (
          <div className="col-span-2 flex items-center gap-2">
            <User2 className="h-3.5 w-3.5 shrink-0 text-slate-600" />
            <span className="text-xs text-slate-400">
              {entry.faculty_first_name} {entry.faculty_last_name}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function TimetablePage() {
  const user = useAuthStore((s) => s.user);
  const [day, setDay] = useState(() => {
    const d = new Date().getDay();
    return d === 0 ? 7 : d; // default to today
  });
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const deptId = user?.profile?.departmentId;
  const semester = user?.profile?.semester;

  useEffect(() => {
    if (!deptId) return;
    setLoading(true);
    (async () => {
      try {
        const { data } = await api.get('/timetable', {
          params: { departmentId: deptId, semester, dayOfWeek: day },
        });
        setEntries(data.entries || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [deptId, semester, day]);

  const selectedDay = DAYS.find((d) => d.v === day);

  return (
    <div className="relative space-y-8">
      <Orb className="h-80 w-80 -left-20 -top-16 bg-blue-600/10" />
      <Orb className="h-64 w-64 right-0 top-24 bg-indigo-600/8" />
      <GridTexture />

      {/* ── Header ── */}
      <PageHeader
        breadcrumb="Student · Timetable"
        title="Timetable"
        subtitle="Filter by weekday — synced with your department & semester."
      />

      {/* ── Day filter ── */}
      <motion.div {...fadeUp(0.06)} className="flex flex-wrap gap-2">
        {DAYS.map((d) => {
          const isActive = day === d.v;
          return (
            <motion.button
              key={d.v}
              type="button"
              onClick={() => setDay(d.v)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={[
                'relative rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'border border-white/8 bg-slate-900/60 text-slate-400 hover:border-white/15 hover:text-slate-200',
              ].join(' ')}
            >
              {/* Mobile: short label */}
              <span className="sm:hidden">{d.label}</span>
              {/* Desktop: full label */}
              <span className="hidden sm:inline">{d.full}</span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* ── Slot list ── */}
      <div>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
            >
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-white/8 bg-slate-900/60 p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 shrink-0" rounded="rounded-xl" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" rounded="rounded-full" />
                      <Skeleton className="h-3 w-20" rounded="rounded-full" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-full" rounded="rounded-full" />
                  <Skeleton className="h-3 w-3/4" rounded="rounded-full" />
                </div>
              ))}
            </motion.div>
          ) : entries.length > 0 ? (
            <motion.div
              key={`day-${day}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
            >
              {entries.map((e, i) => (
                <SlotCard key={e.id} entry={e} index={i} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/10 py-20 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.02]">
                <CalendarDays className="h-7 w-7 text-slate-600" />
              </div>
              <p className="text-sm font-semibold text-slate-400">
                No slots scheduled for {selectedDay?.full}
              </p>
              <p className="text-xs text-slate-600">
                Try selecting a different day or check with your department.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
