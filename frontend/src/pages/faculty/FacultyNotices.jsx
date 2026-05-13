/**
 * FacultyNotices — Enterprise upgrade.
 * Previous: text-slate-900 headings, border-slate-200/bg-white/90 inputs, 
 *           hub-teal/amber-800 badge colors — full light theme.
 * Now: dark ent-input form, priority badges using status utilities,
 *      notice card with target/category/priority chips, search bar darkened,
 *      skeleton loading, PageHeader, char counter for body.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { Megaphone, Search, Plus, X, Clock, Send } from 'lucide-react';
import api from '../../services/api';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { PageHeader } from '../../components/ui/PageHeader';
import { Skeleton } from '../../components/ui/Skeleton';
import { Orb, GridTexture, fadeUp } from '../../utils/animations';

/* ── Priority badge ── */
function PriorityBadge({ priority }) {
  const map = {
    urgent: 'bg-rose-500/15 text-rose-400 border-rose-500/25',
    high:   'bg-amber-500/15 text-amber-400 border-amber-500/25',
    normal: 'bg-slate-700/40 text-slate-500 border-slate-700/40',
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${map[priority] || map.normal}`}>
      {priority}
    </span>
  );
}

/* ── Target badge ── */
function TargetBadge({ role }) {
  const map = {
    all:     'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
    student: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    faculty: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${map[role] || map.all}`}>
      {role === 'all' ? 'Everyone' : role}
    </span>
  );
}

/* ── Notice card ── */
function NoticeCard({ notice, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group rounded-2xl border border-slate-800/60 bg-slate-900/50 p-4 transition-all hover:border-indigo-500/20 hover:bg-indigo-500/[0.02]"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition leading-snug">
          {notice.title}
        </p>
        <PriorityBadge priority={notice.priority} />
      </div>
      <p className="mt-1 text-xs text-slate-500 line-clamp-2">{notice.body}</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <TargetBadge role={notice.target_role} />
        {notice.notice_category && (
          <span className="rounded-full border border-slate-700/40 bg-slate-700/30 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">
            {notice.notice_category}
          </span>
        )}
        <span className="ml-auto flex items-center gap-1 text-[10px] text-slate-600">
          <Clock className="h-3 w-3" />
          {new Date(notice.created_at).toLocaleDateString()}
        </span>
      </div>
    </motion.div>
  );
}

/* ── Compose form ── */
const EMPTY = { title: '', body: '', targetRole: 'all', noticeCategory: 'general', priority: 'normal' };

export default function FacultyNotices() {
  const [notices,   setNotices]   = useState([]);
  const [search,    setSearch]    = useState('');
  const [form,      setForm]      = useState(EMPTY);
  const [loading,   setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm,  setShowForm]  = useState(false);
  const searchRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/api/notices', { params: { search: search || undefined } });
      setNotices(data.notices || []);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(load, search ? 350 : 0);
    return () => clearTimeout(t);
  }, [load]);

  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  async function submit(e) {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.post('/api/notices', form);
      toast.success('Notice published successfully');
      setForm(EMPTY);
      setShowForm(false);
      setLoading(true);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish notice');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative space-y-8">
      <Orb className="h-80 w-80 -left-20 -top-16 bg-violet-600/10" />
      <Orb className="h-64 w-64 right-0 top-24 bg-indigo-600/8" />
      <GridTexture />

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <PageHeader
          breadcrumb="Faculty · Notices"
          title="Notice Board"
          subtitle="Broadcast to all campus, students only, or faculty only."
        />
        <Button
          variant={showForm ? 'danger' : 'primary'}
          size="sm"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? <><X className="h-3.5 w-3.5" /> Cancel</> : <><Plus className="h-3.5 w-3.5" /> Compose</>}
        </Button>
      </div>

      {/* Compose form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            key="compose"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <GlassCard noPadding noAnimation>
              <div className="border-b border-slate-800/60 px-5 py-4">
                <h2 className="flex items-center gap-2 text-sm font-bold text-white">
                  <Megaphone className="h-4 w-4 text-violet-400" /> Compose Notice
                </h2>
              </div>
              <form className="space-y-4 p-5" onSubmit={submit}>
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Title *
                  </label>
                  <input
                    required
                    {...field('title')}
                    placeholder="e.g. Exam schedule update"
                    className="ent-input"
                    maxLength={255}
                  />
                </div>

                {/* Body */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Details *
                    </label>
                    <span className="text-[10px] text-slate-600">{form.body.length}/2000</span>
                  </div>
                  <textarea
                    required
                    rows={4}
                    {...field('body')}
                    placeholder="Detailed notice content…"
                    className="ent-input resize-none"
                    maxLength={2000}
                  />
                </div>

                {/* Row: Audience + Category + Priority */}
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Audience
                    </label>
                    <select {...field('targetRole')} className="ent-select">
                      <option value="all">Everyone</option>
                      <option value="student">Students only</option>
                      <option value="faculty">Faculty only</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Category
                    </label>
                    <select {...field('noticeCategory')} className="ent-select">
                      <option value="general">General</option>
                      <option value="academic">Academic</option>
                      <option value="exam">Exam</option>
                      <option value="hostel">Hostel</option>
                      <option value="placement">Placement</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Priority
                    </label>
                    <select {...field('priority')} className="ent-select">
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <Button type="submit" loading={submitting} size="md">
                  <Send className="h-4 w-4" />
                  Publish Notice
                </Button>
              </form>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <motion.div {...fadeUp(0.06)} className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 pointer-events-none" />
        <input
          ref={searchRef}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search notices by title or content…"
          className="ent-input pl-10"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-300 transition"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </motion.div>

      {/* Notice list */}
      <div>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-800/60 bg-slate-900/50 p-4 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <Skeleton className="h-4 w-48" rounded="rounded-full" />
                  <Skeleton className="h-5 w-14" rounded="rounded-full" />
                </div>
                <Skeleton className="h-3 w-full" rounded="rounded-full" />
                <Skeleton className="h-3 w-3/4" rounded="rounded-full" />
                <div className="flex gap-2 mt-2">
                  <Skeleton className="h-4 w-16" rounded="rounded-full" />
                  <Skeleton className="h-4 w-20" rounded="rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : notices.length > 0 ? (
          <div className="space-y-3">
            {notices.map((n, i) => <NoticeCard key={n.id} notice={n} index={i} />)}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-800 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/40">
              <Megaphone className="h-7 w-7 text-slate-600" />
            </div>
            <p className="text-sm font-semibold text-slate-400">
              {search ? 'No notices match your search' : 'No notices published yet'}
            </p>
            <p className="text-xs text-slate-600">
              {search ? 'Try different keywords' : 'Click Compose to post your first notice'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
