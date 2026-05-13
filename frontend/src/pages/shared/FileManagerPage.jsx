import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  FileStack, Trash2, Image, FileText, FileVideo,
  File, HardDrive, FolderOpen, Clock, Shield,
  LayoutGrid, List, RefreshCw,
} from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { GlassCard } from '../../components/ui/GlassCard';

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
      backgroundImage: `linear-gradient(rgba(20,184,166,1) 1px,transparent 1px),linear-gradient(90deg,rgba(20,184,166,1) 1px,transparent 1px)`,
      backgroundSize: '48px 48px',
    }}
  />
);

/* ─── Scope meta ────────────────────────────────────────────── */
const SCOPE_META = {
  avatar: { icon: Image, color: 'from-blue-500/20 to-cyan-500/10', dot: 'bg-blue-400', badge: 'bg-blue-500/15 text-blue-300', label: 'Avatar' },
  notice: { icon: FileText, color: 'from-purple-500/20 to-violet-500/10', dot: 'bg-purple-400', badge: 'bg-purple-500/15 text-purple-300', label: 'Notice' },
  banner: { icon: Image, color: 'from-amber-500/20 to-orange-500/10', dot: 'bg-amber-400', badge: 'bg-amber-500/15 text-amber-300', label: 'Banner' },
  attachment: { icon: File, color: 'from-teal-500/20 to-emerald-500/10', dot: 'bg-teal-400', badge: 'bg-teal-500/15 text-teal-300', label: 'Attachment' },
  video: { icon: FileVideo, color: 'from-rose-500/20 to-pink-500/10', dot: 'bg-rose-400', badge: 'bg-rose-500/15 text-rose-300', label: 'Video' },
};

const getScopeMeta = (scope = '') => SCOPE_META[scope.toLowerCase()] || {
  icon: File,
  color: 'from-slate-500/20 to-slate-400/10',
  dot: 'bg-slate-400',
  badge: 'bg-slate-700 text-slate-300',
  label: scope || 'File',
};

const getMimeIcon = (mime = '') => {
  if (mime.startsWith('image/')) return Image;
  if (mime.startsWith('video/')) return FileVideo;
  if (mime.includes('pdf') || mime.includes('text')) return FileText;
  return File;
};

const formatBytes = (bytes) => {
  const b = Number(bytes);
  if (b >= 1024 * 1024) return `${(b / 1024 / 1024).toFixed(1)} MB`;
  if (b >= 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${b} B`;
};

/* ─── Storage stat card ─────────────────────────────────────── */
const StatCard = ({ scope, cnt, bytes, delay }) => {
  const meta = getScopeMeta(scope);
  const Icon = meta.icon;
  return (
    <motion.div
      {...fadeUp(delay)}
      whileHover={{ y: -3, scale: 1.02 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/80 p-4 backdrop-blur-xl transition-all duration-300 hover:border-white/20"
    >
      <div className={`absolute -right-5 -top-5 h-20 w-20 rounded-full bg-gradient-to-br ${meta.color} opacity-40 blur-2xl transition-all duration-500 group-hover:opacity-70`} />
      <div className="relative flex items-start justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${meta.color} ring-1 ring-white/10`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${meta.badge}`}>
          {meta.label}
        </span>
      </div>
      <div className="relative mt-3">
        <p className="text-2xl font-black text-white">{cnt}</p>
        <p className="text-[11px] font-semibold text-slate-400">
          {cnt === 1 ? 'file' : 'files'} · {formatBytes(bytes)}
        </p>
      </div>
      <div className={`absolute bottom-0 left-0 h-[2px] w-0 rounded-full bg-gradient-to-r ${meta.color} transition-all duration-500 group-hover:w-full`} />
    </motion.div>
  );
};

/* ─── File row (list view) ──────────────────────────────────── */
const FileRow = ({ file, onRemove, deletingId, index }) => {
  const meta = getScopeMeta(file.scope);
  const MimeIcon = getMimeIcon(file.mime_type);
  const isDeleting = deletingId === file.id;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: isDeleting ? 0 : 1, x: isDeleting ? -16 : 0, scale: isDeleting ? 0.97 : 1 }}
      exit={{ opacity: 0, x: -16, scale: 0.97 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
      className={`group relative flex flex-wrap items-center justify-between gap-3 overflow-hidden rounded-2xl border bg-slate-900/85 p-4 backdrop-blur-xl transition-all duration-300 hover:bg-slate-800/80 border-white/10 hover:border-white/20`}
    >
      {/* Left accent */}
      <div className={`absolute left-0 top-0 h-full w-1 ${meta.dot} opacity-70`} />

      <div className="flex min-w-0 flex-1 items-center gap-3 pl-2">
        {/* Icon */}
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${meta.color} ring-1 ring-white/10`}>
          <MimeIcon className="h-4.5 w-4.5 text-white" />
        </div>

        {/* Info */}
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-200">{file.original_name}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-slate-500">
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${meta.badge}`}>
              {meta.label}
            </span>
            <span className="flex items-center gap-1">
              <Shield className="h-2.5 w-2.5" />{file.mime_type}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" />{new Date(file.created_at).toLocaleString()}
            </span>
            {file.bytes && (
              <span className="flex items-center gap-1">
                <HardDrive className="h-2.5 w-2.5" />{formatBytes(file.bytes)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Delete */}
      {file.scope !== 'avatar' && (
        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.93 }}
          disabled={isDeleting}
          onClick={() => {
            if (confirm('Delete this file record and storage?')) onRemove(file.id);
          }}
          className="flex shrink-0 items-center gap-1.5 rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-400 transition-all duration-200 hover:border-rose-500/50 hover:bg-rose-500/20 hover:text-rose-300 disabled:opacity-40"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {isDeleting ? 'Removing…' : 'Delete'}
        </motion.button>
      )}
      {file.scope === 'avatar' && (
        <span className="flex items-center gap-1 rounded-xl border border-white/8 bg-slate-800/50 px-3 py-1.5 text-[10px] font-semibold text-slate-500">
          <Shield className="h-3 w-3" /> Protected
        </span>
      )}
    </motion.div>
  );
};

/* ─── File grid card ────────────────────────────────────────── */
const FileCard = ({ file, onRemove, deletingId, index }) => {
  const meta = getScopeMeta(file.scope);
  const MimeIcon = getMimeIcon(file.mime_type);
  const isDeleting = deletingId === file.id;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: isDeleting ? 0 : 1, scale: isDeleting ? 0.9 : 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: index * 0.04 }}
      whileHover={{ y: -4 }}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/85 p-4 backdrop-blur-xl transition-all duration-300 hover:border-white/20"
    >
      <div className={`absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br ${meta.color} opacity-30 blur-2xl transition-all duration-500 group-hover:opacity-60`} />

      <div className="relative">
        <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${meta.color} ring-1 ring-white/10`}>
          <MimeIcon className="h-6 w-6 text-white" />
        </div>
        <p className="truncate text-sm font-bold text-slate-200">{file.original_name}</p>
        <div className="mt-1.5 flex flex-wrap gap-1">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${meta.badge}`}>{meta.label}</span>
          {file.bytes && (
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">
              {formatBytes(file.bytes)}
            </span>
          )}
        </div>
        <p className="mt-2 text-[10px] text-slate-600">{new Date(file.created_at).toLocaleString()}</p>
      </div>

      {file.scope !== 'avatar' ? (
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.95 }}
          disabled={isDeleting}
          onClick={() => { if (confirm('Delete this file?')) onRemove(file.id); }}
          className="relative mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 py-1.5 text-xs font-semibold text-rose-400 transition-all hover:bg-rose-500/20 disabled:opacity-40"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {isDeleting ? 'Removing…' : 'Delete'}
        </motion.button>
      ) : (
        <div className="relative mt-3 flex w-full items-center justify-center gap-1 rounded-xl border border-white/8 bg-slate-800/40 py-1.5 text-[10px] font-semibold text-slate-600">
          <Shield className="h-3 w-3" /> Protected
        </div>
      )}
    </motion.div>
  );
};

/* ─── Shimmer ───────────────────────────────────────────────── */
const Shimmer = ({ count = 4 }) => (
  <div className="space-y-3">
    {[...Array(count)].map((_, i) => (
      <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-800/50" />
    ))}
  </div>
);

/* ─── Main component ────────────────────────────────────────── */
export default function FileManagerPage() {
  const role = useAuthStore((s) => s.user?.role);
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'grid'
  const [refreshing, setRefreshing] = useState(false);

  async function load(silent = false) {
    try {
      if (!silent) setLoading(true); else setRefreshing(true);
      const [f, s] = await Promise.all([
        api.get('/api/file-registry/me'),
        api.get('/api/file-registry/me/stats'),
      ]);
      setFiles(f.data.files || []);
      setStats(s.data.stats || []);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not load files');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function remove(id) {
    try {
      setDeletingId(id);
      await api.delete(`/api/file-registry/me/${id}`);
      toast.success('Removed');
      await load(true);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Delete failed');
    } finally {
      setDeletingId(null);
    }
  }

  const totalFiles = stats.reduce((s, r) => s + Number(r.cnt || 0), 0);
  const totalBytes = stats.reduce((s, r) => s + Number(r.bytes || 0), 0);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-slate-950">
      <Orb className="h-[480px] w-[480px] -left-40 -top-24 bg-teal-600/25" />
      <Orb className="h-72 w-72 right-0 top-32 bg-cyan-600/18" />
      <Orb className="h-56 w-56 bottom-40 left-1/2 bg-indigo-600/15" />
      <GridTexture />

      <div className="relative space-y-7 p-4 md:p-6">

        {/* ── Header ── */}
        <motion.div {...fadeUp(0)} className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="relative">
            <div className="pointer-events-none absolute -left-4 -top-4 h-20 w-48 rounded-full bg-teal-500/10 blur-2xl" />
            <p className="text-[11px] font-semibold uppercase tracking-widest text-teal-400">
              {role === 'admin' ? 'Admin' : 'My Files'} · File Registry
            </p>
            <h1 className="mt-1 text-4xl font-black tracking-tight text-white">
              File Manager
            </h1>
            <p className="mt-1.5 text-sm text-slate-400">
              Uploads you own — notice attachments, banners, avatars. Remove non-avatar files here.
            </p>
          </div>

          {/* Header actions */}
          <div className="flex items-center gap-2">
            {/* Total summary pill */}
            <div className="flex items-center gap-2 rounded-xl border border-teal-500/50 bg-teal-500/20 px-3 py-2 text-xs font-semibold text-teal-200 backdrop-blur">
              <HardDrive className="h-3.5 w-3.5" />
              {totalFiles} files · {formatBytes(totalBytes)}
            </div>

            {/* View toggle */}
            <div className="flex overflow-hidden rounded-xl border border-white/10 bg-slate-900/60">
              {[['list', List], ['grid', LayoutGrid]].map(([mode, Icon]) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold transition-all ${viewMode === mode
                      ? 'bg-teal-500/20 text-teal-300'
                      : 'text-slate-500 hover:text-slate-300'
                    }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>

            {/* Refresh */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => load(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-800/60 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-white/20 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </motion.button>
          </div>
        </motion.div>

        {/* ── Storage stats ── */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/15 ring-1 ring-teal-500/30">
              <FileStack className="h-3.5 w-3.5 text-teal-400" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Storage by type</p>
          </div>
          {loading ? (
            <div className="grid gap-3 sm:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-800/50" />
              ))}
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {stats.map((s, i) => (
                <StatCard key={s.scope} scope={s.scope} cnt={s.cnt} bytes={s.bytes} delay={i * 0.05} />
              ))}
              {!stats.length && (
                <p className="text-sm text-slate-400">No storage data yet.</p>
              )}
            </div>
          )}
        </div>

        {/* ── File list / grid ── */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 ring-1 ring-white/10">
                <FolderOpen className="h-3.5 w-3.5 text-slate-400" />
              </div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Your files
                <span className="ml-2 rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-400">{files.length}</span>
              </p>
            </div>
          </div>

          {loading ? (
            <Shimmer count={4} />
          ) : files.length ? (
            <AnimatePresence mode="popLayout">
              {viewMode === 'list' ? (
                <div className="space-y-2.5">
                  {files.map((f, i) => (
                    <FileRow key={f.id} file={f} onRemove={remove} deletingId={deletingId} index={i} />
                  ))}
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {files.map((f, i) => (
                    <FileCard key={f.id} file={f} onRemove={remove} deletingId={deletingId} index={i} />
                  ))}
                </div>
              )}
            </AnimatePresence>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/10 bg-slate-900/50 py-20 backdrop-blur"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 ring-1 ring-white/10">
                <FolderOpen className="h-6 w-6 text-slate-600" />
              </div>
              <p className="text-sm font-semibold text-slate-400">No tracked uploads yet</p>
              <p className="text-xs text-slate-600">Files will appear here once you upload them</p>
            </motion.div>
          )}
        </div>

      </div>
    </div>
  );
}