/**
 * Landing.jsx — DARK-FIRST UPGRADE
 *
 * Root cause of invisible text:
 * 1. Root div had `bg-gradient-to-b from-slate-50 via-white` fighting the dark canvas
 * 2. All section cards used light-mode classes: bg-white/90, text-slate-900, text-slate-700
 * 3. Feature cards, bento grid, how-it-works, testimonials were all light-surface components
 *    dropped onto a dark background — producing invisible or near-invisible text
 *
 * Fix strategy (architecture UNCHANGED):
 * - Root div: transparent (PublicLayout provides the dark canvas)
 * - All `text-slate-900` → `text-white` or `text-slate-100`
 * - All `text-slate-700/800` → `text-slate-200` or `text-slate-300`
 * - All `text-slate-500/600` → `text-slate-400`
 * - All `bg-white/80-90` card surfaces → `bg-white/[0.07]` glass surfaces
 * - All `border-white/60` light borders → `border-white/[0.10]` dark borders
 * - Hero dashboard preview card (right side) keeps its light interior — it's a UI mockup
 * - Section backgrounds tuned for visual rhythm on dark canvas
 */

import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import {
  ArrowRight, BellRing, CalendarClock, MapPinned, ShieldCheck, Sparkles,
  Users, Zap, Activity, TrendingUp, Wifi, Lock, GraduationCap, BookOpen,
  Settings2, ChevronRight, CheckCircle2, Globe, Database, Cpu, BarChart3,
  Bell, Star,
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';

/* ─── Data (unchanged) ──────────────────────────────────────── */

const features = [
  {
    title: 'Unified Notices',
    desc: 'Role-aware announcements so students never miss critical updates from faculty or admin.',
    icon: BellRing,
    accent: 'from-blue-500/[0.15] to-cyan-500/[0.08]',
    iconBg: 'bg-blue-500/[0.15]',
    iconColor: 'text-blue-400',
    border: 'border-blue-500/[0.18]',
    glow: 'hover:shadow-blue-500/[0.12]',
    ring: 'group-hover:ring-blue-500/20',
  },
  {
    title: 'Attendance Clarity',
    desc: 'Faculty mark sessions in seconds; students see transparent history with real-time sync.',
    icon: ShieldCheck,
    accent: 'from-emerald-500/[0.15] to-teal-500/[0.08]',
    iconBg: 'bg-emerald-500/[0.15]',
    iconColor: 'text-emerald-400',
    border: 'border-emerald-500/[0.18]',
    glow: 'hover:shadow-emerald-500/[0.12]',
    ring: 'group-hover:ring-emerald-500/20',
  },
  {
    title: 'Live Timetables',
    desc: 'Department schedules stay synchronized across every role-specific dashboard instantly.',
    icon: CalendarClock,
    accent: 'from-violet-500/[0.15] to-purple-500/[0.08]',
    iconBg: 'bg-violet-500/[0.15]',
    iconColor: 'text-violet-400',
    border: 'border-violet-500/[0.18]',
    glow: 'hover:shadow-violet-500/[0.12]',
    ring: 'group-hover:ring-violet-500/20',
  },
  {
    title: 'Campus Navigation',
    desc: 'Explore buildings, labs, and facilities with an interactive map powered by geolocation.',
    icon: MapPinned,
    accent: 'from-orange-500/[0.15] to-amber-500/[0.08]',
    iconBg: 'bg-orange-500/[0.15]',
    iconColor: 'text-orange-400',
    border: 'border-orange-500/[0.18]',
    glow: 'hover:shadow-orange-500/[0.12]',
    ring: 'group-hover:ring-orange-500/20',
  },
];

const stats = [
  { label: 'Roles connected', value: '3', hint: 'Students · Faculty · Admin' },
  { label: 'Realtime events', value: 'Socket.IO', hint: 'Instant notice broadcasts' },
  { label: 'Security', value: 'JWT', hint: 'Role-guarded APIs' },
];

const steps = [
  { title: 'Onboard', text: 'Register with your campus email and role-specific profile.', num: '01' },
  { title: 'Engage', text: 'Dashboards surface attendance, classes, and notices instantly.', num: '02' },
  { title: 'Operate', text: 'Admins orchestrate people, communications, and analytics.', num: '03' },
];

const testimonials = [
  {
    quote: 'Finally one place for timetables and notices — our student council loves it.',
    name: 'Priya N.',
    role: 'Student leader',
    avatar: 'PN',
    color: 'from-blue-500 to-cyan-500',
    rating: 5,
  },
  {
    quote: 'Marking attendance tied to my slots removed so much back-and-forth.',
    name: 'Dr. Jordan Lee',
    role: 'Faculty',
    avatar: 'JL',
    color: 'from-violet-500 to-purple-500',
    rating: 5,
  },
];

const universities = [
  'MIT Campus', 'Stanford Uni', 'IIT Bombay', 'Harvard EDU', 'Oxford Net', 'NUS Connect',
];

const platformCaps = [
  { icon: Globe, label: 'Multi-campus', desc: 'Deploy across institutions' },
  { icon: Database, label: 'Data-first', desc: 'Structured campus data' },
  { icon: Cpu, label: 'AI-powered', desc: 'Smart recommendations' },
  { icon: Wifi, label: 'Realtime', desc: 'Socket.IO live sync' },
  { icon: Lock, label: 'Zero-trust', desc: 'JWT + role guards' },
  { icon: BarChart3, label: 'Analytics', desc: 'Actionable insights' },
];

const roleData = {
  Student: {
    icon: GraduationCap,
    color: 'from-blue-600 to-cyan-500',
    items: [
      { icon: CalendarClock, label: 'Today: Data Structures — Hall A-101', badge: 'In 20 min' },
      { icon: ShieldCheck, label: 'Attendance: 87% overall', badge: 'Good' },
      { icon: BellRing, label: '3 new notices from admin', badge: 'Unread' },
      { icon: MapPinned, label: 'Lab B-204 directions', badge: 'Maps' },
    ],
  },
  Faculty: {
    icon: BookOpen,
    color: 'from-violet-600 to-purple-500',
    items: [
      { icon: Users, label: '42 students in current session', badge: 'Live' },
      { icon: ShieldCheck, label: 'Mark attendance for CS-301', badge: 'Pending' },
      { icon: CalendarClock, label: '4 classes scheduled today', badge: 'Today' },
      { icon: BellRing, label: 'Post department notice', badge: 'Draft' },
    ],
  },
  Admin: {
    icon: Settings2,
    color: 'from-emerald-600 to-teal-500',
    items: [
      { icon: Users, label: '1,240 active students enrolled', badge: 'Total' },
      { icon: Activity, label: 'Campus utilization: 78%', badge: 'Live' },
      { icon: TrendingUp, label: 'Attendance rate up 12%', badge: '↑' },
      { icon: Globe, label: 'All departments synced', badge: 'OK' },
    ],
  },
};

/* ─── Micro-components ───────────────────────────────────────── */

const FloatingBadge = ({ children, className = '' }) => (
  <motion.div
    animate={{ y: [0, -5, 0] }}
    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
    className={`inline-flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-white/[0.08] px-3 py-1.5 text-xs font-semibold text-slate-200 shadow-lg backdrop-blur-md ${className}`}
  >
    {children}
  </motion.div>
);

const LiveDot = ({ color = 'bg-emerald-400' }) => (
  <span className="relative flex h-2 w-2">
    <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${color}`} />
    <span className={`relative inline-flex h-2 w-2 rounded-full ${color}`} />
  </span>
);

const GradientOrb = ({ className }) => (
  <div className={`pointer-events-none absolute rounded-full blur-3xl ${className}`} />
);

/* Section label pill — unchanged */
const SectionLabel = ({ children }) => (
  <motion.p
    initial={{ opacity: 0, y: 8 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="inline-flex items-center gap-2 rounded-full border border-indigo-500/25 bg-indigo-500/[0.10] px-3 py-1 text-xs font-semibold uppercase tracking-widest text-indigo-400"
  >
    {children}
  </motion.p>
);

/* Section heading — text-white, strong contrast */
const SectionHeading = ({ children, className = '' }) => (
  <motion.h2
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: 0.05 }}
    className={`mt-3 text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl ${className}`}
  >
    {children}
  </motion.h2>
);

/* 3D Tilt — unchanged */
const TiltCard = ({ children, className = '' }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-50, 50], [6, -6]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-50, 50], [-6, 6]), { stiffness: 300, damping: 30 });
  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set(e.clientX - r.left - r.width / 2);
    y.set(e.clientY - r.top - r.height / 2);
  };
  return (
    <motion.div
      ref={ref}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* Mouse follow glow — opacity lifted for dark bg */
const MouseGlow = () => {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const h = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0"
      style={{
        background: `radial-gradient(600px circle at ${pos.x}px ${pos.y}px, rgba(99,102,241,0.08), transparent 50%)`,
      }}
    />
  );
};

/* Grid overlay — subtle on dark */
const GridOverlay = () => (
  <div
    className="pointer-events-none absolute inset-0"
    style={{
      backgroundImage: `linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)`,
      backgroundSize: '60px 60px',
    }}
  />
);

/* ═══════════════════════════════════════════════════════════════
   HERO
═══════════════════════════════════════════════════════════════ */
const Hero = () => (
  <section className="relative mx-auto flex max-w-6xl flex-col gap-12 overflow-visible px-4 pb-20 pt-10 md:flex-row md:items-center md:pt-16">
    <GridOverlay />

    {/* LEFT ── text content */}
    <div className="relative z-10 flex-1">

      {/* Badge pill */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 rounded-full border border-indigo-500/25 bg-gradient-to-r from-indigo-500/[0.12] to-violet-500/[0.10] px-4 py-1.5 text-xs font-semibold text-indigo-300 shadow-sm backdrop-blur"
      >
        <LiveDot />
        <Sparkles className="h-3.5 w-3.5" />
        AI-Powered Campus Intelligence Platform
      </motion.div>

      {/* H1 — near white, cinematic */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="mt-6 text-5xl font-extrabold leading-[1.1] tracking-tight text-white md:text-6xl lg:text-7xl"
      >
        The campus{' '}
        <span className="relative">
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
            operating system
          </span>
          <motion.span
            className="absolute -bottom-1 left-0 h-0.5 w-full bg-gradient-to-r from-indigo-500 to-violet-500"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            style={{ originX: 0 }}
          />
        </span>
        {' '}for modern colleges.
      </motion.h1>

      {/* Supporting text — slate-400, readable */}
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="mt-5 max-w-xl text-lg leading-relaxed text-slate-400"
      >
        Smart Campus Hub unifies communication, attendance, schedules, and wayfinding — crafted with glassmorphism, motion, and a production-grade API.
      </motion.p>

      {/* CTA buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
        className="mt-8 flex flex-wrap gap-3"
      >
        <Link to="/register">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button className="w-full gap-2 sm:w-auto">
              Launch console <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        </Link>
        <Link to="/login">
          <Button variant="ghost" className="w-full sm:w-auto">Sign in</Button>
        </Link>
      </motion.div>

      {/* Feature pills row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
        className="mt-10 flex flex-wrap gap-5 text-sm text-slate-400"
      >
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-cyan-400" /> Multi-role workspaces
        </div>
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-violet-400" /> Realtime notifications
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-400" /> JWT secured APIs
        </div>
      </motion.div>

      {/* Floating badges */}
      <div className="mt-8 flex flex-wrap gap-2">
        {[
          { label: 'AI Powered', icon: Cpu, color: 'text-violet-400' },
          { label: 'Realtime Sync', icon: Wifi, color: 'text-blue-400' },
          { label: 'Campus Analytics', icon: BarChart3, color: 'text-emerald-400' },
        ].map((badge, i) => (
          <motion.div
            key={badge.label}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.07 }}
          >
            <FloatingBadge>
              <badge.icon className={`h-3.5 w-3.5 ${badge.color}`} />
              {badge.label}
            </FloatingBadge>
          </motion.div>
        ))}
      </div>
    </div>

    {/* RIGHT ── Dashboard UI mockup (intentionally light-interior to show a "product screenshot") */}
    <motion.div
      initial={{ opacity: 0, scale: 0.94, x: 30 }}
      animate={{ opacity: 1, scale: 1, x: 0 }}
      transition={{ delay: 0.2, duration: 0.6 }}
      className="relative z-10 flex-1"
    >
      <TiltCard className="relative">
        {/* Ambient glow ring behind card */}
        <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-tr from-indigo-600/25 via-violet-600/15 to-cyan-500/20 blur-2xl" />

        {/* Dark glass outer card */}
        <div
          className="relative rounded-2xl border border-white/[0.10] backdrop-blur-2xl"
          style={{
            background: 'rgba(255,255,255,0.07)',
            boxShadow: '0 1px 0 rgba(255,255,255,0.10) inset, 0 24px 64px rgba(0,0,0,0.55)',
          }}
        >
          {/* Header bar — dark */}
          <div className="flex items-center justify-between border-b border-white/[0.08] px-5 py-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Live campus pulse</p>
              <p className="mt-0.5 text-sm font-bold text-white">Smart Campus Hub</p>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/[0.12] px-2.5 py-1 text-xs font-semibold text-emerald-300">
              <LiveDot color="bg-emerald-400" /> Live
            </div>
          </div>

          <div className="p-5">
            {/* Stats grid — dark glass mini-cards */}
            <div className="grid gap-3 sm:grid-cols-3">
              {stats.map((s) => (
                <motion.div
                  key={s.label}
                  whileHover={{ y: -2, scale: 1.02 }}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.05] p-3.5"
                >
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{s.label}</p>
                  <p className="mt-1.5 text-lg font-bold text-white">{s.value}</p>
                  <p className="text-[10px] text-slate-500">{s.hint}</p>
                </motion.div>
              ))}
            </div>

            {/* Next class card — keeps vibrant gradient */}
            <div className="mt-4 overflow-hidden rounded-xl bg-gradient-to-r from-slate-900 via-indigo-900/80 to-blue-900/70 p-4 text-white shadow-xl ring-1 ring-white/[0.08]">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-medium text-white/50">Next class</p>
                  <p className="mt-1 text-base font-bold text-white">Data Structures</p>
                  <p className="text-xs text-white/60">Hall A-101 · Synced live</p>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10">
                  <CalendarClock className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/20">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '65%' }}
                    transition={{ delay: 0.8, duration: 1.2 }}
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400"
                  />
                </div>
                <span className="text-[10px] font-semibold text-white/50">20 min</span>
              </div>
            </div>

            {/* Notification rows — dark glass */}
            <div className="mt-3 space-y-2">
              {[
                { msg: 'Attendance marked for CS-301', time: '2m ago', badge: 'bg-emerald-500/[0.15] text-emerald-300 border border-emerald-500/25' },
                { msg: 'New notice from Admin', time: '8m ago', badge: 'bg-blue-500/[0.15] text-blue-300 border border-blue-500/25' },
              ].map((n, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.12 }}
                  className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.04] px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <Bell className="h-3.5 w-3.5 text-slate-500" />
                    <span className="text-xs text-slate-300">{n.msg}</span>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${n.badge}`}>{n.time}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </TiltCard>
    </motion.div>
  </section>
);

/* ═══════════════════════════════════════════════════════════════
   TRUSTED BY
═══════════════════════════════════════════════════════════════ */
const TrustedBy = () => (
  <section
    className="border-y border-white/[0.07] py-10"
    style={{ background: 'rgba(255,255,255,0.025)' }}
  >
    <div className="mx-auto max-w-6xl px-4">
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-500">
        Trusted by leading institutions
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-6 md:gap-10">
        {universities.map((u, i) => (
          <motion.div
            key={u}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className="flex items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.05] px-4 py-2 text-sm font-semibold text-slate-300 backdrop-blur"
          >
            <GraduationCap className="h-4 w-4 text-indigo-400" />
            {u}
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ═══════════════════════════════════════════════════════════════
   FEATURES — dark glass cards, accent-colored icons
═══════════════════════════════════════════════════════════════ */
const Features = () => (
  <section id="features" className="mx-auto max-w-6xl px-4 py-20">
    <div className="text-center">
      <SectionLabel>Why it wins</SectionLabel>
      <SectionHeading>Designed like a startup<br />product team shipped it</SectionHeading>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="mx-auto mt-4 max-w-xl text-base text-slate-400"
      >
        Every feature is purpose-built for real campus operations — not another generic admin panel.
      </motion.p>
    </div>

    <div className="mt-14 grid gap-5 md:grid-cols-2">
      {features.map((f, i) => (
        <motion.div
          key={f.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.07 }}
          whileHover={{ y: -4 }}
          className={`group relative overflow-hidden rounded-2xl border bg-white/[0.05] p-6 backdrop-blur-xl transition-all duration-300 ${f.border} hover:bg-white/[0.08] hover:shadow-xl ${f.glow}`}
          style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.08) inset, 0 8px 32px rgba(0,0,0,0.35)' }}
        >
          {/* Corner glow */}
          <div className={`absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gradient-to-br ${f.accent} blur-2xl transition-all duration-500 group-hover:scale-150`} />

          {/* Gradient wash on hover */}
          <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${f.accent} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />

          <div className="relative flex items-start gap-4">
            <div className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${f.iconBg} ring-1 ring-white/[0.08]`}>
              <f.icon className={`h-6 w-6 ${f.iconColor}`} />
            </div>
            <div>
              {/* FIXED: was text-slate-900 (invisible on dark) */}
              <h3 className="text-lg font-bold text-white">{f.title}</h3>
              {/* FIXED: was text-slate-500 which is too dim on dark */}
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{f.desc}</p>
            </div>
          </div>

          <div className="relative mt-4 flex items-center gap-1.5 text-xs font-semibold text-slate-500 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100 group-hover:text-slate-300">
            Learn more <ChevronRight className="h-3.5 w-3.5" />
          </div>
        </motion.div>
      ))}
    </div>
  </section>
);

/* ═══════════════════════════════════════════════════════════════
   BENTO GRID — dark surfaces throughout
═══════════════════════════════════════════════════════════════ */
const BentoGrid = () => (
  <section className="mx-auto max-w-6xl px-4 py-16">
    <div className="text-center">
      <SectionLabel>Platform capabilities</SectionLabel>
      <SectionHeading>Everything your campus needs</SectionHeading>
    </div>

    <div className="mt-12 grid gap-4 md:grid-cols-3">

      {/* Hero stat card — gradient, keeps light text (on gradient bg) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-2xl shadow-indigo-900/50 md:col-span-2"
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/[0.08] blur-3xl" />
        <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-cyan-400/[0.12] blur-2xl" />
        <p className="text-xs font-bold uppercase tracking-widest text-white/50">Live analytics</p>
        <p className="mt-2 text-5xl font-black text-white">1,240+</p>
        <p className="text-base font-medium text-white/70">Active campus users · 3 roles · Real-time</p>
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { label: 'Attendance', val: '87%' },
            { label: 'Satisfaction', val: '94%' },
            { label: 'Uptime', val: '99.9%' },
          ].map((item) => (
            <div key={item.label} className="rounded-xl bg-white/[0.12] px-3 py-2 text-center backdrop-blur-sm">
              <p className="text-lg font-bold text-white">{item.val}</p>
              <p className="text-[10px] text-white/50">{item.label}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Notifications preview — FIXED: was bg-white/80 with light text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.08 }}
        className="relative overflow-hidden rounded-3xl border border-white/[0.10] bg-white/[0.06] p-5 backdrop-blur-xl"
        style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.09) inset, 0 16px 48px rgba(0,0,0,0.40)' }}
      >
        <div className="mb-3 flex items-center justify-between">
          {/* FIXED: was text-slate-800 */}
          <p className="text-sm font-bold text-white">Notifications</p>
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold text-white">3</span>
        </div>
        <div className="space-y-2.5">
          {[
            { icon: BellRing, bg: 'bg-blue-500/[0.15]', iconColor: 'text-blue-400', msg: 'New notice posted', time: '1m' },
            { icon: ShieldCheck, bg: 'bg-emerald-500/[0.15]', iconColor: 'text-emerald-400', msg: 'Attendance synced', time: '5m' },
            { icon: CalendarClock, bg: 'bg-violet-500/[0.15]', iconColor: 'text-violet-400', msg: 'Timetable updated', time: '12m' },
          ].map((n, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 + i * 0.1 }}
              className="flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.04] p-2.5"
            >
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${n.bg}`}>
                <n.icon className={`h-4 w-4 ${n.iconColor}`} />
              </div>
              <div className="min-w-0 flex-1">
                {/* FIXED: was text-slate-700 */}
                <p className="truncate text-xs font-semibold text-slate-200">{n.msg}</p>
              </div>
              {/* FIXED: was text-slate-400 */}
              <span className="shrink-0 text-[10px] text-slate-500">{n.time}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Platform capability tiles — FIXED: was bg-white/80 text-slate-800 */}
      {platformCaps.map((cap, i) => (
        <motion.div
          key={cap.label}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05 + 0.1 }}
          whileHover={{ y: -3, scale: 1.02 }}
          className="group rounded-2xl border border-white/[0.09] bg-white/[0.05] p-4 backdrop-blur-xl transition-all duration-300 hover:border-indigo-500/25 hover:bg-white/[0.08]"
          style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.07) inset, 0 4px 16px rgba(0,0,0,0.25)' }}
        >
          <div className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/[0.15] transition-all duration-300 group-hover:bg-indigo-500/[0.22]">
            <cap.icon className="h-4 w-4 text-indigo-400" />
          </div>
          {/* FIXED: was text-slate-800 */}
          <p className="text-sm font-bold text-white">{cap.label}</p>
          {/* FIXED: was text-slate-400 (too dim on dark) → slate-400 is fine but we use 400 */}
          <p className="mt-0.5 text-xs text-slate-400">{cap.desc}</p>
        </motion.div>
      ))}
    </div>
  </section>
);

/* ═══════════════════════════════════════════════════════════════
   ROLE DASHBOARDS — mostly already dark-correct, minor tuning
═══════════════════════════════════════════════════════════════ */
const RoleDashboards = () => {
  const [active, setActive] = useState('Student');
  const data = roleData[active];

  return (
    <section
      className="border-y border-white/[0.07] py-20"
      style={{ background: 'rgba(255,255,255,0.02)' }}
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="text-center">
          <SectionLabel>Role-based dashboards</SectionLabel>
          <SectionHeading>One platform, every role</SectionHeading>
          <p className="mx-auto mt-4 max-w-xl text-base text-slate-400">
            Personalized experiences for students, faculty, and administrators — all from a single codebase.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="mt-10 flex justify-center gap-2">
          {Object.keys(roleData).map((role) => {
            const Icon = roleData[role].icon;
            return (
              <button
                key={role}
                onClick={() => setActive(role)}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-200 ${active === role
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/30'
                    : 'border border-white/[0.10] bg-white/[0.05] text-slate-400 hover:border-indigo-500/30 hover:text-indigo-300'
                  }`}
              >
                <Icon className="h-4 w-4" /> {role}
              </button>
            );
          })}
        </div>

        {/* Dashboard preview card */}
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-8"
        >
          <div
            className="overflow-hidden rounded-2xl border border-white/[0.09]"
            style={{
              background: 'rgba(255,255,255,0.06)',
              boxShadow: '0 1px 0 rgba(255,255,255,0.10) inset, 0 16px 48px rgba(0,0,0,0.45)',
            }}
          >
            {/* Gradient header strip */}
            <div className={`flex items-center gap-3 bg-gradient-to-r ${data.color} px-6 py-4 text-white`}>
              <data.icon className="h-5 w-5" />
              <span className="font-semibold">{active} Dashboard</span>
              <span className="ml-auto flex items-center gap-1.5 text-xs text-white/70">
                <LiveDot /> Live
              </span>
            </div>

            <div className="grid gap-3 p-5 sm:grid-cols-2">
              {data.items.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.05] p-3.5"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.09]">
                    <item.icon className="h-4 w-4 text-slate-300" />
                  </div>
                  {/* FIXED: text-slate-300 already correct */}
                  <span className="flex-1 text-sm text-slate-200">{item.label}</span>
                  <span className="rounded-lg bg-white/[0.09] px-2 py-0.5 text-xs font-semibold text-slate-300">
                    {item.badge}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   HOW IT WORKS — FIXED: was bg-white/90 text-slate-900 (invisible)
═══════════════════════════════════════════════════════════════ */
const HowItWorks = () => (
  <section id="how-it-works" className="mx-auto max-w-6xl px-4 py-20">
    <div className="text-center">
      <SectionLabel>How it works</SectionLabel>
      <SectionHeading>Up and running in minutes</SectionHeading>
    </div>

    <div className="mt-14 grid gap-6 md:grid-cols-3">
      {steps.map((step, i) => (
        <motion.div
          key={step.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ y: -4 }}
          className="group relative overflow-hidden rounded-2xl border border-white/[0.09] bg-white/[0.05] p-7 backdrop-blur-xl transition-all duration-300 hover:border-indigo-500/20 hover:bg-white/[0.08]"
          style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.08) inset, 0 8px 32px rgba(0,0,0,0.35)' }}
        >
          {/* Corner ambient */}
          <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br from-indigo-500/[0.15] to-violet-500/[0.10] blur-xl transition-all duration-500 group-hover:scale-150" />

          {/* Big step number — visible on dark */}
          <p className="text-6xl font-black text-indigo-500/[0.18] transition-all duration-300 group-hover:text-indigo-500/[0.30]">
            {step.num}
          </p>

          {/* FIXED: was text-slate-900 */}
          <h3 className="mt-1 text-xl font-bold text-white">{step.title}</h3>
          {/* FIXED: was text-slate-500 */}
          <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.text}</p>

          <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-indigo-400 opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
            Learn more <ChevronRight className="h-3.5 w-3.5" />
          </div>
        </motion.div>
      ))}
    </div>
  </section>
);

/* ═══════════════════════════════════════════════════════════════
   TESTIMONIALS — FIXED: was bg-white/80 text-slate-700/900
═══════════════════════════════════════════════════════════════ */
const Testimonials = () => (
  <section id="voices" className="mx-auto max-w-6xl px-4 py-20">
    <div className="text-center">
      <SectionLabel>Voices from campus</SectionLabel>
      <SectionHeading>Loved by students &amp; faculty</SectionHeading>
    </div>

    <div className="mt-12 grid gap-6 md:grid-cols-2">
      {testimonials.map((t, i) => (
        <motion.div
          key={t.name}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08 }}
          whileHover={{ y: -4 }}
        >
          <div
            className="h-full rounded-2xl border border-white/[0.09] p-7 backdrop-blur-xl"
            style={{
              background: 'rgba(255,255,255,0.06)',
              boxShadow: '0 1px 0 rgba(255,255,255,0.10) inset, 0 8px 32px rgba(0,0,0,0.35)',
            }}
          >
            {/* Stars */}
            <div className="mb-4 flex">
              {Array.from({ length: t.rating }).map((_, j) => (
                <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
              ))}
            </div>

            {/* FIXED: was text-slate-700 italic */}
            <p className="text-base italic leading-relaxed text-slate-300">"{t.quote}"</p>

            <div className="mt-5 flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${t.color} text-xs font-bold text-white shadow-lg`}>
                {t.avatar}
              </div>
              <div>
                {/* FIXED: was text-slate-900 */}
                <p className="text-sm font-bold text-white">{t.name}</p>
                <p className="text-xs text-slate-500">{t.role}</p>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </section>
);

/* ═══════════════════════════════════════════════════════════════
   CTA — already mostly dark-correct, minor polish
═══════════════════════════════════════════════════════════════ */
const CTA = () => (
  <section className="mx-auto max-w-5xl px-4 pb-28">
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 p-[1.5px] shadow-2xl shadow-violet-900/40"
    >
      <div className="relative overflow-hidden rounded-[2rem] bg-[#070b1f] px-8 py-14 text-center text-white">
        <div className="pointer-events-none absolute -left-20 top-0 h-48 w-48 rounded-full bg-indigo-500/[0.15] blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-0 h-48 w-48 rounded-full bg-violet-500/[0.15] blur-3xl" />
        <GridOverlay />

        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur"
          >
            <LiveDot color="bg-cyan-400" /> Ready to deploy
          </motion.div>

          <h2 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            Ready to impress the judges?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-white/60">
            Spin up the API, seed demo users, and walk through role-based dashboards — polished UI, realtime signals, and a credible data model.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-slate-900 shadow-xl shadow-white/20 transition hover:shadow-white/30"
              >
                Create your hub <ArrowRight className="h-4 w-4" />
              </motion.button>
            </Link>
            <Link to="/contact">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                Talk to us
              </motion.button>
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-white/50">
            {['No credit card required', 'JWT-secured APIs', 'Socket.IO realtime'].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-cyan-400" /> {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  </section>
);

/* ═══════════════════════════════════════════════════════════════
   ROOT — CRITICAL FIX:
   Removed `bg-gradient-to-b from-slate-50 via-white` which was
   painting a white/light gradient over the dark canvas.
   Now transparent so PublicLayout's dark background shows through.
═══════════════════════════════════════════════════════════════ */
export default function Landing() {
  return (
    <div className="relative overflow-hidden">
      <MouseGlow />

      {/* Subtle ambient orbs — reduced opacity vs original */}
      <GradientOrb className="h-96 w-96 -left-32 top-10 bg-indigo-600/[0.12]" />
      <GradientOrb className="h-[500px] w-[500px] -right-40 top-32 bg-violet-600/[0.09]" />
      <GradientOrb className="h-80 w-80 left-1/4 top-[60%] bg-cyan-500/[0.08]" />
      <GradientOrb className="h-64 w-64 right-1/3 top-[80%] bg-indigo-500/[0.07]" />

      <Hero />
      <TrustedBy />
      <Features />
      <BentoGrid />
      <RoleDashboards />
      <HowItWorks />
      <Testimonials />
      <CTA />
    </div>
  );
}