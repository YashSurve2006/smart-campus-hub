import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  Shield, Clock, User, Tag, Activity,
  ChevronLeft, ChevronRight, RefreshCw,
  AlertTriangle, Settings, LogIn, LogOut,
  Trash2, Edit, Plus, Eye,
} from 'lucide-react';
import api from '../../services/api';

/* ─── Helpers ───────────────────────────────────────────────── */
const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

const Orb = ({ className }) => (
  <div className={`pointer-events-none absolute rounded-full blur-3xl ${className}`} />
);

const GridTexture = () => (
  <div
    className="pointer-events-none absolute inset-0 opacity-[0.022]"
    style={{
      backgroundImage: `linear-gradient(rgba(99,102,241,1) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,1) 1px,transparent 1px)`,
      backgroundSize: '48px 48px',
    }}
  />
);

/* ─── Action meta — color + icon by keyword ─────────────────── */
const getActionMeta = (action = '') => {
  const a = action.toLowerCase();
  if (a.includes('delete') || a.includes('remove'))
    return { icon: Trash2, dot: 'bg-rose-400', badge: 'bg-rose-500/15 text-rose-300', ring: 'ring-rose-500/20' };
  if (a.includes('login') || a.includes('sign'))
    return { icon: LogIn, dot: 'bg-emerald-400', badge: 'bg-emerald-500/15 text-emerald-300', ring: 'ring-emerald-500/20' };
  if (a.includes('logout'))
    return { icon: LogOut, dot: 'bg-slate-400', badge: 'bg-slate-700 text-slate-300', ring: 'ring-slate-600/20' };
  if (a.includes('create') || a.includes('add') || a.includes('register'))
    return { icon: Plus, dot: 'bg-blue-400', badge: 'bg-blue-500/15 text-blue-300', ring: 'ring-blue-500/20' };
  if (a.includes('update') || a.includes('edit') || a.includes('patch'))
    return { icon: Edit, dot: 'bg-amber-400', badge: 'bg-amber-500/15 text-amber-300', ring: 'ring-amber-500/20' };
  if (a.includes('view') || a.includes('read') || a.includes('access'))
    return { icon: Eye, dot: 'bg-cyan-400', badge: 'bg-cyan-500/15 text-cyan-300', ring: 'ring-cyan-500/20' };
  if (a.includes('warn') || a.includes('alert') || a.includes('fail'))
    return { icon: AlertTriangle, dot: 'bg-orange-400', badge: 'bg-orange-500/15 text-orange-300', ring: 'ring-orange-500/20' };
  return { icon: Settings, dot: 'bg-violet-400', badge: 'bg-violet-500/15 text-violet-300', ring: 'ring-violet-500/20' };
};

/* ─── Row shimmer ───────────────────────────────────────────── */
const Shimmer = () => (
  <div className="space-y-2 p-4">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="h-14 animate-pulse rounded-xl bg-slate-800/50" />
    ))}
  </div>
);

/* ─── Pagination button ─────────────────────────────────────── */
const PageBtn = ({ onClick, disabled, children, active }) => (
  <motion.button
    whileHover={!disabled ? { scale: 1.06 } : {}}
    whileTap={!disabled ? { scale: 0.95 } : {}}
    onClick={onClick}
    disabled={disabled}
    className={`flex h-8 min-w-[2rem] items-center justify-center rounded-lg border px-2.5 text-xs font-semibold transition-all duration-200 disabled:opacity-30 ${active
      ? 'border-indigo-500/50 bg-indigo-500/20 text-indigo-200'
      : 'border-white/10 bg-slate-800/60 text-slate-400 hover:border-white/20 hover:text-white'
      }`}
  >
    {children}
  </motion.button>
);

/* ─── Log row ───────────────────────────────────────────────── */
const LogRow = ({ log, index }) => {
  const meta = getActionMeta(log.action);
  const Icon = meta.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.025, duration: 0.3 }}
      whileHover={{ x: 3 }}
      className="group relative flex flex-wrap items-start gap-3 border-t border-white/5 px-5 py-3.5 transition-colors duration-150 hover:bg-indigo-500/5"
    >
      {/* Icon dot */}
      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ring-1 ${meta.badge.split(' ')[0]} ${meta.ring}`}>
        <Icon className={`h-3.5 w-3.5 ${meta.badge.split(' ')[1]}`} />
      </div>

      {/* Main content */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-lg px-2 py-0.5 text-[10px] font-bold ring-1 ${meta.badge} ${meta.ring}`}>
            {log.action}
          </span>
          {log.entity_type && (
            <span className="flex items-center gap-1 rounded-lg bg-slate-800/70 px-2 py-0.5 text-[10px] font-semibold text-slate-400 ring-1 ring-white/8">
              <Tag className="h-2.5 w-2.5" />
              {log.entity_type}{log.entity_id ? ` #${log.entity_id}` : ''}
            </span>
          )}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            <User className="h-2.5 w-2.5" />
            {log.actor_email || '—'}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" />
            {new Date(log.created_at).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Timeline connector dot */}
      <div className={`absolute left-[1.35rem] top-0 mt-0 h-full w-px bg-white/4 group-first:hidden`} />
      <div className={`absolute left-[1.1rem] top-5 h-2 w-2 shrink-0 rounded-full ${meta.dot} opacity-80 shadow-lg`} />
    </motion.div>
  );
};

/* ─── Main component ────────────────────────────────────────── */
export default function AdminAuditPage() {
  const [logs, setLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load(p = page, silent = false) {
    try {
      if (!silent) setLoading(true); else setRefreshing(true);
      const { data } = await api.get('/admin/audit-logs', { params: { page: p, limit: 25 } });
      setLogs(data.logs || []);
      setPages(data.pagination?.pages || 1);
      setPage(data.pagination?.page || 1);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(1); }, []);

  /* Build visible page numbers */
  const pageNums = Array.from({ length: Math.min(pages, 7) }, (_, i) => {
    if (pages <= 7) return i + 1;
    if (page <= 4) return i + 1;
    if (page >= pages - 3) return pages - 6 + i;
    return page - 3 + i;
  });

  return (
    <div className="relative isolate overflow-hidden">
      <Orb className="h-[480px] w-[480px] -left-40 -top-24 bg-indigo-600/15" />
      <Orb className="h-72 w-72 right-0 top-32 bg-purple-600/10" />
      <Orb className="h-56 w-56 bottom-40 left-1/2 bg-slate-600/08" />
      <GridTexture />

      <div className="space-y-7">

        {/* ── Header ── */}
        <motion.div {...fadeUp(0)} className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="relative">
            <div className="pointer-events-none absolute -left-4 -top-4 h-20 w-48 rounded-full bg-indigo-500/10 blur-2xl" />
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Admin · Security</p>
            <h1 className="mt-1 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-4xl font-black tracking-tight text-transparent">
              Audit Logs
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Security-sensitive actions across the platform — tamper-evident activity trail.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Total badge */}
            <div className="flex items-center gap-2 rounded-xl border border-indigo-500/25 bg-indigo-500/10 px-3 py-2 text-xs font-semibold text-indigo-300 backdrop-blur">
              <Activity className="h-3.5 w-3.5" />
              Page {page} of {pages}
            </div>

            {/* Refresh */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => load(page, true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-800/60 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-white/20 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </motion.button>
          </div>
        </motion.div>

        {/* ── Log table ── */}
        <motion.div {...fadeUp(0.08)} className="group relative">
          <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-indigo-500/15 to-purple-500/10 opacity-50 blur transition-opacity duration-500 group-hover:opacity-100" />
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/85 backdrop-blur-xl">

            {/* Table header */}
            <div className="flex items-center gap-3 border-b border-white/8 bg-slate-950/60 px-5 py-3.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/15 ring-1 ring-indigo-500/25">
                <Shield className="h-3.5 w-3.5 text-indigo-400" />
              </div>
              <p className="text-sm font-bold text-white">Activity Feed</p>
              <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-400">
                {logs.length} entries
              </span>

              {/* Legend */}
              <div className="ml-auto hidden items-center gap-3 sm:flex">
                {[
                  ['Delete', 'bg-rose-400'],
                  ['Create', 'bg-blue-400'],
                  ['Login', 'bg-emerald-400'],
                  ['Update', 'bg-amber-400'],
                  ['Other', 'bg-violet-400'],
                ].map(([label, dot]) => (
                  <div key={label} className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <div className={`h-2 w-2 rounded-full ${dot}`} />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Rows */}
            {loading ? (
              <Shimmer />
            ) : logs.length ? (
              <AnimatePresence mode="popLayout">
                <div className="relative divide-y-0 pl-0">
                  {logs.map((l, i) => (
                    <LogRow key={l.id} log={l} index={i} />
                  ))}
                </div>
              </AnimatePresence>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-3 py-16"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 ring-1 ring-white/10">
                  <Shield className="h-6 w-6 text-slate-600" />
                </div>
                <p className="text-sm font-medium text-slate-500">No audit logs found</p>
                <p className="text-xs text-slate-600">Activity will appear here as actions are performed</p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* ── Pagination ── */}
        {pages > 1 && (
          <motion.div {...fadeUp(0.14)} className="flex items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Showing page <span className="font-semibold text-slate-300">{page}</span> of{' '}
              <span className="font-semibold text-slate-300">{pages}</span>
            </p>

            <div className="flex items-center gap-1.5">
              <PageBtn onClick={() => load(page - 1)} disabled={page <= 1}>
                <ChevronLeft className="h-3.5 w-3.5" />
              </PageBtn>

              {pageNums.map((n) => (
                <PageBtn key={n} onClick={() => load(n)} active={n === page}>
                  {n}
                </PageBtn>
              ))}

              <PageBtn onClick={() => load(page + 1)} disabled={page >= pages}>
                <ChevronRight className="h-3.5 w-3.5" />
              </PageBtn>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}