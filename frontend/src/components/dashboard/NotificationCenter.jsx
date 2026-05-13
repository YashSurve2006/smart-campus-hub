/**
 * NotificationCenter — Enterprise notification dropdown.
 * Improvements: AnimatePresence slide+fade, mark-all-read, better empty state,
 * notification type icons, improved accessibility, improved panel styling.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellDot, CheckCheck, ExternalLink, Inbox } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export function NotificationCenter({ dark = true }) {
  const user  = useAuthStore((s) => s.user);
  const [open,  setOpen]  = useState(false);
  const [items, setItems] = useState([]);
  const [marking, setMarking] = useState(false);
  const wrapRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/api/notifications');
      setItems(data.notifications || []);
    } catch { /* silent */ }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const on = () => load();
    window.addEventListener('sch:notify-refresh', on);
    return () => window.removeEventListener('sch:notify-refresh', on);
  }, [load]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const unread = items.filter((n) => !n.read_at).length;

  const prefix =
    user?.role === 'faculty' ? '/faculty'
    : user?.role === 'admin' ? '/admin'
    : '/student';

  async function markOne(id, e) {
    e.stopPropagation();
    try {
      await api.post(`/api/notifications/${id}/read`);
      setItems((prev) =>
        prev.map((n) => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
      );
    } catch {
      toast.error('Could not mark as read');
    }
  }

  async function markAll() {
    if (!unread || marking) return;
    setMarking(true);
    try {
      await Promise.all(
        items.filter((n) => !n.read_at).map((n) =>
          api.post(`/api/notifications/${n.id}/read`)
        )
      );
      setItems((prev) => prev.map((n) => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Could not mark all as read');
    } finally {
      setMarking(false);
    }
  }

  return (
    <div className="relative" ref={wrapRef}>
      {/* Trigger button */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((v) => !v)}
        className={[
          'relative inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold',
          'border border-white/10 bg-slate-900/80 text-slate-300',
          'backdrop-blur transition-all duration-200',
          'hover:border-white/20 hover:text-white',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500',
        ].join(' ')}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
      >
        {unread > 0 ? (
          <BellDot className="h-4 w-4 text-indigo-400" />
        ) : (
          <Bell className="h-4 w-4" />
        )}

        {/* Unread badge */}
        {unread > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-1.5 -top-1.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-indigo-500 px-1 text-[9px] font-black text-white"
          >
            {unread > 9 ? '9+' : unread}
          </motion.span>
        )}
      </motion.button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="notif-panel"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{   opacity: 0, y: -8, scale: 0.97  }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={[
              'absolute right-0 z-50 mt-2',
              'w-[min(100vw-2rem,22rem)]',
              'rounded-2xl border border-white/10',
              'bg-slate-950/95 backdrop-blur-2xl',
              'shadow-[0_20px_60px_rgba(0,0,0,0.6)]',
              'overflow-hidden',
            ].join(' ')}
          >
            {/* Panel header */}
            <div className="flex items-center justify-between gap-2 border-b border-white/8 px-4 py-3">
              <div className="flex items-center gap-2">
                <Bell className="h-3.5 w-3.5 text-slate-500" />
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Notifications
                </p>
                {unread > 0 && (
                  <span className="rounded-full bg-indigo-500/20 px-1.5 py-0.5 text-[10px] font-bold text-indigo-400">
                    {unread}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={markAll}
                    disabled={marking}
                    className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-semibold text-slate-400 transition hover:text-white"
                  >
                    <CheckCheck className="h-3 w-3" />
                    Mark all read
                  </motion.button>
                )}
                <Link
                  to={`${prefix}/notifications`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-1 text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 transition"
                >
                  View all
                  <ExternalLink className="h-2.5 w-2.5" />
                </Link>
              </div>
            </div>

            {/* Notification list */}
            <div className="scrollbar-thin max-h-80 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03]">
                    <Inbox className="h-5 w-5 text-slate-600" />
                  </div>
                  <p className="text-xs text-slate-500">No notifications yet.</p>
                </div>
              ) : (
                <div className="space-y-px p-2">
                  {items.slice(0, 8).map((n, i) => (
                    <motion.div
                      key={n.id}
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className={[
                        'group relative rounded-xl border px-3 py-2.5 transition-all duration-150',
                        !n.read_at
                          ? 'border-indigo-500/25 bg-indigo-500/[0.06] hover:bg-indigo-500/10'
                          : 'border-transparent bg-white/[0.02] hover:bg-white/[0.05]',
                      ].join(' ')}
                    >
                      {/* Unread dot */}
                      {!n.read_at && (
                        <span className="absolute right-3 top-3 h-1.5 w-1.5 rounded-full bg-indigo-400" />
                      )}

                      <p className={`text-xs font-semibold leading-snug ${!n.read_at ? 'text-white' : 'text-slate-300'}`}>
                        {n.title}
                      </p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500 line-clamp-2">
                        {n.message}
                      </p>
                      <div className="mt-1.5 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-slate-600">
                          {new Date(n.created_at).toLocaleString()}
                        </span>
                        {!n.read_at && (
                          <button
                            type="button"
                            onClick={(e) => markOne(n.id, e)}
                            className="invisible text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition group-hover:visible"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
