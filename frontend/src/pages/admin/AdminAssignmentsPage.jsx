import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Search, Filter, FileText, Users } from 'lucide-react';
import {
  getAssignments,
  getAssignmentAnalytics,
} from '../../services/assignmentsApi';
import { GlassCard } from '../../components/ui/GlassCard';
import { Skeleton } from '../../components/ui/Skeleton';
import { AssignmentStatusBadge } from '../../components/assignments/AssignmentStatusBadge';

export default function AdminAssignmentsPage() {
  const [assignments, setAssignments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [semester, setSemester] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [assignmentsRes, analyticsRes] = await Promise.all([
        getAssignments({ search, departmentId: departmentId || undefined, semester: semester || undefined }),
        getAssignmentAnalytics({ departmentId: departmentId || undefined, semester: semester || undefined }),
      ]);
      setAssignments(assignmentsRes.data || []);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [search, departmentId, semester]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Assignment overview</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Monitor all assignments and submissions across the campus.
        </p>
      </div>

      {!loading && analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Total assignments</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {analytics.total_assignments}
                </p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Total submissions</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {analytics.total_submissions}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assignments…"
            className="w-full rounded-xl border border-slate-200 bg-white/90 py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-hub-purple/35 dark:border-white/10 dark:bg-slate-950 dark:text-white"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <input
            type="number"
            placeholder="Department ID"
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="w-36 rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white outline-none focus:ring-2 focus:ring-hub-purple/35"
          />
          <input
            type="number"
            placeholder="Semester"
            min="1"
            max="12"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="w-32 rounded-xl border border-slate-200 bg-white/90 px-3 py-2.5 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white outline-none focus:ring-2 focus:ring-hub-purple/35"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-3 md:grid-cols-2">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {assignments.map((a, i) => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <GlassCard className="h-full border-white/60 p-4 transition-shadow hover:shadow-lg dark:border-white/10 dark:bg-slate-900/50">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <AssignmentStatusBadge status={a.status} />
                      {a.submission_count > 0 && (
                        <span className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-700 dark:text-indigo-300">
                          {a.submission_count} submission(s)
                        </span>
                      )}
                    </div>
                    <h2 className="font-semibold text-slate-900 dark:text-white">{a.title}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
                      {a.description}
                    </p>
                    <p className="mt-2 text-xs text-slate-500">
                      {a.subject_name} · {a.department_name} · Semester {a.semester}
                    </p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && !assignments.length && (
        <GlassCard className="p-10 text-center text-slate-500 dark:text-slate-400">
          No assignments match your filters.
        </GlassCard>
      )}
    </div>
  );
}
