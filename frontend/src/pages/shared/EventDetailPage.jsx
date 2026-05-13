import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  ArrowLeft,
  Calendar,
  Download,
  MapPin,
  QrCode,
  Users,
} from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';

function basePath(role) {
  if (role === 'admin') return '/admin';
  if (role === 'faculty') return '/faculty';
  return '/student';
}

function eventPhase(starts, ends) {
  const now = Date.now();
  const s = new Date(starts).getTime();
  const e = new Date(ends).getTime();
  if (now < s) return { label: 'Upcoming', cls: 'bg-hub-blue/15 text-hub-blue' };
  if (now <= e) return { label: 'Live now', cls: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300' };
  return { label: 'Past', cls: 'bg-slate-500/15 text-slate-600 dark:text-slate-400' };
}

export default function EventDetailPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const role = user?.role;
  const prefix = basePath(role);

  const [data, setData] = useState(null);
  const [regs, setRegs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  async function load() {
    setLoading(true);
    try {
      const { data: res } = await api.get(`/api/events/${eventId}`);
      setData(res);
      setRegs([]);
      if (
        role === 'admin' ||
        (role === 'faculty' && Number(res.event?.created_by) === Number(user?.id))
      ) {
        const r = await api.get(`/api/events/${eventId}/registrations`);
        setRegs(r.data.registrations || []);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Event not found');
      navigate(`${prefix}/events`);
    } finally {
      setLoading(false);
    }
  }

  async function downloadAttendees() {
    try {
      const res = await api.get(`/api/events/${eventId}/registrations/export`, {
        responseType: 'blob',
      });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `event-${eventId}-attendees.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Export failed');
    }
  }

  useEffect(() => {
    load();
  }, [eventId]);

  const countdown = useMemo(() => {
    if (!data?.event) return null;
    const s = new Date(data.event.starts_at).getTime();
    const diff = s - now;
    if (diff <= 0) return null;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const sec = Math.floor((diff % 60000) / 1000);
    return `${h}h ${m}m ${sec}s`;
  }, [data, now]);

  async function register() {
    try {
      await api.post(`/api/events/${eventId}/register`);
      toast.success('Registered');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    }
  }

  async function unregister() {
    try {
      await api.delete(`/api/events/${eventId}/register`);
      toast.success('Unregistered');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed');
    }
  }

  if (loading || !data?.event) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  const ev = data.event;
  const phase = eventPhase(ev.starts_at, ev.ends_at);
  const canRegister = role === 'student' || role === 'faculty';
  const qrUrl = data.ticket?.registration_code
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
        `SCH-EVT:${ev.id}:${data.ticket.registration_code}`
      )}`
    : null;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          to={`${prefix}/events`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-hub-blue hover:underline dark:text-hub-teal"
        >
          <ArrowLeft className="h-4 w-4" />
          All events
        </Link>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard className="overflow-hidden p-0 dark:border-white/10 dark:bg-slate-900/50">
          {ev.banner_url && (
            <div
              className="h-48 w-full bg-cover bg-center"
              style={{
                backgroundImage: `url(${
                  ev.banner_url.startsWith('http')
                    ? ev.banner_url
                    : `${import.meta.env.VITE_API_BASE || ''}${ev.banner_url}`
                })`,
              }}
            />
          )}
          <div className="p-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${phase.cls}`}>
                {phase.label}
              </span>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                {ev.category}
              </span>
              {countdown && (
                <span className="rounded-full bg-hub-purple/15 px-2 py-0.5 text-[10px] font-bold text-hub-purple">
                  Starts in {countdown}
                </span>
              )}
            </div>
            <h1 className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">{ev.title}</h1>
            <p className="mt-3 flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <Calendar className="h-4 w-4" />
              {new Date(ev.starts_at).toLocaleString()} — {new Date(ev.ends_at).toLocaleString()}
            </p>
            <p className="mt-1 flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <MapPin className="h-4 w-4" />
              {ev.location}
            </p>
            <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              <Users className="h-4 w-4" />
              {ev.registration_count ?? 0} registered
              {ev.max_attendees ? ` / cap ${ev.max_attendees}` : ''}
            </p>
            <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {ev.description}
            </p>

            {canRegister && phase.label !== 'Past' && (
              <div className="mt-6 flex flex-wrap gap-2">
                {!data.registered ? (
                  <Button onClick={register}>Register</Button>
                ) : (
                  <>
                    <Button variant="ghost" onClick={unregister}>
                      Unregister
                    </Button>
                    {qrUrl && (
                      <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/40 p-3 dark:border-white/10">
                        <QrCode className="h-5 w-5 text-hub-teal" />
                        <img src={qrUrl} alt="Registration QR" className="h-24 w-24 rounded-lg bg-white p-1" />
                        <div className="text-xs text-slate-500">
                          <p className="font-mono text-[10px] text-slate-400">{data.ticket?.registration_code}</p>
                          <p>Show at check-in (demo encoding).</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {(role === 'faculty' || role === 'admin') &&
              (Number(ev.created_by) === Number(user?.id) || role === 'admin') &&
              regs.length > 0 && (
                <div className="mt-8 border-t border-slate-100 pt-6 dark:border-white/10">
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Attendees</h2>
                    <button
                      type="button"
                      onClick={downloadAttendees}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-hub-blue dark:text-hub-teal"
                    >
                      <Download className="h-4 w-4" />
                      CSV
                    </button>
                  </div>
                  <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto text-sm text-slate-600 dark:text-slate-400">
                    {regs.map((r) => (
                      <li key={r.id}>
                        {r.first_name} {r.last_name} · {r.email}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
