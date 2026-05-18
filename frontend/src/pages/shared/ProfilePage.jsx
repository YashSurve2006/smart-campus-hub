import { useEffect, useMemo, useState, useRef } from 'react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
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
  if (action.includes('login')) return { Icon: LogIn, color: 'text-emerald-400', bg: 'bg-emerald-400/10', glow: 'shadow-emerald-500/20', border: 'border-emerald-500/20' };
  if (action.includes('password')) return { Icon: Key, color: 'text-amber-400', bg: 'bg-amber-400/10', glow: 'shadow-amber-500/20', border: 'border-amber-500/20' };
  if (action.includes('avatar')) return { Icon: Camera, color: 'text-violet-400', bg: 'bg-violet-400/10', glow: 'shadow-violet-500/20', border: 'border-violet-500/20' };
  if (action.includes('profile')) return { Icon: Settings, color: 'text-cyan-400', bg: 'bg-cyan-400/10', glow: 'shadow-cyan-500/20', border: 'border-cyan-500/20' };
  return { Icon: Activity, color: 'text-slate-400', bg: 'bg-slate-400/10', glow: 'shadow-slate-500/20', border: 'border-slate-500/20' };
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
  hidden: { opacity: 0, y: 28 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.08 },
  }),
};

/* ─── reusable premium dark input ─────────────────────── */
function PremiumInput({ label, id, type = 'text', value, onChange, suffix, minLength }) {
  const [focused, setFocused] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const isPw = type === 'password';
  const inputType = isPw ? (showPw ? 'text' : 'password') : type;

  return (
    <div className="group relative">
      <label
        htmlFor={id}
        className={`mb-2 block text-[10px] font-bold tracking-[0.18em] uppercase transition-all duration-300 ${focused ? 'text-violet-400' : 'text-white/35'
          }`}
      >
        {label}
      </label>
      <div className="relative">
        {/* animated border glow */}
        <div
          className={`absolute -inset-px rounded-xl transition-all duration-300 ${focused
              ? 'bg-gradient-to-r from-violet-500/50 via-cyan-500/30 to-blue-500/50 opacity-100'
              : 'bg-white/[0.06] opacity-100'
            }`}
          style={{ borderRadius: '13px' }}
        />
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          minLength={minLength}
          className={`relative w-full rounded-xl border bg-[#0a0a1a]/80 px-4 py-3 text-sm font-medium outline-none transition-all duration-300 backdrop-blur-sm ${focused
              ? 'border-transparent text-white placeholder:text-white/20 shadow-[0_0_20px_rgba(139,92,246,0.15)]'
              : 'border-white/[0.07] text-white/80 placeholder:text-white/15'
            } ${isPw ? 'pr-11' : ''}`}
        />
        {isPw && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 transition-colors duration-200 hover:text-white/60"
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
        {suffix}
      </div>
    </div>
  );
}

/* ─── glass card base ─────────────────────────────────── */
function NightCard({ children, className = '', glow = false, glowColor = 'violet' }) {
  const glowMap = {
    violet: 'shadow-[0_0_60px_rgba(139,92,246,0.08)]',
    cyan: 'shadow-[0_0_60px_rgba(34,211,238,0.08)]',
    amber: 'shadow-[0_0_60px_rgba(251,191,36,0.08)]',
    emerald: 'shadow-[0_0_60px_rgba(52,211,153,0.08)]',
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.025] backdrop-blur-2xl ${glow ? glowMap[glowColor] : ''
        } ${className}`}
    >
      {/* inner top shine */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
      {/* inner bottom line */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
      {children}
    </div>
  );
}

/* ─── section heading ─────────────────────────────────── */
function SectionHead({ icon: Icon, title, subtitle, accent = 'text-violet-400', accentBg = 'bg-violet-500/10', accentBorder = 'border-violet-500/20' }) {
  return (
    <div className="mb-7 flex items-start gap-4">
      <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${accentBg} ${accentBorder}`}>
        <Icon className={`h-4 w-4 ${accent}`} />
      </div>
      <div>
        <h2 className="text-[15px] font-bold tracking-tight text-white">{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-xs text-white/35">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

/* ─── role config ──────────────────────────────────────── */
function getRoleConfig(role) {
  if (role === 'admin') return {
    badge: 'from-violet-500/25 to-fuchsia-500/25 border-violet-400/30 text-violet-300',
    ring: ['#8b5cf6', '#a855f7'],
    orb1: 'bg-violet-600/15',
    orb2: 'bg-fuchsia-600/10',
    orb3: 'bg-cyan-600/8',
    heroGrad: 'from-violet-600/20 via-fuchsia-600/10',
    avatarGlow: 'bg-violet-500/40',
  };
  if (role === 'faculty') return {
    badge: 'from-cyan-500/25 to-blue-500/25 border-cyan-400/30 text-cyan-300',
    ring: ['#06b6d4', '#3b82f6'],
    orb1: 'bg-cyan-600/12',
    orb2: 'bg-blue-600/10',
    orb3: 'bg-indigo-600/8',
    heroGrad: 'from-cyan-600/15 via-blue-600/10',
    avatarGlow: 'bg-cyan-500/40',
  };
  // student default
  return {
    badge: 'from-emerald-500/25 to-teal-500/25 border-emerald-400/30 text-emerald-300',
    ring: ['#10b981', '#06b6d4'],
    orb1: 'bg-emerald-600/12',
    orb2: 'bg-teal-600/10',
    orb3: 'bg-cyan-600/8',
    heroGrad: 'from-emerald-600/15 via-teal-600/10',
    avatarGlow: 'bg-emerald-500/40',
  };
}

/* ─── main page ───────────────────────────────────────── */
export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const role = user?.role;

  // Always use dark futuristic styling for all roles
  const isDark = true;
  const rc = getRoleConfig(role);

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
        const { data } = await api.get('/users/activity');
        setActivity(data.activity || []);
      } catch { /* */ }
    })();
  }, []);

  async function refreshMe() {
    const { data } = await api.get('/auth/me');
    setUser(data.user);
  }

  async function saveProfile(e) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await api.patch('/users/profile', {
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
      const { data } = await api.post('/users/avatar', fd);
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
      await api.post('/users/change-password', {
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

  /* role badge */
  const roleBadgeClass = `bg-gradient-to-r ${rc.badge}`;

  /* ── ambient background orbs ── */
  const Orbs = () => (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <motion.div
        animate={{ x: [0, 50, 0], y: [0, -40, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        className={`absolute -top-40 -left-40 h-[700px] w-[700px] rounded-full blur-[140px] ${rc.orb1}`}
      />
      <motion.div
        animate={{ x: [0, -40, 0], y: [0, 50, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
        className={`absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full blur-[140px] ${rc.orb2}`}
      />
      <motion.div
        animate={{ x: [0, 25, 0], y: [0, 25, 0] }}
        transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
        className={`absolute top-1/3 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full blur-[160px] ${rc.orb3}`}
      />
      {/* noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '200px 200px',
        }}
      />
    </div>
  );

  /* ── gradient submit button ── */
  const GradBtn = ({ children, onClick, type = 'button', disabled, gradient, shadow }) => (
    <motion.button
      type={type}
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -1 }}
      whileTap={{ scale: 0.97 }}
      disabled={disabled}
      className={`relative inline-flex items-center gap-2 overflow-hidden rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 ${gradient} ${shadow}`}
    >
      {/* shine sweep */}
      <motion.div
        className="absolute inset-0 -skew-x-12 bg-white/10"
        initial={{ x: '-150%' }}
        whileHover={{ x: '250%' }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      />
      <span className="relative flex items-center gap-2">{children}</span>
    </motion.button>
  );

  return (
    <div className="relative min-h-screen pb-24 text-white">
      <Orbs />

      <div className="mx-auto max-w-3xl space-y-5 px-4 py-8 sm:px-6">

        {/* ── breadcrumb + heading ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={0}>
          <div className="mb-3 flex items-center gap-1.5">
            <span className="text-[9px] font-black tracking-[0.25em] uppercase text-white/25">Account</span>
            <ChevronRight className="h-3 w-3 text-white/15" />
            <span className="text-[9px] font-black tracking-[0.25em] uppercase text-white/40">Profile</span>
          </div>
          <h1 className="text-[28px] font-black tracking-tight text-white">
            Profile &amp; Settings
          </h1>
          <p className="mt-1 text-sm text-white/35">
            Manage your identity, security, and account activity.
          </p>
        </motion.div>

        {/* ══ HERO PROFILE CARD ══════════════════════════════════════ */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={1}>
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] backdrop-blur-2xl">

            {/* animated gradient border top */}
            <div className="absolute inset-x-0 top-0 h-px">
              <motion.div
                className="h-full bg-gradient-to-r from-transparent via-violet-500/60 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear', repeatDelay: 3 }}
              />
            </div>

            {/* hero bg wash */}
            <div className={`absolute inset-x-0 top-0 h-40 bg-gradient-to-b ${rc.heroGrad} to-transparent`} />

            {/* decorative grid lines */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />

            <div className="relative p-6 sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">

                {/* ── avatar ── */}
                <div className="group relative shrink-0 self-center sm:self-start">
                  <motion.div whileHover={{ scale: 1.05 }} className="relative h-[88px] w-[88px]">
                    {/* triple glow rings */}
                    <motion.div
                      animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.05, 1] }}
                      transition={{ duration: 3.5, repeat: Infinity }}
                      className={`absolute -inset-3 rounded-[22px] blur-xl ${rc.avatarGlow} opacity-50`}
                    />
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                      className={`absolute -inset-1.5 rounded-[20px] blur-sm ${rc.avatarGlow} opacity-30`}
                    />

                    {/* main avatar frame */}
                    <div className="relative h-[88px] w-[88px] overflow-hidden rounded-[18px] border border-white/[0.12] bg-[#0a0a1a]">
                      {user?.avatarUrl ? (
                        <img
                          src={`${import.meta.env.VITE_API_BASE || ''}${user.avatarUrl}`}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/5 to-transparent">
                          <User className="h-9 w-9 text-white/15" />
                        </div>
                      )}

                      {/* upload hover overlay */}
                      <label className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-1.5 bg-black/70 opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
                        <motion.div
                          initial={{ scale: 0.8 }}
                          whileHover={{ scale: 1 }}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20"
                        >
                          <Camera className="h-4 w-4 text-white" />
                        </motion.div>
                        <span className="text-[9px] font-bold tracking-widest uppercase text-white/80">Change</span>
                        <input type="file" accept="image/*" className="hidden" onChange={onAvatar} />
                      </label>
                    </div>

                    {/* online indicator */}
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#080818] bg-emerald-500">
                      <motion.span
                        animate={{ scale: [1, 2, 1], opacity: [0.6, 0, 0.6] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                        className="absolute h-full w-full rounded-full bg-emerald-400"
                      />
                    </span>
                  </motion.div>
                </div>

                {/* ── identity block ── */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start gap-2 mb-1">
                    <h2 className="text-xl font-black tracking-tight text-white leading-tight">
                      {user?.firstName} {user?.lastName}
                    </h2>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.18em] bg-gradient-to-r ${rc.badge}`}>
                      <Star className="h-2 w-2" />
                      {user?.role}
                    </span>
                  </div>

                  <p className="text-sm text-white/40 mb-3">{user?.email}</p>

                  {user?.lastLoginAt && (
                    <div className="mb-3 inline-flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5 text-[11px] text-white/30">
                      <Clock className="h-3 w-3" />
                      Last login: {new Date(user.lastLoginAt).toLocaleString()}
                    </div>
                  )}

                  {user?.profile && (
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        user.profile.departmentName,
                        user.profile.studentCode && `Code: ${user.profile.studentCode}`,
                        user.profile.employeeCode && `EMP: ${user.profile.employeeCode}`,
                        user.profile.designation,
                        user.profile.semester != null && `Sem ${user.profile.semester}`,
                      ].filter(Boolean).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-lg border border-white/[0.07] bg-white/[0.04] px-2.5 py-1 text-[11px] font-medium text-white/45"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── completion ring — desktop ── */}
                <div className="hidden sm:flex flex-col items-center gap-2 shrink-0">
                  <div className="relative h-16 w-16">
                    <svg className="h-16 w-16 -rotate-90" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="26" strokeWidth="4"
                        stroke="rgba(255,255,255,0.05)"
                        fill="none"
                      />
                      {/* track glow */}
                      <circle cx="32" cy="32" r="26" strokeWidth="4"
                        stroke="rgba(255,255,255,0.03)"
                        fill="none"
                        strokeDasharray="163.4"
                        strokeDashoffset="0"
                      />
                      <motion.circle
                        cx="32" cy="32" r="26" strokeWidth="4"
                        fill="none"
                        stroke={`url(#ring-grad-${role})`}
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 26}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 26 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 26 * (1 - completionPct / 100) }}
                        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
                        filter={`url(#ring-glow-${role})`}
                      />
                      <defs>
                        <linearGradient id={`ring-grad-${role}`} x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor={rc.ring[0]} />
                          <stop offset="100%" stopColor={rc.ring[1]} />
                        </linearGradient>
                        <filter id={`ring-glow-${role}`}>
                          <feGaussianBlur stdDeviation="2" result="blur" />
                          <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-[14px] font-black text-white">
                      {completionPct}%
                    </span>
                  </div>
                  <p className="text-[9px] text-center font-bold tracking-widest uppercase text-white/25">
                    Complete
                  </p>
                </div>
              </div>

              {/* mobile completion bar */}
              <div className="mt-5 sm:hidden">
                <div className="mb-2 flex justify-between">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-white/30">Profile completion</span>
                  <span className="text-[10px] font-black text-white/60">{completionPct}%</span>
                </div>
                <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(to right, ${rc.ring[0]}, ${rc.ring[1]})` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${completionPct}%` }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                  />
                  {/* glow trail */}
                  <motion.div
                    className="absolute top-0 h-full w-8 blur-sm"
                    style={{ background: `linear-gradient(to right, transparent, ${rc.ring[1]})` }}
                    initial={{ left: '-10%' }}
                    animate={{ left: `${Math.max(completionPct - 5, 0)}%` }}
                    transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                  />
                </div>
              </div>
            </div>

            {/* bottom shine */}
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          </div>
        </motion.div>

        {/* ══ CONTACT & ACADEMIC ═════════════════════════════════════ */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={2}>
          <NightCard glow glowColor="violet">
            <div className="p-6 sm:p-7">
              <SectionHead
                icon={User}
                title="Contact & Academic"
                subtitle="Update your personal and academic details"
                accent="text-blue-400"
                accentBg="bg-blue-500/10"
                accentBorder="border-blue-500/20"
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

                <div className="sm:col-span-2 flex pt-1">
                  <GradBtn
                    type="submit"
                    disabled={savingProfile}
                    gradient="bg-gradient-to-r from-violet-600 to-blue-600"
                    shadow="shadow-[0_4px_20px_rgba(139,92,246,0.3)] hover:shadow-[0_4px_30px_rgba(139,92,246,0.45)]"
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
                  </GradBtn>
                </div>
              </form>
            </div>
          </NightCard>
        </motion.div>

        {/* ══ SECURITY ════════════════════════════════════════════════ */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={3}>
          <NightCard glow glowColor="amber">
            <div className="p-6 sm:p-7">
              <SectionHead
                icon={Shield}
                title="Security"
                subtitle="Update your password and review security settings"
                accent="text-amber-400"
                accentBg="bg-amber-500/10"
                accentBorder="border-amber-500/20"
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

                  {/* strength indicator */}
                  <AnimatePresence>
                    {form.newPassword && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 overflow-hidden"
                      >
                        {/* segmented bar */}
                        <div className="mb-2 flex gap-1.5">
                          {[0, 1, 2, 3, 4].map((i) => (
                            <div key={i} className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                              <motion.div
                                className="absolute inset-0 rounded-full"
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: i <= pwScore ? 1 : 0 }}
                                transition={{ duration: 0.35, delay: i * 0.06, ease: 'easeOut' }}
                                style={{
                                  transformOrigin: 'left',
                                  backgroundColor: i <= pwScore ? pwMeta.color : 'transparent',
                                  boxShadow: i <= pwScore ? `0 0 8px ${pwMeta.color}60` : 'none',
                                }}
                              />
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between mb-3">
                          <p className="text-[11px] font-bold" style={{ color: pwMeta.color }}>
                            {pwMeta.label}
                          </p>
                          <div
                            className="rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest"
                            style={{
                              background: `${pwMeta.color}18`,
                              color: pwMeta.color,
                              border: `1px solid ${pwMeta.color}30`,
                            }}
                          >
                            {pwScore}/4
                          </div>
                        </div>

                        {/* requirements grid */}
                        <div className="grid grid-cols-1 gap-1.5">
                          {PW_REQS.map((req) => {
                            const met = req.test(form.newPassword);
                            return (
                              <motion.div
                                key={req.label}
                                animate={{ opacity: 1 }}
                                className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-[11px] font-medium transition-all duration-200 ${met
                                    ? 'border-emerald-500/20 bg-emerald-500/8 text-emerald-400'
                                    : 'border-white/[0.05] bg-white/[0.02] text-white/25'
                                  }`}
                              >
                                {met
                                  ? <CheckCircle2 className="h-3 w-3 shrink-0" />
                                  : <XCircle className="h-3 w-3 shrink-0 opacity-30" />
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

                <div className="sm:col-span-2 flex items-center gap-3 pt-1">
                  <GradBtn
                    type="submit"
                    disabled={savingPw}
                    gradient="bg-gradient-to-r from-amber-600 to-orange-600"
                    shadow="shadow-[0_4px_20px_rgba(245,158,11,0.25)] hover:shadow-[0_4px_30px_rgba(245,158,11,0.4)]"
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
                  </GradBtn>
                </div>
              </form>

              {/* session notice */}
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-500/10 bg-amber-500/5 p-3.5">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500/50" />
                <p className="text-[11px] leading-relaxed text-white/25">
                  Sessions are single-browser JWT today — device management is a visual placeholder for future refresh-token flows.
                </p>
              </div>
            </div>
          </NightCard>
        </motion.div>

        {/* ══ ACTIVITY TIMELINE ══════════════════════════════════════ */}
        <motion.div variants={fadeUp} initial="hidden" animate="visible" custom={4}>
          <NightCard glow glowColor="emerald">
            <div className="p-6 sm:p-7">
              <SectionHead
                icon={Activity}
                title="Activity Timeline"
                subtitle="Recent account events and authentication history"
                accent="text-emerald-400"
                accentBg="bg-emerald-500/10"
                accentBorder="border-emerald-500/20"
              />

              {activity.length > 0 ? (
                <div className="relative">
                  {/* timeline rail */}
                  <div className="absolute left-[19px] top-3 bottom-3 w-px bg-gradient-to-b from-white/[0.08] via-white/[0.05] to-transparent" />

                  <div className="space-y-1">
                    {activity.map((a, idx) => {
                      const { Icon, color, bg, glow, border } = activityIcon(a.action);
                      return (
                        <motion.div
                          key={`${a.created_at}-${a.action}`}
                          initial={{ opacity: 0, x: -16 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: 0.08 + idx * 0.06, ease: [0.22, 1, 0.36, 1] }}
                          whileHover={{ x: 5 }}
                          className="group relative flex items-start gap-4 rounded-xl border border-transparent px-2 py-3 transition-all duration-200 hover:border-white/[0.05] hover:bg-white/[0.02] cursor-default"
                        >
                          {/* icon bubble */}
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className={`relative z-10 flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full border ${bg} ${border} shadow-lg ${glow}`}
                          >
                            <Icon className={`h-3.5 w-3.5 ${color}`} />
                            {/* pulse on hover */}
                            <motion.div
                              className={`absolute inset-0 rounded-full ${bg} opacity-0 group-hover:opacity-100`}
                              animate={{ scale: [1, 1.5, 1], opacity: [0, 0.3, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            />
                          </motion.div>

                          {/* content */}
                          <div className="flex-1 min-w-0 pt-0.5">
                            <p className="text-sm font-semibold capitalize text-white/75 group-hover:text-white/90 transition-colors">
                              {a.action.replace(/_/g, ' ')}
                            </p>
                            {a.ip && (
                              <p className="mt-0.5 flex items-center gap-1 text-[11px] text-white/20">
                                <Globe className="h-3 w-3" />
                                {a.ip}
                              </p>
                            )}
                          </div>

                          {/* timestamps */}
                          <div className="shrink-0 pt-0.5 text-right">
                            <p className="text-[11px] font-bold text-white/35">
                              {relativeTime(a.created_at)}
                            </p>
                            <p className="mt-0.5 text-[10px] text-white/15">
                              {new Date(a.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-3 py-12 text-center"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.03]">
                    <Activity className="h-6 w-6 text-white/15" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white/30">No recent activity logged</p>
                    <p className="mt-0.5 text-xs text-white/15">Events will appear here as you use the platform.</p>
                  </div>
                </motion.div>
              )}
            </div>
          </NightCard>
        </motion.div>

      </div>
    </div>
  );
}