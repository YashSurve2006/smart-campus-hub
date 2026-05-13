import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  Bookmark,
  CheckCircle2,
  Circle,
  Filter,
  Search,
  Sparkles,
  X,
} from 'lucide-react';
import api from '../../services/api';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { NoticeAttachmentManager } from '../../components/notices/NoticeAttachmentManager';

const categories = [
  { id: '', label: 'All categories' },
  { id: 'general', label: 'General' },
  { id: 'academic', label: 'Academic' },
  { id: 'exam', label: 'Exam' },
  { id: 'hostel', label: 'Hostel' },
  { id: 'placement', label: 'Placement' },
  { id: 'other', label: 'Other' },
];

const priorities = [
  { id: '', label: 'Any priority' },
  { id: 'normal', label: 'Normal' },
  { id: 'high', label: 'High' },
  { id: 'urgent', label: 'Urgent' },
];

function priorityBadge(p) {
  const map = {
    urgent: 'bg-rose-500/15 text-rose-700 dark:text-rose-300',
    high: 'bg-amber-500/15 text-amber-800 dark:text-amber-200',
    normal: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
  };
  return map[p] || map.normal;
}

export default function StudentNoticesPage() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [detail, setDetail] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, unreadRes] = await Promise.all([
        api.get('/api/notices', {
          params: {
            search: search || undefined,
            noticeCategory: category || undefined,
            priority: priority || undefined,
            favoritesOnly: favoritesOnly ? 1 : undefined,
            unreadOnly: unreadOnly ? 1 : undefined,
            limit: 60,
          },
        }),
        api.get('/api/notices/meta/unread-count'),
      ]);
      setNotices(listRes.data.notices || []);
      setUnreadCount(unreadRes.data.unreadCount ?? 0);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not load notices');
    } finally {
      setLoading(false);
    }
  }, [search, category, priority, favoritesOnly, unreadOnly]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onDash = () => load();
    window.addEventListener('sch:dashboard-refresh', onDash);
    return () => window.removeEventListener('sch:dashboard-refresh', onDash);
  }, [load]);

  async function openDetail(n) {
    setDetail(n);
    try {
      await api.post(`/api/notices/${n.id}/read`);
      load();
    } catch {
      /* ignore */
    }
  }

  async function toggleFavorite(n, e) {
    e?.stopPropagation();
    try {
      if (Number(n.is_favorite)) {
        await api.delete(`/api/notices/${n.id}/favorite`);
        toast.success('Removed from saved');
      } else {
        await api.post(`/api/notices/${n.id}/favorite`);
        toast.success('Saved');
      }
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Notice center</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Search, filter, save favorites, and track unread — {unreadCount} unread.
          </p>
        </div>
        <Link
          to="/student/dashboard"
          className="text-sm font-semibold text-hub-blue hover:underline dark:text-hub-teal"
        >
          ← Dashboard
        </Link>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search titles and body…"
            className="w-full rounded-xl border border-slate-200 bg-white/90 py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-hub-purple/35 dark:border-white/10 dark:bg-slate-950 dark:text-white"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white"
          >
            {categories.map((c) => (
              <option key={c.id || 'all'} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white"
          >
            {priorities.map((p) => (
              <option key={p.id || 'any'} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={unreadOnly ? 'primary' : 'ghost'}
            className="py-1.5 text-xs"
            onClick={() => setUnreadOnly((v) => !v)}
          >
            Unread only
          </Button>
          <Button
            type="button"
            variant={favoritesOnly ? 'primary' : 'ghost'}
            className="py-1.5 text-xs"
            onClick={() => setFavoritesOnly((v) => !v)}
          >
            <Bookmark className="h-3.5 w-3.5" />
            Saved
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-3 md:grid-cols-2">
          <Skeleton className="h-36" />
          <Skeleton className="h-36" />
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {notices.map((n, i) => (
            <motion.div
              key={n.id}
              role="button"
              tabIndex={0}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => openDetail(n)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') openDetail(n);
              }}
              aria-label={`Open notice: ${n.title}`}
              className="text-left"
            >
              <GlassCard className="h-full border-white/60 p-4 transition-shadow hover:shadow-lg dark:border-white/10 dark:bg-slate-900/50">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      {!Number(n.is_read) ? (
                        <Circle className="h-3.5 w-3.5 shrink-0 text-hub-purple" title="Unread" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-hub-teal" title="Read" />
                      )}
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${priorityBadge(n.priority)}`}
                      >
                        {n.priority || 'normal'}
                      </span>
                      <span className="text-[10px] font-bold uppercase text-slate-500">
                        {n.notice_category || 'general'}
                      </span>
                    </div>
                    <h2 className="mt-2 font-semibold text-slate-900 dark:text-white">{n.title}</h2>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">{n.body}</p>
                    <p className="mt-2 text-xs text-slate-500">
                      {n.author_first_name} {n.author_last_name} · {new Date(n.created_at).toLocaleString()}
                      {Number(n.attachment_count) > 0 && ` · ${n.attachment_count} attachment(s)`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => toggleFavorite(n, e)}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10"
                    aria-label="Toggle favorite"
                  >
                    <Bookmark
                      className={`h-5 w-5 ${Number(n.is_favorite) ? 'fill-hub-purple text-hub-purple' : ''}`}
                    />
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && !notices.length && (
        <GlassCard className="p-10 text-center text-slate-500 dark:text-slate-400">
          <Sparkles className="mx-auto mb-2 h-8 w-8 text-hub-purple" />
          No notices match your filters.
        </GlassCard>
      )}

      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.title || ''} size="lg">
        {detail && (
          <div className="space-y-3 text-slate-700 dark:text-slate-200">
            <p className="text-xs text-slate-500">
              {detail.author_first_name} {detail.author_last_name} ·{' '}
              {new Date(detail.created_at).toLocaleString()}
            </p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{detail.body}</p>
            <div className="border-t border-slate-100 pt-3 dark:border-white/10">
              <p className="mb-2 text-xs font-semibold uppercase text-slate-500">Attachments</p>
              <NoticeAttachmentManager noticeId={detail.id} readOnly />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={() => toggleFavorite(detail)}>
                <Bookmark className="h-4 w-4" />
                {Number(detail.is_favorite) ? 'Remove save' : 'Save notice'}
              </Button>
              <Button type="button" variant="ghost" onClick={() => setDetail(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
