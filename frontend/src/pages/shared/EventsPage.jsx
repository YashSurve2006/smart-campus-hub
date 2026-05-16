import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { Calendar, MapPin, Plus, Star, Trash2, Users } from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';

export default function EventsPage() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role;
  const [events, setEvents] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'general',
    location: '',
    startsAt: '',
    endsAt: '',
    targetRole: 'all',
    isFeatured: false,
    maxAttendees: '',
    bannerUrl: '',
  });
  const [bannerFile, setBannerFile] = useState(null);
  const [tab, setTab] = useState('upcoming');
  const [pendingEventId, setPendingEventId] = useState(null);
  const [creating, setCreating] = useState(false);
  const isDark = role === 'admin';
  const prefix = role === 'admin' ? '/admin' : role === 'faculty' ? '/faculty' : '/student';
  const apiBase = import.meta.env.VITE_API_BASE || '';

  const resolveAssetUrl = useCallback(
    (url) => {
      if (!url) return '';
      if (url.startsWith('http://') || url.startsWith('https://')) return url;
      return `${apiBase}${url}`;
    },
    [apiBase]
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: 80 };
      if (tab === 'upcoming') params.status = 'upcoming';
      if (tab === 'live') params.status = 'live';
      if (tab === 'past') params.status = 'past';
      const [fe, ev] = await Promise.all([
        api.get('/events/featured'),
        api.get('/events', { params }),
      ]);
      setFeatured(fe.data.events || []);
      setEvents(ev.data.events || []);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not load events');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  async function register(id) {
    try {
      setPendingEventId(id);
      await api.post(`/events/${id}/register`);
      toast.success('Registered!');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Registration failed');
    } finally {
      setPendingEventId(null);
    }
  }

  async function unregister(id) {
    try {
      setPendingEventId(id);
      await api.delete(`/events/${id}/register`);
      toast.success('Removed registration');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Could not unregister');
    } finally {
      setPendingEventId(null);
    }
  }

  async function removeEvent(id) {
    if (!confirm('Delete this event?')) return;
    try {
      setPendingEventId(id);
      await api.delete(`/events/${id}`);
      toast.success('Deleted');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Delete failed');
    } finally {
      setPendingEventId(null);
    }
  }

  async function uploadBannerIfNeeded() {
    if (!bannerFile) return form.bannerUrl || null;
    const fd = new FormData();
    fd.append('banner', bannerFile);
    const { data } = await api.post('/events/upload/banner', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.url;
  }

  function toSqlDatetime(v) {
    if (!v) return '';
    const s = v.includes('T') ? v.replace('T', ' ') : v;
    return s.length === 16 ? `${s}:00` : s;
  }

  async function submitCreate(e) {
    e.preventDefault();
    try {
      setCreating(true);
      const bannerUrl = await uploadBannerIfNeeded();
      await api.post('/events', {
        ...form,
        startsAt: toSqlDatetime(form.startsAt),
        endsAt: toSqlDatetime(form.endsAt),
        maxAttendees: form.maxAttendees ? Number(form.maxAttendees) : undefined,
        bannerUrl: bannerUrl || undefined,
      });
      toast.success('Event published');
      setCreateOpen(false);
      setBannerFile(null);
      setForm({
        title: '',
        description: '',
        category: 'general',
        location: '',
        startsAt: '',
        endsAt: '',
        targetRole: 'all',
        isFeatured: false,
        maxAttendees: '',
        bannerUrl: '',
      });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create event');
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Campus events</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Featured banners, registrations, and realtime reminders.
          </p>
        </div>
        {(role === 'faculty' || role === 'admin') && (
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            New event
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: 'upcoming', label: 'Upcoming' },
          { id: 'live', label: 'Live' },
          { id: 'past', label: 'Past' },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wide transition ${tab === t.id
                ? 'bg-slate-900 text-white shadow-md dark:bg-white dark:text-slate-900'
                : 'border border-slate-200 bg-white/80 text-slate-600 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-300'
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {featured.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-2">
          {featured.map((ev, i) => (
            <motion.div
              key={ev.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard
                className={`relative overflow-hidden p-0 dark:border-white/10 dark:bg-slate-900/60 ${ev.banner_url ? '' : ''
                  }`}
              >
                {ev.banner_url && (
                  <div
                    className="h-32 w-full bg-cover bg-center"
                    style={{ backgroundImage: `url(${resolveAssetUrl(ev.banner_url)})` }}
                  />
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-amber-600">
                    <Star className="h-3.5 w-3.5" />
                    Featured
                  </div>
                  <Link to={`${prefix}/events/${ev.id}`} className="mt-2 block">
                    <h2 className="text-lg font-semibold text-slate-900 hover:text-hub-purple dark:text-white dark:hover:text-hub-teal">
                      {ev.title}
                    </h2>
                  </Link>
                  <p className="mt-1 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <Calendar className="h-4 w-4" />
                    {new Date(ev.starts_at).toLocaleString()}
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <MapPin className="h-4 w-4" />
                    {ev.location}
                  </p>
                  {(role === 'student' || role === 'faculty') && (
                    <Button
                      className="mt-4 w-full sm:w-auto"
                      variant="ghost"
                      onClick={() => register(ev.id)}
                      disabled={pendingEventId === ev.id}
                    >
                      <Users className="h-4 w-4" />
                      Register
                    </Button>
                  )}
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {events.length === 0 ? (
        <EmptyState
          title="No upcoming events"
          description="When faculty or admins publish events, they will appear here with live notifications."
        />
      ) : (
        <div className="space-y-3">
          {events.map((ev) => (
            <GlassCard key={ev.id} className="p-4 dark:border-white/10 dark:bg-slate-900/50">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-hub-teal">{ev.category}</p>
                  <Link to={`${prefix}/events/${ev.id}`} className="text-lg font-semibold text-slate-900 hover:text-hub-purple dark:text-white dark:hover:text-hub-teal">
                    {ev.title}
                  </Link>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{ev.description?.slice(0, 160)}…</p>
                  <p className="mt-2 text-xs text-slate-500">
                    {new Date(ev.starts_at).toLocaleString()} · {ev.location} ·{' '}
                    {ev.registration_count ?? 0} registered
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(role === 'student' || role === 'faculty') && (
                    <>
                      <Button variant="ghost" onClick={() => register(ev.id)} disabled={pendingEventId === ev.id}>
                        Register
                      </Button>
                      <Button variant="ghost" onClick={() => unregister(ev.id)} disabled={pendingEventId === ev.id}>
                        Unregister
                      </Button>
                    </>
                  )}
                  {(role === 'admin' || role === 'faculty') && (
                    <button
                      type="button"
                      onClick={() => removeEvent(ev.id)}
                      disabled={pendingEventId === ev.id}
                      className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-semibold text-rose-600 dark:border-rose-900/50 dark:text-rose-400"
                    >
                      <Trash2 className="mr-1 inline h-4 w-4" />
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create campus event"
        dark={isDark}
        size="lg"
      >
        <form className="space-y-3" onSubmit={submitCreate}>
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Description</label>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white"
              >
                {['general', 'academic', 'cultural', 'sports', 'career'].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold">Audience</label>
              <select
                value={form.targetRole}
                onChange={(e) => setForm((f) => ({ ...f, targetRole: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white"
              >
                <option value="all">Everyone</option>
                <option value="student">Students</option>
                <option value="faculty">Faculty</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold">Location</label>
            <input
              required
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold">Starts</label>
              <input
                type="datetime-local"
                required
                value={form.startsAt}
                onChange={(e) => setForm((f) => ({ ...f, startsAt: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold">Ends</label>
              <input
                type="datetime-local"
                required
                value={form.endsAt}
                onChange={(e) => setForm((f) => ({ ...f, endsAt: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white"
              />
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold">Max attendees (optional)</label>
              <input
                type="number"
                min={1}
                value={form.maxAttendees}
                onChange={(e) => setForm((f) => ({ ...f, maxAttendees: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-white/10 dark:bg-slate-950 dark:text-white"
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                id="feat"
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
              />
              <label htmlFor="feat" className="text-sm">
                Featured banner
              </label>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold">Banner image (PNG/JPG/WebP)</label>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={(e) => setBannerFile(e.target.files?.[0] || null)}
              className="mt-1 w-full text-sm"
            />
          </div>
          <Button type="submit" className="w-full sm:w-auto" disabled={creating}>
            {creating ? 'Publishing...' : 'Publish event'}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
