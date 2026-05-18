import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  ArrowLeft, LogIn, Eye, EyeOff, Mail, Lock, Zap,
  Users, BarChart3, Bell, Shield, CheckCircle2, Wifi,
  Brain, TrendingUp, GraduationCap, Activity,
} from 'lucide-react';

import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

/* ─────────────── sub-components ─────────────── */

function AuroraBlob({ style }) {
  return <div aria-hidden className="pointer-events-none absolute rounded-full" style={style} />;
}

function TrustBadge({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-white/[0.09] bg-white/[0.04] px-3 py-1.5">
      <Icon className="h-3 w-3 text-cyan-400" />
      <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">{label}</span>
    </div>
  );
}

function FeatureRow({ icon: Icon, label, sublabel, color }) {
  return (
    <motion.div
      whileHover={{ x: 5 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="flex items-center gap-3"
    >
      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${color}`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-200">{label}</p>
        <p className="text-[11px] text-slate-500">{sublabel}</p>
      </div>
    </motion.div>
  );
}

function StatPill({ value, label, glowColor }) {
  return (
    <div
      className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[rgba(10,8,28,0.7)] px-4 py-3 backdrop-blur-xl"
      style={{ boxShadow: `0 0 20px ${glowColor}22` }}
    >
      <div
        className="h-2 w-2 animate-pulse rounded-full"
        style={{ backgroundColor: glowColor, boxShadow: `0 0 6px ${glowColor}` }}
      />
      <div>
        <p className="text-base font-bold leading-none text-white">{value}</p>
        <p className="mt-0.5 text-[10px] text-slate-500">{label}</p>
      </div>
    </div>
  );
}

/* ─────────────── main component ─────────────── */

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [focused, setFocused] = useState(null);

  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;

  /* Mouse glow — scoped to right panel */
  const rightRef = useRef(null);
  const mouseX = useMotionValue(-9999);
  const mouseY = useMotionValue(-9999);
  const glowX = useTransform(mouseX, (v) => `${v}px`);
  const glowY = useTransform(mouseY, (v) => `${v}px`);

  useEffect(() => {
    function onMove(e) {
      if (!rightRef.current) return;
      const r = rightRef.current.getBoundingClientRect();
      mouseX.set(e.clientX - r.left);
      mouseY.set(e.clientY - r.top);
    }
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [mouseX, mouseY]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setAuth(data.user, data.token);
      toast.success('Welcome back!');
      const role = data.user.role;
      const target = from || (role === 'admin' ? '/admin/dashboard' : role === 'faculty' ? '/faculty/dashboard' : '/student/dashboard');
      navigate(target, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] },
  });

  const features = [
    { icon: BarChart3, label: 'Real-time AI Analytics', sublabel: 'Live campus intelligence', color: 'bg-violet-600' },
    { icon: Users, label: 'Multi-role Unified Access', sublabel: 'Student · Faculty · Admin', color: 'bg-cyan-600' },
    { icon: Bell, label: 'Smart Notifications', sublabel: 'Push & socket-powered alerts', color: 'bg-orange-500' },
    { icon: TrendingUp, label: 'Placement Automation', sublabel: 'AI-driven career tracking', color: 'bg-emerald-600' },
  ];

  const trustBadges = [
    { icon: Shield, label: 'JWT Secured' },
    { icon: Wifi, label: 'WebSocket Layer' },
    { icon: CheckCircle2, label: 'Enterprise Grade' },
  ];

  return (
    <div
      className="relative flex min-h-screen overflow-hidden"
      style={{ background: '#05030f' }}
    >
      {/* ── Background aurora blobs ── */}
      <AuroraBlob style={{ width: 560, height: 560, top: -160, left: -160, background: 'radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      <AuroraBlob style={{ width: 480, height: 480, bottom: -120, right: -120, background: 'radial-gradient(circle, rgba(8,145,178,0.3) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      <AuroraBlob style={{ width: 360, height: 360, bottom: 80, left: '32%', background: 'radial-gradient(circle, rgba(192,38,211,0.22) 0%, transparent 70%)', filter: 'blur(80px)' }} />

      {/* ── Subtle grid ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.025) 1px,transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />

      {/* ── Back button ── */}
      <Link
        to="/"
        className="absolute left-5 top-5 z-40 flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.04] px-4 py-2 text-xs font-semibold text-slate-400 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </Link>

      {/* ════════════════════════════════════════
          LEFT PANEL — visible on lg+ only
      ════════════════════════════════════════ */}
      <div className="relative hidden w-[52%] shrink-0 flex-col overflow-hidden px-14 pb-16 pt-20 lg:flex">

        {/* ── Brand copy — flows naturally below orbit ── */}
        <div className="relative z-10">

          {/* Wordmark */}
          <motion.div {...fadeUp(0.05)} className="mb-5 flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}
            >
              <Brain className="h-4 w-4 text-white" />
            </div>
            <span className="text-[11px] font-bold tracking-[0.18em] text-slate-500 uppercase">
              Smart Campus Hub
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            {...fadeUp(0.1)}
            className="text-[2.6rem] font-black leading-[1.07] tracking-tight text-white"
          >
            Your campus{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #c084fc 0%, #22d3ee 60%, #34d399 100%)' }}
            >
              intelligence
            </span>
            <br />command center.
          </motion.h1>

          <motion.p {...fadeUp(0.16)} className="mt-4 max-w-[340px] text-[14px] leading-relaxed text-slate-400">
            Students. Faculty. Admin. Unified under one intelligent platform built for the modern institution.
          </motion.p>

          {/* Stat pills */}
          <motion.div {...fadeUp(0.22)} className="mt-7 flex flex-wrap gap-3">
            <StatPill value="12,400+" label="Active students" glowColor="#34d399" />
            <StatPill value="98.2%" label="Placement rate" glowColor="#c084fc" />
            <StatPill value="340ms" label="Avg. latency" glowColor="#22d3ee" />
          </motion.div>

          {/* Feature rows */}
          <div className="mt-8 space-y-4">
            {features.map((f, i) => (
              <motion.div key={f.label} {...fadeUp(0.28 + i * 0.06)}>
                <FeatureRow {...f} />
              </motion.div>
            ))}
          </div>

          {/* Trust badges */}
          <motion.div {...fadeUp(0.54)} className="mt-8 flex flex-wrap gap-2">
            {trustBadges.map((b) => <TrustBadge key={b.label} {...b} />)}
          </motion.div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          RIGHT PANEL — auth form
      ════════════════════════════════════════ */}
      <div
        ref={rightRef}
        className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-20"
      >
        {/* Panel-scoped mouse glow */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute h-[360px] w-[360px] rounded-full"
          style={{
            left: glowX,
            top: glowY,
            translateX: '-50%',
            translateY: '-50%',
            background: 'radial-gradient(circle, rgba(139,92,246,0.11) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative z-10 w-full max-w-[400px]"
        >
          {/* Glass card */}
          <div
            className="relative overflow-hidden rounded-3xl p-8"
            style={{
              background: 'rgba(9,7,26,0.88)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.06)',
              backdropFilter: 'blur(28px)',
            }}
          >
            {/* Top edge shimmer */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-8 top-0 h-px"
              style={{ background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent)' }}
            />

            {/* Card header */}
            <motion.div {...fadeUp(0.08)} className="mb-7">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                  style={{
                    background: 'linear-gradient(135deg, #6d28d9, #a855f7, #06b6d4)',
                    boxShadow: '0 0 20px rgba(139,92,246,0.5)',
                  }}
                >
                  <LogIn className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Welcome back</h2>
                  <p className="text-xs text-slate-500">Sign in to your workspace</p>
                </div>
              </div>

              {/* Role pills */}
              <div className="mt-5 flex gap-2">
                {[
                  { label: 'Student', bg: 'rgba(139,92,246,0.14)', border: 'rgba(139,92,246,0.3)' },
                  { label: 'Faculty', bg: 'rgba(6,182,212,0.12)', border: 'rgba(6,182,212,0.28)' },
                  { label: 'Admin', bg: 'rgba(249,115,22,0.11)', border: 'rgba(249,115,22,0.26)' },
                ].map(({ label, bg, border }) => (
                  <span
                    key={label}
                    className="rounded-full px-3 py-1 text-[10px] font-semibold text-slate-300"
                    style={{ background: bg, border: `1px solid ${border}` }}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Form */}
            <form className="space-y-4" onSubmit={handleSubmit}>

              {/* Email */}
              <motion.div {...fadeUp(0.14)}>
                <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-3.5 top-1/2 h-[15px] w-[15px] -translate-y-1/2 transition-colors duration-200"
                    style={{ color: focused === 'email' ? '#22d3ee' : '#475569' }}
                  />
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused(null)}
                    placeholder="you@campus.edu"
                    className="w-full rounded-xl py-3 pl-10 pr-4 text-sm text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-600"
                    style={{
                      background: focused === 'email' ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
                      border: focused === 'email' ? '1px solid rgba(34,211,238,0.45)' : '1px solid rgba(255,255,255,0.07)',
                      boxShadow: focused === 'email' ? '0 0 0 3px rgba(34,211,238,0.1)' : 'none',
                    }}
                  />
                </div>
              </motion.div>

              {/* Password */}
              <motion.div {...fadeUp(0.2)}>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500">
                    Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[10px] font-medium text-slate-500 transition hover:text-cyan-400"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock
                    className="pointer-events-none absolute left-3.5 top-1/2 h-[15px] w-[15px] -translate-y-1/2 transition-colors duration-200"
                    style={{ color: focused === 'password' ? '#c084fc' : '#475569' }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused(null)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl py-3 pl-10 pr-11 text-sm text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-600"
                    style={{
                      background: focused === 'password' ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
                      border: focused === 'password' ? '1px solid rgba(192,132,252,0.45)' : '1px solid rgba(255,255,255,0.07)',
                      boxShadow: focused === 'password' ? '0 0 0 3px rgba(192,132,252,0.1)' : 'none',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-600 transition hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </motion.div>

              {/* Remember me */}
              <motion.div {...fadeUp(0.25)} className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setRememberMe((v) => !v)}
                  className="relative h-[18px] w-[32px] rounded-full transition-colors duration-300"
                  style={{ background: rememberMe ? '#06b6d4' : 'rgba(255,255,255,0.1)' }}
                >
                  <span
                    className="absolute top-[3px] h-3 w-3 rounded-full bg-white shadow-md transition-all duration-300"
                    style={{ left: rememberMe ? '15px' : '3px' }}
                  />
                </button>
                <span className="text-xs text-slate-500">Keep me signed in</span>
              </motion.div>

              {/* Submit button */}
              <motion.div {...fadeUp(0.3)}>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={loading ? {} : { scale: 1.012, boxShadow: '0 0 30px rgba(139,92,246,0.45)' }}
                  whileTap={loading ? {} : { scale: 0.985 }}
                  className="group relative mt-1 w-full overflow-hidden rounded-xl py-3.5 text-sm font-bold text-white disabled:opacity-60"
                  style={{
                    background: 'linear-gradient(130deg, #6d28d9 0%, #a855f7 50%, #06b6d4 100%)',
                    boxShadow: '0 4px 20px rgba(109,40,217,0.4)',
                    transition: 'box-shadow 0.3s',
                  }}
                >
                  {/* Shine sweep */}
                  <span className="absolute inset-0 -translate-x-full skew-x-[-16deg] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />

                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.span
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center gap-2"
                      >
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Authenticating…
                      </motion.span>
                    ) : (
                      <motion.span
                        key="idle"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center gap-2"
                      >
                        <Zap className="h-4 w-4" />
                        Continue to Campus
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </motion.div>
            </form>

            {/* Divider */}
            <motion.div {...fadeUp(0.36)} className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/[0.06]" />
              <div className="flex items-center gap-1.5">
                <Activity className="h-3 w-3 text-slate-600" />
                <span className="text-[10px] font-semibold tracking-widest text-slate-600 uppercase">
                  Secure Access
                </span>
              </div>
              <div className="h-px flex-1 bg-white/[0.06]" />
            </motion.div>

            {/* Trust badges — mobile only */}
            <motion.div {...fadeUp(0.38)} className="flex flex-wrap justify-center gap-2 lg:hidden">
              {trustBadges.map((b) => <TrustBadge key={b.label} {...b} />)}
            </motion.div>

            {/* Footer */}
            <motion.p {...fadeUp(0.42)} className="mt-6 text-center text-xs text-slate-600">
              New to Smart Campus Hub?{' '}
              <Link
                to="/register"
                className="font-bold text-violet-400 transition hover:text-cyan-400"
              >
                Create an account →
              </Link>
            </motion.p>
          </div>
        </motion.div>
      </div>
    </div >
  );
}