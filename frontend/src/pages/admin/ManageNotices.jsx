import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  Bell,
  Search,
  Trash2,
  User,
  Clock,
  MessageSquare,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import api from '../../services/api';
import { GlassCard } from '../../components/ui/GlassCard';

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
    className="pointer-events-none absolute inset-0 opacity-[0.025]"
    style={{
      backgroundImage: `linear-gradient(rgba(168,85,247,1) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,1) 1px, transparent 1px)`,
      backgroundSize: '48px 48px',
    }}
  />
);

/* ── Notice type color heuristic based on title keywords ── */
const getAccent = (title = '') => {
  const t = title.toLowerCase();
  if (t.includes('urgent') || t.includes('alert') || t.includes('warning'))
    return { dot: 'bg-rose-400', ring: 'border-rose-500/25', badge: 'bg-rose-500/15 text-rose-400', label: 'Urgent' };
  if (t.includes('exam') || t.includes('test') || t.includes('result'))
    return { dot: 'bg-amber-400', ring: 'border-amber-500/25', badge: 'bg-amber-500/15 text-amber-400', label: 'Academic' };
  if (t.includes('event') || t.includes('fest') || t.includes('cultural'))
    return { dot: 'bg-blue-400', ring: 'border-blue-500/25', badge: 'bg-blue-500/15 text-blue-400', label: 'Event' };
  return { dot: 'bg-purple-400', ring: 'border-purple-500/25', badge: 'bg-purple-500/15 text-purple-400', label: 'General' };
};

/* ── Individual notice card ── */
const NoticeCard = ({ notice, onRemove, index }) => {
  const [expanded, setExpanded] = useState(false);
  const accent = getAccent(notice.title);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Delete this notice?')) return;
    setDeleting(true);
    await onRemove(notice.id);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: deleting ? 0 : 1, y: deleting ? -10 : 0, scale: deleting ? 0.96 : 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.97 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
      className={`group relative overflow-hidden rounded-2xl border bg-slate-900/85 backdrop-blur-xl transition-all duration-300 hover:bg-slate-800/80 ${accent.ring}`}
    >
      {/* Left accent bar */}
      <div className={`absolute left-0 top-0 h-full w-1 ${accent.dot} opacity-80`} />

      <div className="p-5 pl-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
          {/* Content */}
          <div className="min-w-0 flex-1">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${accent.badge}`}>
                {accent.label}
              </span>
              <h3 className="text-sm font-bold text-white">{notice.title}</h3>
            </div>

            {/* Meta */}
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {notice.author_first_name} {notice.author_last_name}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {new Date(notice.created_at).toLocaleString()}
              </span>
            </div>

            {/* Body */}
            <motion.p
              className={`mt-2.5 text-sm leading-relaxed text-slate-400 ${!expanded ? 'line-clamp-2' : ''}`}
            >
              {notice.body}
            </motion.p>

            {notice.body?.length > 120 && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="mt-1.5 text-[11px] font-semibold text-purple-400 hover:text-purple-300 transition"
              >
                {expanded ? 'Show less ↑' : 'Read more ↓'}
              </button>
            )}
          </div>

          {/* Delete */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.93 }}
            onClick={handleDelete}
            disabled={deleting}
            className="flex shrink-0 items-center gap-1.5 self-start rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400 transition-all duration-200 hover:border-rose-500/50 hover:bg-rose-500/20 hover:text-rose-300 disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {deleting ? 'Removing…' : 'Delete'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default function ManageNotices() {
  const [notices, setNotices] = useState([]);
  const [search, setSearch] = useState('');

  async function load() {
    const { data } = await api.get('/notices', { params: { search } });
    setNotices(data.notices || []);
  }

  useEffect(() => { load(); }, [search]);

  async function remove(id) {
    try {
      await api.delete(`/notices/${id}`);
      toast.success('Deleted');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  }

  return (
    <div className="relative isolate overflow-hidden">
      <Orb className="h-96 w-96 -left-32 -top-20 bg-purple-600/15" />
      <Orb className="h-72 w-72 right-0 top-40 bg-indigo-600/10" />
      <Orb className="h-56 w-56 bottom-32 left-1/2 bg-violet-600/08" />
      <GridTexture />

      <div className="space-y-7">

        {/* ── Header ── */}
        <motion.div {...fadeUp(0)} className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="relative">
            <div className="pointer-events-none absolute -left-4 -top-4 h-20 w-48 rounded-full bg-purple-500/10 blur-2xl" />
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500">Admin · Notices</p>
            <h1 className="mt-1 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-4xl font-black tracking-tight text-transparent">
              Manage Notices
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">Moderate the campus-wide bulletin board.</p>
          </div>

          {/* Count pill */}
          <div className="flex items-center gap-2 rounded-xl border border-purple-500/25 bg-purple-500/10 px-3 py-2 text-xs font-semibold text-purple-300 backdrop-blur">
            <Bell className="h-3.5 w-3.5" />
            <span>{notices.length} notice{notices.length !== 1 ? 's' : ''}</span>
          </div>
        </motion.div>

        {/* ── Search ── */}
        <motion.div {...fadeUp(0.06)}>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notices…"
              className="w-full rounded-xl border border-white/10 bg-slate-900/80 py-2.5 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-600 backdrop-blur focus:border-purple-500/40 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
            />
          </div>
        </motion.div>

        {/* ── Notice list ── */}
        <motion.div {...fadeUp(0.1)}>
          <AnimatePresence mode="popLayout">
            {notices.length ? (
              <div className="space-y-3">
                {notices.map((n, i) => (
                  <NoticeCard key={n.id} notice={n} onRemove={remove} index={i} />
                ))}
              </div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/10 bg-slate-900/50 py-20 backdrop-blur"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 ring-1 ring-white/10">
                  <MessageSquare className="h-6 w-6 text-slate-600" />
                </div>
                <p className="text-sm font-semibold text-slate-400">No notices found</p>
                <p className="text-xs text-slate-600">Try adjusting your search query</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}