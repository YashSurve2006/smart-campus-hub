/**
 * NotificationsPage — Enterprise upgrade.
 * Previous: text-slate-900 heading, text-slate-600 body, bg-hub-blue/30 ring — all light theme.
 *           No skeleton, no empty state icon, no PageHeader.
 * Now: dark neon, skeleton loading, premium empty state, animated list,
 *      unread/read visual distinction, time-since helper, PageHeader.
 */
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { Bell, BellOff, Check, CheckCheck, Clock } from 'lucide-react';
import api from '../../services/api';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { Skeleton } from '../../components/ui/Skeleton';
import { Orb, GridTexture, fadeUp } from '../../utils/animations';

/* ── Time ago helper ── */
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (mins < 1)  return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

/* ── Notification type icon/color ── */
function typeStyle(type) {
  const map = {
    notice:      { color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
    attendance:  { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    result:      { color: 'text-violet-400', bg: 'bg-violet-500/10 border-violet-500/20' },
    event:       { color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
    alert:       { color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/20' },
    default:     { color: 'text-slate-400', bg: 'bg-slate-700/30 border-slate-700/50' },
  };
  return map[type] || map.default;
}

/* ── Notification skeleton ── */
function NotifSkeleton() {
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-slate-800/60 bg-slate-900/40 p-4">
      <Skeleton className="h-10 w-10 shrink-0" rounded="rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-48" rounded="rounded-full" />
        <Skeleton className="h-3 w-full" rounded="rounded-full" />
        <Skeleton className="h-3 w-24" rounded="rounded-full" />
      </div>
    </div>
  );
}

/* ── Single notification card ── */
function NotifCard({ n, onRead, index }) {
  const [reading, setReading] = useState(false);
  const isUnread = !n.read_at;
  const style = typeStyle(n.type);

  async function handleRead() {
    if (!isUnread) return;
    setReading(true);
    try {
      await api.post(`/api/notifications/${n.id}/read`);
      onRead(n.id);
    } catch {
      toast.error('Could not mark as read');
    } finally {
      setReading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8, height: 0, marginBottom: 0 }}
      transition={{ delay: index * 0.03 }}
      layout
    >
      <div
        className={[
          'group relative flex items-start gap-4 rounded-2xl border p-4 transition-all duration-200',
          isUnread
            ? 'border-indigo-500/20 bg-indigo-500/[0.04]'
            : 'border-slate-800/40 bg-slate-900/30 opacity-70',
        ].join(' ')}
      >
        {/* Unread dot */}
        {isUnread && (
          <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,0.7)]" />
        )}

        {/* Type icon */}
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${style.bg}`}>
          <Bell className={`h-4 w-4 ${style.color}`} />
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-semibold leading-snug ${isUnread ? 'text-white' : 'text-slate-400'}`}>
            {n.title}
          </p>
          <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">{n.message}</p>
          <div className="mt-2 flex items-center gap-3">
            <span className="flex items-center gap-1 text-[10px] text-slate-600">
              <Clock className="h-3 w-3" />
              {timeAgo(n.created_at)}
            </span>
            {n.type && (
              <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${style.bg} ${style.color}`}>
                {n.type}
              </span>
            )}
          </div>
        </div>

        {/* Mark read button */}
        {isUnread && (
          <Button
            variant="ghost"
            size="xs"
            loading={reading}
            onClick={handleRead}
            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Mark as read"
          >
            <Check className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export default function NotificationsPage() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/notifications');
      setItems(data.notifications || []);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const onRefresh = () => load();
    window.addEventListener('sch:notify-refresh', onRefresh);
    return () => window.removeEventListener('sch:notify-refresh', onRefresh);
  }, [load]);

  function handleRead(id) {
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
  }

  async function readAll() {
    try {
      setMarkingAll(true);
      await api.post('/api/notifications/read-all');
      setItems((prev) => prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Could not mark all as read');
    } finally {
      setMarkingAll(false);
    }
  }

  const unreadCount = items.filter((n) => !n.read_at).length;

  return (
    <div className="relative space-y-8">
      <Orb className="h-80 w-80 -left-20 -top-16 bg-indigo-600/10" />
      <Orb className="h-64 w-64 right-0 top-24 bg-violet-600/8" />
      <GridTexture />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          breadcrumb="Notifications"
          title="Notification Center"
          subtitle="Persisted in-app alerts plus real-time toasts while the app is open."
          badges={unreadCount > 0 ? [{ label: `${unreadCount} unread`, color: 'indigo', icon: Bell }] : []}
        />
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            loading={markingAll}
            onClick={readAll}
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </Button>
        )}
      </div>

      {/* List */}
      <motion.div {...fadeUp(0.06)}>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <NotifSkeleton key={i} />)}
          </div>
        ) : items.length > 0 ? (
          <AnimatePresence mode="popLayout">
            <div className="space-y-2.5">
              {items.map((n, i) => (
                <NotifCard key={n.id} n={n} onRead={handleRead} index={i} />
              ))}
            </div>
          </AnimatePresence>
        ) : (
          <GlassCard noAnimation>
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40">
                <BellOff className="h-8 w-8 text-slate-600" />
              </div>
              <p className="text-base font-semibold text-slate-400">You're all caught up</p>
              <p className="text-xs text-slate-600 max-w-xs">
                New notices, events, and alerts will appear here in real time.
              </p>
            </div>
          </GlassCard>
        )}
      </motion.div>
    </div>
  );
}
