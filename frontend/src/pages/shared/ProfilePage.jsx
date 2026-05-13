import { useEffect, useMemo, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import {
  Shield, Upload, User, CheckCircle2, XCircle, Eye, EyeOff,
  Clock, LogIn, Settings, Key, Camera, Zap, Star, Activity,
  ChevronRight, Lock, Unlock, AlertTriangle, Globe, Cpu,
} from 'lucide-react';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';

/* ─── password scoring ────────────────────────────────── */
function passwordScore(pw) {
  let s = 0;
  if (pw.length >= 8) s += 1;
  if (pw.length >= 12) s += 1;
  if (/[A-Z]/.test(pw)) s += 1;
  if (/[0-9]/.test(pw)) s += 1;
  if (/[^A-Za-z0-9]/.test(pw)) s += 1;
  return Math.min(s, 4);
}

const PW_META = [
  { label: 'Very Weak', color: '#ef4444', gradient: 'from-red-500 to-red-400' },
  { label: 'Weak', color: '#f97316', gradient: 'from-orange-500 to-amber-400' },
  { label: 'Fair', color: '#eab308', gradient: 'from-yellow-500 to-yellow-400' },
  { label: 'Good', color: '#22c55e', gradient: 'from-emerald-500 to-green-400' },
  { label: 'Strong', color: '#3b82f6', gradient: 'from-blue-500 to-cyan-400' },
];

const PW_REQS = [
  { label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { label: 'At least 12 characters', test: (pw) => pw.length >= 12 },
  { label: 'One uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { label: 'One number', test: (pw) => /[0-9]/.test(pw) },
  { label: 'One special character (!@#$…)', test: (pw) => /[^A-Za-z0-9]/.test(pw) },
];

/* ─── activity icon mapping ───────────────────────────── */
function activityIcon(action) {
  if (action.includes('login')) return { Icon: LogIn, color: 'text-emerald-400', bg: 'bg-emerald-400/10' };
  if (action.includes('password')) return { Icon: Key, color: 'text-amber-400', bg: 'bg-amber-400/10' };
  if (action.includes('avatar')) return { Icon: Camera, color: 'text-violet-400', bg: 'bg-violet-400/10' };
  if (action.includes('profile')) return { Icon: Settings, color: 'text-blue-400', bg: 'bg-blue-400/10' };
  return { Icon: Activity, color: 'text-slate-400', bg: 'bg-slate-400/10' };
}

function relativeTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

/* ─── stagger animation presets ──────────────────────── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: i * 0.07 },
  }),
};

/* ─── reusable premium input ─────────────────────────── */
function PremiumInput({ label, id, type = 'text', value, onChange, isDark, suffix, minLength }) {
  const [focused, setFocused] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const isPw = type === 'password';
  const inputType = isPw ? (showPw ? 'text' : 'password') : type;

  const base = isDark
    ? 'bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20'
    : 'bg-black/[0.03] border-black/[0.08] text-slate-900 placeholder:text-slate-400';

  const focusRing = isDark
    ? 'border-violet-500/60 shadow-[0_0_0_3px_rgba(139,92,246,0.15)]'
    : 'border-blue-400/60 shadow-[0_0_0_3px_rgba(59,130,246,0.12)]';

  return (
    <div className="group relative">
      <label
        htmlFor={id}
        className={`mb-1.5 block text-[11px] font-semibold tracking-widest uppercase transition-colors duration-200 ${focused
          ? isDark ? 'text-violet-400' : 'text-blue-500'
          : isDark ? 'text-white/40' : 'text-slate-500'
          }`}
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          minLength={minLength}
          className={`w-full rounded-xl border px-4 py-3 text-sm font-medium outline-none transition-all duration-200 ${base} ${focused ? focusRing : ''
            } ${isPw ? 'pr-11' : ''}`}
        />
        {isPw && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPw((v) => !v)}
            className={`absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${isDark ? 'text-white/30 hover:text-white/60' : 'text-slate-400 hover:text-slate-600'
              }`}
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
        {suffix}
      </div>
    </div>
  );
}

/* ─── section heading ─────────────────────────────────── */
function SectionHead({ icon: Icon, title, subtitle, isDark, accent = 'text-violet-400' }) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <div className={`mt-0.5 rounded-lg p-2 ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
        <Icon className={`h-4 w-4 ${accent}`} />
      </div>
      <div>
        <h2 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {title}
        </h2>
        {subtitle && (
          <p className={`mt-0.5 text-xs ${isDark ? 'text-white/40' : 'text-slate-500'}`}>{subtitle}</p>
        )}
      </div>
    </div>
  );
}

/* ─── main page ───────────────────────────────────────── */
export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const role = user?.role;
  const isDark = role === 'admin';

  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '', specialization: '',
    currentPassword: '', newPassword: '',
  });
  const [activity, setActivity] = useState([]);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [avatarDrag, setAvatarDrag] = useState(false);

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        specialization: user.profile?.specialization || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/api/users/activity');
        setActivity(data.activity || []);
      } catch { /* */ }
    })();
  }, []);

  async function refreshMe() {
    const { data } = await api.get('/api/auth/me');
    setUser(data.user);
  }

  async function saveProfile(e) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.patch('/api/users/profile', {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        specialization: role === 'faculty' ? form.specialization : undefined,
      });
      toast.success('Profile updated');
      await refreshMe();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSavingProfile(false);
    }
  }

  async function onAvatar(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const { data } = await api.post('/api/users/avatar', fd);
      setUser(data.user);
      toast.success('Avatar updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      e.target.value = '';
    }
  }

  async function changePassword(e) {
    e.preventDefault();
    setSavingPw(true);
    try {
      await api.post('/api/users/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success('Password changed');
      setForm((f) => ({ ...f, currentPassword: '', newPassword: '' }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not change password');
    } finally {
      setSavingPw(false);
    }
  }

  const pwScore = useMemo(() => passwordScore(form.newPassword), [form.newPassword]);
  const pwMeta = PW_META[pwScore] || PW_META[0];

  /* profile completeness */
  const completionFields = [
    user?.firstName, user?.lastName, user?.phone, user?.avatarUrl,
    user?.profile?.specialization || user?.profile?.departmentName,
  ];
  const completionPct = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100);

  /* role badge style */
  const roleBadge =
    role === 'admin' ? 'bg-violet-500/20 text-violet-300 border-violet-500/30' :
      role === 'faculty' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
        'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

  const cardBase = isDark
    ? 'bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl'
    : 'bg-white/80 border border-black/[0.06] backdrop-blur-xl shadow-sm';

  /* ── background gradient orbs ── */
  const Orbs = () => (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute -top-32 -left-32 h-[600px] w-[600px] rounded-full blur-[120px] ${isDark ? 'bg-violet-600/12' : 'bg-blue-300/25'
          }`}
      />
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
        className={`absolute -bottom-32 -right-32 h-[500px] w-[500px] rounded-full blur-[120px] ${isDark ? 'bg-blue-600/10' : 'bg-violet-300/20'
          }`}
      />
      <motion.div
        animate={{ x: [0, 20, 0], y: [0, 20, 0] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        className={`absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[150px] ${isDark ? 'bg-cyan-600/8' : 'bg-cyan-200/20'
          }`}
      />
    </div>
  );

  return (
    <div className={`relative pb-20 ${isDark ? 'text-white' : 'text-slate-900'}`}>
      <Orbs />

      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">

        {/* ── page heading ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold tracking-[0.2em] uppercase ${isDark ? 'text-violet-400/70' : 'text-blue-500/70'}`}>
              Account
            </span>
            <ChevronRight className={`h-3 w-3 ${isDark ? 'text-white/20' : 'text-slate-400'}`} />
            <span className={`text-[10px] font-bold tracking-[0.2em] uppercase ${isDark ? 'text-white/50' : 'text-slate-500'}`}>
              Profile
            </span>
          </div>
          <h1 className={`text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Profile &amp; Settings
          </h1>
          <p className={`mt-1 text-sm ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
            Manage your identity, security, and account activity.
          </p>
        </motion.div>

        {/* ── HERO PROFILE CARD ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}>
          <div className={`relative overflow-hidden rounded-2xl ${cardBase} p-6`}>
            {/* subtle header gradient */}
            <div className={`absolute inset-x-0 top-0 h-32 ${isDark
              ? 'bg-gradient-to-br from-violet-600/15 via-blue-600/10 to-transparent'
              : 'bg-gradient-to-br from-blue-100/80 via-violet-100/40 to-transparent'
              }`} />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start">
              {/* avatar */}
              <div className="group relative shrink-0">
                <motion.div
                  whileHover={{ scale: 1.04 }}
                  className="relative h-24 w-24"
                >
                  {/* glow ring */}
                  <motion.div
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className={`absolute -inset-1 rounded-2xl blur-md ${isDark ? 'bg-violet-500/30' : 'bg-blue-400/25'
                      }`}
                  />
                  <div className={`relative h-24 w-24 overflow-hidden rounded-2xl border ${isDark ? 'border-white/10' : 'border-black/10'
                    } bg-slate-800`}>
                    {user?.avatarUrl ? (
                      <img
                        src={`${import.meta.env.VITE_API_BASE || ''}${user.avatarUrl}`}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className={`flex h-full w-full items-center justify-center ${isDark ? 'bg-slate-800' : 'bg-slate-100'
                        }`}>
                        <User className={`h-10 w-10 ${isDark ? 'text-white/20' : 'text-slate-400'}`} />
                      </div>
                    )}
                    {/* hover overlay */}
                    <label className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-1 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                      <Camera className="h-5 w-5 text-white" />
                      <span className="text-[10px] font-semibold text-white">Change</span>
                      <input type="file" accept="image/*" className="hidden" onChange={onAvatar} />
                    </label>
                  </div>

                  {/* online pulse */}
                  <span className="absolute bottom-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-slate-900 bg-emerald-400">
                    <motion.span
                      animate={{ scale: [1, 1.8, 1], opacity: [0.8, 0, 0.8] }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                      className="absolute h-full w-full rounded-full bg-emerald-400"
                    />
                  </span>
                </motion.div>
              </div>

              {/* info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h2 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${roleBadge}`}>
                    <Star className="h-2.5 w-2.5" />
                    {user?.role}
                  </span>
                </div>
                <p className={`text-sm ${isDark ? 'text-white/40' : 'text-slate-500'}`}>{user?.email}</p>

                {user?.lastLoginAt && (
                  <p className={`mt-2 flex items-center gap-1.5 text-xs ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
                    <Clock className="h-3 w-3" />
                    Last login: {new Date(user.lastLoginAt).toLocaleString()}
                  </p>
                )}

                {user?.profile && (
                  <div className={`mt-3 flex flex-wrap gap-2`}>
                    {[
                      user.profile.departmentName && `${user.profile.departmentName}`,
                      user.profile.studentCode && `Code: ${user.profile.studentCode}`,
                      user.profile.employeeCode && `EMP: ${user.profile.employeeCode}`,
                      user.profile.designation && user.profile.designation,
                      user.profile.semester != null && `Sem ${user.profile.semester}`,
                    ].filter(Boolean).map((tag) => (
                      <span key={tag} className={`rounded-lg px-2.5 py-1 text-[11px] font-medium ${isDark ? 'bg-white/5 text-white/50' : 'bg-slate-100 text-slate-600'
                        }`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* completion ring — desktop */}
              <div className="hidden sm:flex flex-col items-center gap-1.5 shrink-0">
                <div className="relative h-14 w-14">
                  <svg className="h-14 w-14 -rotate-90" viewBox="0 0 56 56">
                    <circle cx="28" cy="28" r="22" strokeWidth="5"
                      className={isDark ? 'stroke-white/5' : 'stroke-slate-100'}
                      fill="none"
                    />
                    <motion.circle
                      cx="28" cy="28" r="22" strokeWidth="5"
                      fill="none"
                      stroke="url(#ring-grad)"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 22}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 22 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 22 * (1 - completionPct / 100) }}
                      transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
                    />
                    <defs>
                      <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <span className={`absolute inset-0 flex items-center justify-center text-[13px] font-black ${isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                    {completionPct}%
                  </span>
                </div>
                <p className={`text-[10px] text-center font-semibold tracking-wide ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
                  Profile<br />complete
                </p>
              </div>
            </div>

            {/* mobile completion bar */}
            <div className="mt-4 sm:hidden">
              <div className="mb-1 flex justify-between text-[10px] font-semibold">
                <span className={isDark ? 'text-white/40' : 'text-slate-500'}>Profile completion</span>
                <span className={isDark ? 'text-violet-400' : 'text-blue-600'}>{completionPct}%</span>
              </div>
              <div className={`h-1.5 w-full overflow-hidden rounded-full ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPct}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── CONTACT & ACADEMIC ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}>
          <div className={`rounded-2xl ${cardBase} p-6`}>
            <SectionHead
              icon={User}
              title="Contact & Academic"
              subtitle="Update your personal and academic details"
              isDark={isDark}
              accent={isDark ? 'text-blue-400' : 'text-blue-500'}
            />
            <form className="grid gap-4 sm:grid-cols-2" onSubmit={saveProfile}>
              <PremiumInput
                id="firstName" label="First name"
                value={form.firstName}
                onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))}
                isDark={isDark}
              />
              <PremiumInput
                id="lastName" label="Last name"
                value={form.lastName}
                onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))}
                isDark={isDark}
              />
              <div className="sm:col-span-2">
                <PremiumInput
                  id="phone" label="Phone number"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  isDark={isDark}
                />
              </div>
              {role === 'faculty' && (
                <div className="sm:col-span-2">
                  <PremiumInput
                    id="specialization" label="Specialization / research focus"
                    value={form.specialization}
                    onChange={(e) => setForm((f) => ({ ...f, specialization: e.target.value }))}
                    isDark={isDark}
                  />
                </div>
              )}
              <div className="sm:col-span-2 flex">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={savingProfile}
                  className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60 ${isDark
                    ? 'bg-gradient-to-r from-violet-600 to-blue-600 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40'
                    : 'bg-gradient-to-r from-blue-500 to-violet-500 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40'
                    }`}
                >
                  {savingProfile ? (
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                    />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  {savingProfile ? 'Saving…' : 'Save changes'}
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* ── SECURITY ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}>
          <div className={`rounded-2xl ${cardBase} p-6`}>
            <SectionHead
              icon={Shield}
              title="Security"
              subtitle="Update your password and review security settings"
              isDark={isDark}
              accent="text-amber-400"
            />

            <form className="grid gap-4 sm:grid-cols-2" onSubmit={changePassword}>
              <PremiumInput
                id="currentPassword" label="Current password" type="password"
                value={form.currentPassword}
                onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
                isDark={isDark}
              />
              <div>
                <PremiumInput
                  id="newPassword" label="New password" type="password"
                  value={form.newPassword}
                  onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
                  isDark={isDark}
                  minLength={8}
                />
                {/* strength bar */}
                <AnimatePresence>
                  {form.newPassword && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 overflow-hidden"
                    >
                      <div className="flex gap-1 mb-2">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <motion.div
                            key={i}
                            className="h-1 flex-1 overflow-hidden rounded-full"
                            style={{
                              background: isDark
                                ? 'rgba(255,255,255,0.06)'
                                : 'rgba(0,0,0,0.06)',
                            }}
                          >
                            <motion.div
                              className="h-full rounded-full"
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: i <= pwScore ? 1 : 0 }}
                              transition={{ duration: 0.3, delay: i * 0.05 }}
                              style={{
                                transformOrigin: 'left',
                                background:
                                  i <= pwScore ? pwMeta.color : 'transparent',
                              }}
                            />
                          </motion.div>
                        ))}
                      </div>

                      <p
                        className="text-[11px] font-bold"
                        style={{ color: pwMeta.color }}
                      >
                        {pwMeta.label}
                      </p>

                      {/* requirements */}
                      <div className="mt-3 grid grid-cols-1 gap-1.5">
                        {PW_REQS.map((req) => {
                          const met = req.test(form.newPassword);
                          return (
                            <motion.div
                              key={req.label}
                              animate={{ opacity: 1 }}
                              className={`flex items-center gap-2 text-[11px] font-medium transition-colors ${met
                                ? 'text-emerald-400'
                                : isDark ? 'text-white/25' : 'text-slate-400'
                                }`}
                            >
                              {met
                                ? <CheckCircle2 className="h-3 w-3 shrink-0" />
                                : <XCircle className="h-3 w-3 shrink-0 opacity-40" />
                              }
                              {req.label}
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="sm:col-span-2 flex items-center gap-3">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={savingPw}
                  className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-60 ${isDark
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35'
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40'
                    }`}
                >
                  {savingPw ? (
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                      className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
                    />
                  ) : (
                    <Lock className="h-4 w-4" />
                  )}
                  {savingPw ? 'Updating…' : 'Update password'}
                </motion.button>
              </div>
            </form>

            {/* session notice */}
            <div className={`mt-5 flex items-start gap-2.5 rounded-xl p-3 text-[11px] ${isDark ? 'bg-white/[0.03] border border-white/[0.05] text-white/35' : 'bg-slate-50 border border-slate-100 text-slate-400'
              }`}>
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 opacity-60" />
              <p>
                Sessions are single-browser JWT today — device management is a visual placeholder for future refresh-token flows.
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── ACTIVITY TIMELINE ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}>
          <div className={`rounded-2xl ${cardBase} p-6`}>
            <SectionHead
              icon={Activity}
              title="Activity Timeline"
              subtitle="Recent account events and authentication history"
              isDark={isDark}
              accent="text-emerald-400"
            />

            {activity.length > 0 ? (
              <div className="relative space-y-0">
                {/* timeline line */}
                <div className={`absolute left-[19px] top-2 bottom-2 w-px ${isDark ? 'bg-white/[0.06]' : 'bg-slate-200'}`} />

                {activity.map((a, idx) => {
                  const { Icon, color, bg } = activityIcon(a.action);
                  return (
                    <motion.div
                      key={`${a.created_at}-${a.action}`}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, delay: 0.1 + idx * 0.06, ease: 'easeOut' }}
                      whileHover={{ x: 4 }}
                      className={`group relative flex items-start gap-4 py-3 pl-1 pr-2 cursor-default rounded-xl transition-colors duration-150 ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'
                        }`}
                    >
                      {/* icon bubble */}
                      <div className={`relative z-10 flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full border ${bg} ${isDark ? 'border-white/[0.06]' : 'border-black/[0.05]'
                        }`}>
                        <Icon className={`h-4 w-4 ${color}`} />
                      </div>
                      <div className="flex-1 min-w-0 pt-1">
                        <p className={`text-sm font-semibold capitalize ${isDark ? 'text-white/80' : 'text-slate-700'}`}>
                          {a.action.replace(/_/g, ' ')}
                        </p>
                        {a.ip && (
                          <p className={`mt-0.5 flex items-center gap-1 text-[11px] ${isDark ? 'text-white/25' : 'text-slate-400'}`}>
                            <Globe className="h-3 w-3" />
                            {a.ip}
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 pt-1 text-right">
                        <p className={`text-[11px] font-semibold ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
                          {relativeTime(a.created_at)}
                        </p>
                        <p className={`mt-0.5 text-[10px] ${isDark ? 'text-white/15' : 'text-slate-300'}`}>
                          {new Date(a.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`flex flex-col items-center gap-3 py-10 text-center ${isDark ? 'text-white/25' : 'text-slate-400'}`}
              >
                <Activity className="h-8 w-8 opacity-40" />
                <p className="text-sm font-medium">No recent activity logged</p>
                <p className="text-xs opacity-60">Events will appear here as you use the platform.</p>
              </motion.div>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}