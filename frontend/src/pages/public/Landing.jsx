/**
 * Landing.jsx — COSMIC AURORA DIGITAL CAMPUS
 * Smart Campus Hub — Awwwards-level flagship landing page
 *
 * Design Identity: "Cosmic Aurora Digital Campus"
 * Palette: electric magenta · aurora purple · warm coral · neon cyan
 *          emerald glow · sunset orange · holographic gold
 * Typography: Sora (headings) · DM Sans (body) · Space Grotesk (numbers/stats)
 * Motion: Framer Motion — stagger reveals, floating, magnetic, parallax tilt
 */

import { Link } from 'react-router-dom';
import {
  motion, useMotionValue, useSpring, useTransform,
  useScroll, useInView, animate,
} from 'framer-motion';
import { useRef, useState, useEffect, useCallback } from 'react';
import {
  ArrowRight, Sparkles, Users, Zap, ShieldCheck, Globe, Database,
  Cpu, Wifi, Lock, BarChart3, GraduationCap, BookOpen, Settings2,
  CalendarClock, BellRing, MapPinned, Activity, TrendingUp,
  Star, CheckCircle2, Bell, ChevronRight, Code2, Server,
  Layers, GitBranch, Terminal, CloudUpload, Brain,
  Atom, Radar, LineChart, Workflow, Eye,
} from 'lucide-react';

/* ─── Google Fonts injection ─────────────────────────────────── */
const FontLoader = () => {
  useEffect(() => {
    const link = document.createElement('link');
    link.href =
      'https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&family=Space+Grotesk:wght@400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);
  return null;
};

/* ─── CSS injection for custom font vars ─────────────────────── */
const StyleInjector = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .sch-hero-h1 { font-family: 'Sora', sans-serif; }
      .sch-heading  { font-family: 'Sora', sans-serif; }
      .sch-body     { font-family: 'DM Sans', sans-serif; }
      .sch-stat     { font-family: 'Space Grotesk', sans-serif; }

      @keyframes aurora-drift {
        0%   { transform: translate(0%, 0%) rotate(0deg) scale(1); }
        33%  { transform: translate(3%, -2%) rotate(2deg) scale(1.04); }
        66%  { transform: translate(-2%, 3%) rotate(-1deg) scale(0.97); }
        100% { transform: translate(0%, 0%) rotate(0deg) scale(1); }
      }
      @keyframes aurora-drift-2 {
        0%   { transform: translate(0%, 0%) rotate(0deg) scale(1); }
        40%  { transform: translate(-4%, 2%) rotate(-3deg) scale(1.06); }
        80%  { transform: translate(3%, -3%) rotate(2deg) scale(0.95); }
        100% { transform: translate(0%, 0%) rotate(0deg) scale(1); }
      }
      @keyframes float-y {
        0%, 100% { transform: translateY(0px); }
        50%       { transform: translateY(-14px); }
      }
      @keyframes float-y-slow {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50%       { transform: translateY(-20px) rotate(4deg); }
      }
      @keyframes shine-sweep {
        0%   { left: -80%; }
        100% { left: 130%; }
      }
      @keyframes pulse-ring {
        0%   { transform: scale(1); opacity: 0.6; }
        100% { transform: scale(1.9); opacity: 0; }
      }
      @keyframes spin-slow {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      @keyframes spin-slow-rev {
        from { transform: rotate(0deg); }
        to   { transform: rotate(-360deg); }
      }
      @keyframes gradient-morph {
        0%, 100% { background-position: 0% 50%; }
        50%       { background-position: 100% 50%; }
      }
      @keyframes ticker-scroll {
        0%   { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .sch-primary-btn {
        position: relative; overflow: hidden;
        background: linear-gradient(135deg, #e040fb, #7c3aed, #06b6d4);
        background-size: 200% 200%;
        animation: gradient-morph 4s ease infinite;
        box-shadow: 0 0 32px rgba(124,58,237,0.45), 0 4px 20px rgba(0,0,0,0.4);
        transition: transform 0.2s, box-shadow 0.2s;
      }
      .sch-primary-btn::after {
        content: '';
        position: absolute; top: 0; left: -80%;
        width: 60%; height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
        transform: skewX(-20deg);
        animation: shine-sweep 3s ease-in-out infinite;
      }
      .sch-primary-btn:hover {
        transform: scale(1.04) translateY(-1px);
        box-shadow: 0 0 52px rgba(124,58,237,0.6), 0 8px 32px rgba(0,0,0,0.5);
      }
      .sch-ghost-btn {
        position: relative;
        background: rgba(255,255,255,0.05);
        border: 1px solid transparent;
        background-clip: padding-box;
        transition: background 0.2s, transform 0.2s;
      }
      .sch-ghost-btn::before {
        content: '';
        position: absolute; inset: -1px;
        border-radius: inherit;
        background: linear-gradient(135deg, rgba(224,64,251,0.5), rgba(6,182,212,0.5));
        z-index: -1;
      }
      .sch-ghost-btn:hover { background: rgba(255,255,255,0.10); transform: scale(1.03); }
      .sch-glass-card {
        background: rgba(255,255,255,0.04);
        border: 1px solid rgba(255,255,255,0.09);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        box-shadow: 0 1px 0 rgba(255,255,255,0.07) inset, 0 16px 48px rgba(0,0,0,0.4);
      }
      .sch-section-bg { background: rgba(255,255,255,0.015); }
      .sch-orbit-ring {
        animation: spin-slow 22s linear infinite;
      }
      .sch-orbit-ring-rev {
        animation: spin-slow-rev 30s linear infinite;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  return null;
};

/* ─── Data ───────────────────────────────────────────────────── */

const ecosystemModules = [
  { label: 'Student Portal', icon: GraduationCap, color: '#06b6d4', desc: 'Personalized dashboard for every learner' },
  { label: 'Faculty Workspace', icon: BookOpen, color: '#a855f7', desc: 'Tools built for modern educators' },
  { label: 'Admin Intelligence', icon: Settings2, color: '#e040fb', desc: 'Command center for campus operations' },
  { label: 'Attendance System', icon: ShieldCheck, color: '#10b981', desc: 'Real-time session tracking & analytics' },
  { label: 'Placement Cell', icon: TrendingUp, color: '#f59e0b', desc: 'End-to-end career & placement management' },
  { label: 'Events Engine', icon: CalendarClock, color: '#ef4444', desc: 'Campus events from draft to broadcast' },
  { label: 'Library Services', icon: Database, color: '#3b82f6', desc: 'Digital catalogue & resource access' },
  { label: 'AI Analytics', icon: Brain, color: '#ec4899', desc: 'Predictive insights & smart automation' },
  { label: 'Communication Hub', icon: BellRing, color: '#14b8a6', desc: 'Role-aware campus-wide messaging' },
  { label: 'Campus Navigation', icon: MapPinned, color: '#f97316', desc: 'Interactive indoor & outdoor maps' },
];

const legacyPains = [
  { text: 'Manual attendance sheets & physical registers', icon: '📋' },
  { text: 'Fragmented portals with zero integration', icon: '🧩' },
  { text: 'Paper-heavy administrative workflows', icon: '📄' },
  { text: 'Delayed notices & communication breakdowns', icon: '📮' },
  { text: 'Siloed departments with no shared data layer', icon: '🏚️' },
];

const transformations = [
  { text: 'AI-powered real-time attendance intelligence', icon: Brain },
  { text: 'Unified platform — one login, every module', icon: Layers },
  { text: 'Digital-first end-to-end workflow automation', icon: Workflow },
  { text: 'Instant multi-channel role-aware broadcasts', icon: Radar },
  { text: 'Centralized data layer with live campus analytics', icon: LineChart },
];

const dashboardStories = [
  {
    label: 'Student',
    color: 'from-cyan-500 to-blue-600',
    tagline: 'Everything a student needs, distilled.',
    items: [
      { icon: CalendarClock, text: 'Data Structures — Hall A-101', badge: 'In 20 min', bc: 'bg-cyan-500/20 text-cyan-300' },
      { icon: ShieldCheck, text: 'Attendance: 87% overall', badge: 'On Track', bc: 'bg-emerald-500/20 text-emerald-300' },
      { icon: BellRing, text: '3 unread notices from admin', badge: 'New', bc: 'bg-violet-500/20 text-violet-300' },
      { icon: MapPinned, text: 'Lab B-204 directions ready', badge: 'Maps', bc: 'bg-orange-500/20 text-orange-300' },
    ],
  },
  {
    label: 'Faculty',
    color: 'from-violet-500 to-purple-700',
    tagline: 'Teach, track, and communicate — seamlessly.',
    items: [
      { icon: Users, text: '42 students in live session', badge: 'Live', bc: 'bg-red-500/20 text-red-300' },
      { icon: ShieldCheck, text: 'Mark attendance for CS-301', badge: 'Pending', bc: 'bg-amber-500/20 text-amber-300' },
      { icon: CalendarClock, text: '4 classes scheduled today', badge: 'Today', bc: 'bg-cyan-500/20 text-cyan-300' },
      { icon: BellRing, text: 'Department notice awaiting', badge: 'Draft', bc: 'bg-emerald-500/20 text-emerald-300' },
    ],
  },
  {
    label: 'Admin',
    color: 'from-emerald-500 to-teal-700',
    tagline: 'Total campus visibility, one command center.',
    items: [
      { icon: Users, text: '1,240 active students enrolled', badge: 'Total', bc: 'bg-blue-500/20 text-blue-300' },
      { icon: Activity, text: 'Campus utilization: 78%', badge: 'Live', bc: 'bg-emerald-500/20 text-emerald-300' },
      { icon: TrendingUp, text: 'Attendance rate up +12%', badge: '↑', bc: 'bg-green-500/20 text-green-300' },
      { icon: Globe, text: 'All departments synced', badge: 'OK', bc: 'bg-cyan-500/20 text-cyan-300' },
    ],
  },
];

const bentoFeatures = [
  { title: 'Attendance Intelligence', desc: 'Facial + QR + manual — session-linked, fraud-resistant real-time sync.', icon: ShieldCheck, accent: '#10b981', span: 'md:col-span-2', big: true },
  { title: 'Placement Automation', desc: 'End-to-end offer tracking, resume scoring, and recruiter management.', icon: TrendingUp, accent: '#f59e0b', span: '' },
  { title: 'Smart Notifications', desc: 'Role-filtered broadcasts via Socket.IO with zero latency.', icon: BellRing, accent: '#e040fb', span: '' },
  { title: 'Campus Event Engine', desc: 'Draft, publish, RSVP, and analytics — full lifecycle.', icon: CalendarClock, accent: '#ef4444', span: '' },
  { title: 'Faculty Workspace', desc: 'Dedicated UX for class management, grade flow, and communication.', icon: BookOpen, accent: '#a855f7', span: 'md:col-span-2', big: true },
  { title: 'Security & RBAC', desc: 'JWT-based zero-trust auth with granular role-level API guards.', icon: Lock, accent: '#06b6d4', span: '' },
  { title: 'Analytics Dashboard', desc: 'Real-time campus pulse — utilization, trends, anomaly detection.', icon: BarChart3, accent: '#3b82f6', span: '' },
];

const techStack = [
  { name: 'React', category: 'Frontend', icon: Code2, color: '#61dafb' },
  { name: 'Vite', category: 'Build Tool', icon: Zap, color: '#f97316' },
  { name: 'Node.js', category: 'Runtime', icon: Server, color: '#84cc16' },
  { name: 'Express', category: 'API Layer', icon: Layers, color: '#94a3b8' },
  { name: 'MySQL', category: 'Database', icon: Database, color: '#00aff0' },
  { name: 'Socket.IO', category: 'Realtime', icon: Wifi, color: '#e040fb' },
  { name: 'JWT', category: 'Auth', icon: Lock, color: '#f59e0b' },
  { name: 'Vercel', category: 'Deploy', icon: CloudUpload, color: '#ffffff' },
  { name: 'Render', category: 'Backend', icon: Terminal, color: '#10b981' },
  { name: 'GitHub', category: 'VCS', icon: GitBranch, color: '#a78bfa' },
];

const metricsList = [
  { value: 10, suffix: '+', label: 'Platform Modules', color: '#e040fb' },
  { value: 3, suffix: '', label: 'Role Architectures', color: '#06b6d4' },
  { value: 99.9, suffix: '%', label: 'API Uptime', color: '#10b981' },
  { value: 1240, suffix: '+', label: 'Active Campus Users', color: '#f59e0b' },
  { value: 0, suffix: 'ms', label: 'Socket Latency', color: '#a855f7' },
  { value: 100, suffix: '%', label: 'Role-Guarded APIs', color: '#ef4444' },
];

const testimonials = [
  {
    quote: 'The most polished academic platform I have ever seen. It feels like the Stripe of campus software — every detail is considered.',
    name: 'Dr. Ananya Singh',
    role: 'Head of Computer Science, VJTI Mumbai',
    avatar: 'AS',
    color: 'from-violet-600 to-purple-600',
    rating: 5,
  },
  {
    quote: 'Our student council was amazed. Real-time attendance, live notices, and the dashboard — it just works beautifully across all devices.',
    name: 'Rahul Mehta',
    role: 'Student Council President',
    avatar: 'RM',
    color: 'from-cyan-600 to-blue-600',
    rating: 5,
  },
  {
    quote: 'Recruitment workflows that used to take days now run automatically. The placement module alone is worth adopting the whole platform.',
    name: 'Priya Nair',
    role: 'Placement Coordinator, IIT',
    avatar: 'PN',
    color: 'from-emerald-600 to-teal-600',
    rating: 5,
  },
];

const footerLinks = {
  Platform: ['Student Portal', 'Faculty Workspace', 'Admin Dashboard', 'Attendance', 'Placement', 'Events', 'Library'],
  Technology: ['React', 'Node.js', 'Express', 'MySQL', 'JWT', 'Socket.IO', 'Vercel'],
  Resources: ['Features', 'Architecture', 'GitHub', 'Documentation', 'API Reference'],
};

/* ─── Micro-components ───────────────────────────────────────── */

const LiveDot = ({ color = '#10b981' }) => (
  <span className="relative flex h-2 w-2 shrink-0">
    <span className="absolute inline-flex h-full w-full rounded-full opacity-75"
      style={{ backgroundColor: color, animation: 'pulse-ring 1.4s cubic-bezier(0,0,0.2,1) infinite' }} />
    <span className="relative inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
  </span>
);

const GradientText = ({ children, from = '#e040fb', via = '#7c3aed', to = '#06b6d4', className = '' }) => (
  <span
    className={className}
    style={{
      background: `linear-gradient(135deg, ${from}, ${via}, ${to})`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    }}
  >
    {children}
  </span>
);

const SectionPill = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest sch-body"
    style={{
      background: 'rgba(224,64,251,0.1)',
      border: '1px solid rgba(224,64,251,0.25)',
      color: '#e040fb',
    }}
  >
    <Sparkles className="h-3 w-3" />
    {children}
  </motion.div>
);

const SectionHeading = ({ children, className = '' }) => (
  <motion.h2
    initial={{ opacity: 0, y: 14 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: 0.06 }}
    className={`sch-heading mt-3 text-3xl font-bold leading-tight text-white md:text-4xl lg:text-5xl ${className}`}
  >
    {children}
  </motion.h2>
);

/* 3D Tilt card */
const TiltCard = ({ children, className = '', intensity = 8 }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotX = useSpring(useTransform(y, [-60, 60], [intensity, -intensity]), { stiffness: 280, damping: 28 });
  const rotY = useSpring(useTransform(x, [-60, 60], [-intensity, intensity]), { stiffness: 280, damping: 28 });
  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set(e.clientX - r.left - r.width / 2);
    y.set(e.clientY - r.top - r.height / 2);
  };
  return (
    <motion.div
      ref={ref}
      style={{ rotateX: rotX, rotateY: rotY, transformStyle: 'preserve-3d' }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/* Mouse cursor glow */
const MouseGlow = () => {
  const [pos, setPos] = useState({ x: -500, y: -500 });
  useEffect(() => {
    const h = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', h, { passive: true });
    return () => window.removeEventListener('mousemove', h);
  }, []);
  return (
    <div
      className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
      style={{
        background: `radial-gradient(700px circle at ${pos.x}px ${pos.y}px, rgba(224,64,251,0.06), rgba(124,58,237,0.04) 30%, transparent 60%)`,
      }}
    />
  );
};

/* Animated counter */
const AnimatedCounter = ({ target, suffix = '', decimals = 0 }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const ctrl = animate(0, target, {
      duration: 2.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setVal(decimals > 0 ? parseFloat(v.toFixed(decimals)) : Math.floor(v)),
    });
    return () => ctrl.stop();
  }, [inView, target, decimals]);
  return (
    <span ref={ref} className="sch-stat">
      {val}{suffix}
    </span>
  );
};

/* Aurora background */
const AuroraBackground = () => (
  <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
    {/* Deep bg */}
    <div className="absolute inset-0" style={{ background: '#05030f' }} />
    {/* Aurora blobs */}
    <div className="absolute" style={{
      inset: '-20%',
      background: 'radial-gradient(ellipse 70% 50% at 20% 15%, rgba(224,64,251,0.14) 0%, transparent 60%)',
      animation: 'aurora-drift 18s ease-in-out infinite',
    }} />
    <div className="absolute" style={{
      inset: '-20%',
      background: 'radial-gradient(ellipse 60% 50% at 80% 80%, rgba(6,182,212,0.11) 0%, transparent 60%)',
      animation: 'aurora-drift-2 22s ease-in-out infinite',
    }} />
    <div className="absolute" style={{
      inset: '-20%',
      background: 'radial-gradient(ellipse 80% 40% at 50% 100%, rgba(124,58,237,0.10) 0%, transparent 55%)',
      animation: 'aurora-drift 28s ease-in-out infinite reverse',
    }} />
    <div className="absolute" style={{
      inset: '-20%',
      background: 'radial-gradient(ellipse 50% 60% at 90% 20%, rgba(16,185,129,0.07) 0%, transparent 50%)',
      animation: 'aurora-drift-2 35s ease-in-out infinite',
    }} />
    {/* Grid */}
    <div className="absolute inset-0" style={{
      backgroundImage: `linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)`,
      backgroundSize: '80px 80px',
    }} />
    {/* Subtle grain noise */}
    <div className="absolute inset-0" style={{
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
      opacity: 0.4,
    }} />
  </div>
);

/* ═══════════════════════════════════════════════════════════════
   SECTION 1 — HERO
═══════════════════════════════════════════════════════════════ */
const Hero = () => {
  const trustChips = [
    { label: 'AI Powered', icon: Brain, color: '#e040fb' },
    { label: 'Enterprise Secure', icon: Lock, color: '#10b981' },
    { label: 'Multi Portal', icon: Layers, color: '#06b6d4' },
    { label: 'Real-Time Platform', icon: Wifi, color: '#f59e0b' },
    { label: 'Production Ready', icon: CheckCircle2, color: '#a855f7' },
  ];

  return (
    <section className="relative mx-auto flex max-w-7xl flex-col gap-12 overflow-visible px-6 pb-24 pt-12 md:flex-row md:items-center md:pt-20">

      {/* LEFT */}
      <div className="relative z-10 flex-1">

        {/* Pill badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold sch-body"
          style={{
            background: 'linear-gradient(135deg, rgba(224,64,251,0.12), rgba(6,182,212,0.10))',
            border: '1px solid rgba(224,64,251,0.3)',
            color: '#e0b0ff',
          }}
        >
          <LiveDot color="#e040fb" />
          <Atom className="h-3.5 w-3.5" style={{ color: '#e040fb' }} />
          Cosmic Aurora Digital Campus — v2.0 Live
        </motion.div>

        {/* H1 */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="sch-hero-h1 mt-6 text-5xl font-extrabold leading-[1.08] tracking-tight text-white md:text-6xl lg:text-7xl"
        >
          Smart Campus,
          <br />
          <GradientText from="#e040fb" via="#7c3aed" to="#06b6d4">
            Reimagined
          </GradientText>
          <br />
          <span className="text-white">for the Future.</span>
        </motion.h1>

        {/* Underline */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.7 }}
          style={{
            originX: 0,
            height: 2,
            marginTop: 6,
            width: '70%',
            background: 'linear-gradient(90deg, #e040fb, #06b6d4, transparent)',
            borderRadius: 2,
          }}
        />

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="sch-body mt-6 max-w-lg text-lg leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.55)' }}
        >
          A flagship full-stack platform that transforms disconnected campus systems into a unified,
          AI-powered digital operating system — built for students, faculty, and administrators.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="mt-8 flex flex-wrap gap-3"
        >
          <Link to="/register">
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="sch-primary-btn sch-body flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-white"
            >
              <Sparkles className="h-4 w-4" /> Explore Platform <ArrowRight className="h-4 w-4" />
            </motion.button>
          </Link>
          <a href="https://github.com/YashSurve2006" target="_blank" rel="noreferrer">
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="sch-ghost-btn sch-body flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold text-white"
            >
              <GitBranch className="h-4 w-4" /> View GitHub
            </motion.button>
          </a>
          <Link to="/login">
            <motion.button
              whileTap={{ scale: 0.97 }}
              className="sch-body flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold transition-colors"
              style={{ color: 'rgba(255,255,255,0.55)' }}
              whileHover={{ color: 'rgba(255,255,255,0.9)' }}
            >
              Live Demo <Eye className="h-4 w-4" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Trust Chips */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-9 flex flex-wrap gap-2"
        >
          {trustChips.map((chip, i) => (
            <motion.div
              key={chip.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.38 + i * 0.06 }}
              style={{ animation: `float-y ${2.8 + i * 0.3}s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold sch-body"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${chip.color}30`,
                color: chip.color,
                animation: `float-y ${2.8 + i * 0.3}s ease-in-out ${i * 0.2}s infinite`,
              }}
            >
              <chip.icon className="h-3.5 w-3.5" />
              {chip.label}
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* RIGHT — floating dashboard mockup */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, x: 30 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ delay: 0.25, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex-1"
        style={{ animation: 'float-y-slow 7s ease-in-out infinite' }}
      >
        <TiltCard className="relative">
          {/* Glow behind */}
          <div className="absolute -inset-6 rounded-[3rem] blur-3xl" style={{
            background: 'radial-gradient(ellipse at center, rgba(224,64,251,0.22) 0%, rgba(6,182,212,0.12) 60%, transparent 80%)',
          }} />

          {/* Main card */}
          <div className="relative rounded-[1.75rem] sch-glass-card overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl"
                  style={{ background: 'linear-gradient(135deg, #e040fb, #7c3aed)' }}>
                  <Atom className="h-4 w-4 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest sch-body" style={{ color: 'rgba(255,255,255,0.35)' }}>Live Campus OS</p>
                  <p className="text-sm font-bold text-white sch-heading">Smart Campus Hub</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold sch-body"
                style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}>
                <LiveDot color="#10b981" /> Live
              </div>
            </div>

            <div className="p-5">
              {/* Stat row */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Active Users', val: '1,240', color: '#e040fb' },
                  { label: 'Uptime', val: '99.9%', color: '#10b981' },
                  { label: 'Modules', val: '10+', color: '#06b6d4' },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <p className="text-[10px] font-semibold uppercase tracking-wide sch-body" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</p>
                    <p className="mt-1 text-lg font-bold sch-stat" style={{ color: s.color }}>{s.val}</p>
                  </div>
                ))}
              </div>

              {/* Next class */}
              <div className="mt-4 overflow-hidden rounded-xl p-4"
                style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(6,182,212,0.2))', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-medium sch-body" style={{ color: 'rgba(255,255,255,0.4)' }}>Next Class</p>
                    <p className="mt-1 text-base font-bold text-white sch-heading">Data Structures</p>
                    <p className="text-xs sch-body" style={{ color: 'rgba(255,255,255,0.5)' }}>Hall A-101 · Live Sync</p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: 'rgba(255,255,255,0.1)' }}>
                    <CalendarClock className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }}>
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: '65%' }}
                      transition={{ delay: 1, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg, #e040fb, #06b6d4)' }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold sch-body" style={{ color: 'rgba(255,255,255,0.45)' }}>20 min</span>
                </div>
              </div>

              {/* Notification rows */}
              <div className="mt-3 space-y-2">
                {[
                  { msg: 'Attendance synced for CS-301', dot: '#10b981', time: '2m' },
                  { msg: 'New notice from Admin portal', dot: '#e040fb', time: '8m' },
                  { msg: 'Placement drive — Google Inc.', dot: '#f59e0b', time: '1h' },
                ].map((n, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + i * 0.15 }}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                  >
                    <LiveDot color={n.dot} />
                    <span className="flex-1 truncate text-xs sch-body" style={{ color: 'rgba(255,255,255,0.65)' }}>{n.msg}</span>
                    <span className="shrink-0 text-[10px] sch-body" style={{ color: 'rgba(255,255,255,0.3)' }}>{n.time}</span>
                  </motion.div>
                ))}
              </div>

              {/* Role switcher */}
              <div className="mt-3 flex gap-1.5">
                {['Student', 'Faculty', 'Admin'].map((r, i) => (
                  <motion.button
                    key={r}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 + i * 0.08 }}
                    className="rounded-lg px-2.5 py-1 text-xs font-semibold sch-body transition-all"
                    style={i === 0
                      ? { background: 'linear-gradient(135deg, #e040fb, #7c3aed)', color: '#fff' }
                      : { background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.07)' }
                    }
                  >
                    {r}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </TiltCard>
      </motion.div>
    </section>
  );
};

/* ─── Marquee ticker ─────────────────────────────────────────── */
const InstitutionTicker = () => {
  const items = [
    'MIT Campus', 'Stanford Uni', 'IIT Bombay', 'Harvard EDU', 'Oxford Connect',
    'NUS Singapore', 'VJTI Mumbai', 'IIM Ahmedabad', 'Columbia Uni', 'CalTech',
  ];
  const doubled = [...items, ...items];
  return (
    <div className="relative overflow-hidden py-10" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <p className="mb-5 text-center text-[10px] font-bold uppercase tracking-widest sch-body" style={{ color: 'rgba(255,255,255,0.3)' }}>
        Trusted by leading academic institutions
      </p>
      <div className="relative">
        <div className="absolute left-0 top-0 z-10 h-full w-20" style={{ background: 'linear-gradient(90deg, #05030f, transparent)' }} />
        <div className="absolute right-0 top-0 z-10 h-full w-20" style={{ background: 'linear-gradient(270deg, #05030f, transparent)' }} />
        <div style={{ display: 'flex', animation: 'ticker-scroll 28s linear infinite', width: 'max-content' }}>
          {doubled.map((inst, i) => (
            <div key={i} className="flex items-center gap-2 rounded-xl px-4 py-2 mx-2 shrink-0 sch-body text-sm font-semibold"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.55)' }}>
              <GraduationCap className="h-4 w-4" style={{ color: '#e040fb' }} />
              {inst}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SECTION 2 — CAMPUS ECOSYSTEM ORBIT
═══════════════════════════════════════════════════════════════ */
const EcosystemOrbit = () => {
  const [hovered, setHovered] = useState(null);

  return (
    <section className="relative mx-auto max-w-7xl px-6 py-24 overflow-hidden">
      <div className="text-center mb-16">
        <SectionPill>Campus Ecosystem</SectionPill>
        <SectionHeading>Every Campus System,<br /><GradientText from="#e040fb" via="#a855f7" to="#06b6d4">Interconnected.</GradientText></SectionHeading>
        <motion.p
          initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
          className="sch-body mx-auto mt-4 max-w-xl text-base" style={{ color: 'rgba(255,255,255,0.45)' }}
        >
          Smart Campus Hub acts as the central neural core — every module orbits and syncs in real time.
        </motion.p>
      </div>

      {/* Orbit visual */}
      <div className="relative mx-auto flex items-center justify-center" style={{ height: 560, maxWidth: 620 }}>

        {/* Orbit rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="rounded-full sch-orbit-ring absolute"
            style={{ width: 480, height: 480, border: '1px solid rgba(224,64,251,0.12)' }} />
          <div className="rounded-full sch-orbit-ring-rev absolute"
            style={{ width: 340, height: 340, border: '1px dashed rgba(6,182,212,0.12)' }} />
          <div className="rounded-full absolute"
            style={{ width: 200, height: 200, border: '1px solid rgba(255,255,255,0.06)' }} />
        </div>

        {/* Core */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true }}
          transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.2 }}
          className="relative z-20 flex flex-col items-center justify-center rounded-full"
          style={{
            width: 140, height: 140,
            background: 'linear-gradient(135deg, rgba(224,64,251,0.2), rgba(124,58,237,0.3), rgba(6,182,212,0.15))',
            border: '1px solid rgba(224,64,251,0.4)',
            boxShadow: '0 0 60px rgba(224,64,251,0.3), 0 0 120px rgba(124,58,237,0.15)',
          }}
        >
          <div className="absolute inset-0 rounded-full" style={{ animation: 'pulse-ring 2s ease-out infinite', background: 'rgba(224,64,251,0.15)' }} />
          <Atom className="h-8 w-8 mb-1" style={{ color: '#e040fb' }} />
          <p className="text-xs font-bold sch-heading text-white text-center leading-tight">Smart<br />Campus</p>
          <p className="text-[9px] sch-body mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Neural Core</p>
        </motion.div>

        {/* Orbiting modules */}
        {ecosystemModules.map((mod, i) => {
          const angle = (i / ecosystemModules.length) * Math.PI * 2 - Math.PI / 2;
          const r = 230;
          const cx = r * Math.cos(angle);
          const cy = r * Math.sin(angle);
          return (
            <motion.div
              key={mod.label}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="absolute z-10 cursor-pointer"
              style={{ transform: `translate(${cx}px, ${cy}px)`, translateX: '-50%', translateY: '-50%' }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <motion.div
                whileHover={{ scale: 1.18 }}
                className="flex flex-col items-center"
              >
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{
                    background: `${mod.color}18`,
                    border: `1px solid ${mod.color}40`,
                    boxShadow: hovered === i ? `0 0 24px ${mod.color}50` : 'none',
                    transition: 'box-shadow 0.3s',
                  }}>
                  <mod.icon className="h-5 w-5" style={{ color: mod.color }} />
                </div>
                <p className="mt-1 text-center text-[10px] font-semibold sch-body text-white leading-tight" style={{ maxWidth: 64, color: hovered === i ? mod.color : 'rgba(255,255,255,0.7)', transition: 'color 0.2s' }}>
                  {mod.label}
                </p>
                {hovered === i && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute top-full mt-2 rounded-xl px-3 py-2 text-[10px] sch-body text-white text-center pointer-events-none z-30"
                    style={{
                      background: `linear-gradient(135deg, ${mod.color}25, rgba(0,0,0,0.8))`,
                      border: `1px solid ${mod.color}40`,
                      backdropFilter: 'blur(12px)',
                      minWidth: 130,
                      whiteSpace: 'normal',
                    }}
                  >
                    {mod.desc}
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SECTION 3 — PROBLEM → TRANSFORMATION STORYTELLING
═══════════════════════════════════════════════════════════════ */
const Transformation = () => (
  <section className="mx-auto max-w-7xl px-6 py-24">
    <div className="text-center mb-14">
      <SectionPill>The Shift</SectionPill>
      <SectionHeading>From Legacy Chaos<br />to <GradientText from="#10b981" via="#06b6d4" to="#e040fb">Digital Excellence.</GradientText></SectionHeading>
    </div>

    <div className="grid md:grid-cols-2 gap-6">
      {/* Legacy side */}
      <motion.div
        initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
        className="rounded-3xl p-7 relative overflow-hidden"
        style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}
      >
        <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full blur-2xl" style={{ background: 'rgba(239,68,68,0.12)' }} />
        <p className="text-xs font-bold uppercase tracking-widest sch-body mb-4" style={{ color: '#ef4444' }}>❌ Legacy Campus Reality</p>
        <div className="space-y-3">
          {legacyPains.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3 rounded-xl px-4 py-3 sch-body text-sm"
              style={{ background: 'rgba(239,68,68,0.07)', color: 'rgba(255,255,255,0.65)' }}
            >
              <span className="text-base shrink-0">{p.icon}</span>
              {p.text}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Transformation side */}
      <motion.div
        initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
        className="rounded-3xl p-7 relative overflow-hidden"
        style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}
      >
        <div className="absolute -left-6 -top-6 h-32 w-32 rounded-full blur-2xl" style={{ background: 'rgba(16,185,129,0.12)' }} />
        <p className="text-xs font-bold uppercase tracking-widest sch-body mb-4" style={{ color: '#10b981' }}>✅ Smart Campus Transformation</p>
        <div className="space-y-3">
          {transformations.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
              className="flex items-center gap-3 rounded-xl px-4 py-3 sch-body text-sm"
              style={{ background: 'rgba(16,185,129,0.08)', color: 'rgba(255,255,255,0.75)' }}
            >
              <t.icon className="h-4 w-4 shrink-0" style={{ color: '#10b981' }} />
              {t.text}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  </section>
);

/* ═══════════════════════════════════════════════════════════════
   SECTION 4 — PRODUCT STORYTELLING (Role Dashboards)
═══════════════════════════════════════════════════════════════ */
const ProductShowcase = () => {
  const [active, setActive] = useState(0);
  const d = dashboardStories[active];

  return (
    <section className="sch-section-bg border-y py-24" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-14">
          <SectionPill>Product Showcase</SectionPill>
          <SectionHeading>One Platform.<br /><GradientText from="#a855f7" via="#e040fb" to="#06b6d4">Every Role.</GradientText></SectionHeading>
          <motion.p
            initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="sch-body mx-auto mt-4 max-w-lg text-base" style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            Cinematic role-specific experiences — each portal feels purpose-built.
          </motion.p>
        </div>

        {/* Tab switcher */}
        <div className="flex justify-center gap-2 mb-10">
          {dashboardStories.map((story, i) => (
            <button
              key={story.label}
              onClick={() => setActive(i)}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold sch-body transition-all duration-200"
              style={active === i
                ? { background: `linear-gradient(135deg, ${story.color.replace('from-', '').split(' ')[0].replace('-500', '')}, ${story.color.split('to-')[1]})`, color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }
                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }
              }
            >
              {story.label}
            </button>
          ))}
        </div>

        <motion.div
          key={active}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <TiltCard className="mx-auto max-w-3xl" intensity={5}>
            <div className="relative rounded-3xl sch-glass-card overflow-hidden">
              {/* Top bar gradient */}
              <div className={`flex items-center gap-3 px-6 py-5 bg-gradient-to-r ${d.color}`}>
                <div className="flex h-3 w-3 rounded-full bg-white/30" />
                <div className="flex h-3 w-3 rounded-full bg-white/20" />
                <div className="flex h-3 w-3 rounded-full bg-white/15" />
                <p className="ml-2 font-semibold text-white sch-heading text-sm">{d.label} Dashboard — Smart Campus Hub</p>
                <div className="ml-auto flex items-center gap-1.5 text-xs text-white/70 sch-body">
                  <LiveDot color="rgba(255,255,255,0.9)" /> Live
                </div>
              </div>

              <div className="p-6">
                <p className="sch-body text-sm mb-5" style={{ color: 'rgba(255,255,255,0.45)' }}>{d.tagline}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  {d.items.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center gap-3 rounded-xl px-4 py-3"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <item.icon className="h-4 w-4 text-white" />
                      </div>
                      <span className="flex-1 text-sm text-white sch-body">{item.text}</span>
                      <span className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold sch-body ${item.bc}`}>{item.badge}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </TiltCard>
        </motion.div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SECTION 5 — PREMIUM BENTO GRID
═══════════════════════════════════════════════════════════════ */
const BentoGrid = () => (
  <section className="mx-auto max-w-7xl px-6 py-24">
    <div className="text-center mb-14">
      <SectionPill>Feature Grid</SectionPill>
      <SectionHeading>Everything Your Campus<br /><GradientText from="#f59e0b" via="#ef4444" to="#e040fb">Needs to Thrive.</GradientText></SectionHeading>
    </div>

    <div className="grid gap-4 md:grid-cols-3">
      {bentoFeatures.map((feat, i) => (
        <motion.div
          key={feat.title}
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.06 }}
          whileHover={{ y: -5, scale: 1.01 }}
          className={`group relative overflow-hidden rounded-3xl p-6 cursor-default ${feat.span}`}
          style={{
            background: `${feat.accent}0a`,
            border: `1px solid ${feat.accent}22`,
            boxShadow: '0 1px 0 rgba(255,255,255,0.06) inset, 0 8px 32px rgba(0,0,0,0.35)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 0 40px ${feat.accent}25, 0 8px 32px rgba(0,0,0,0.45)`; }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 0 rgba(255,255,255,0.06) inset, 0 8px 32px rgba(0,0,0,0.35)'; }}
        >
          {/* Corner glow */}
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full blur-2xl transition-all duration-500 group-hover:scale-150"
            style={{ background: `${feat.accent}15` }} />

          <div className="relative flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
              style={{ background: `${feat.accent}18`, border: `1px solid ${feat.accent}30` }}>
              <feat.icon className="h-5 w-5" style={{ color: feat.accent }} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white sch-heading">{feat.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed sch-body" style={{ color: 'rgba(255,255,255,0.5)' }}>{feat.desc}</p>
            </div>
          </div>

          <div className="relative mt-4 flex items-center gap-1.5 text-xs font-semibold sch-body opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100"
            style={{ color: feat.accent }}>
            Explore <ChevronRight className="h-3.5 w-3.5" />
          </div>
        </motion.div>
      ))}
    </div>
  </section>
);

/* ═══════════════════════════════════════════════════════════════
   SECTION 6 — LIVE METRICS
═══════════════════════════════════════════════════════════════ */
const LiveMetrics = () => (
  <section className="sch-section-bg border-y py-24" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
    <div className="mx-auto max-w-7xl px-6">
      <div className="text-center mb-14">
        <SectionPill>Platform Metrics</SectionPill>
        <SectionHeading><GradientText from="#06b6d4" via="#a855f7" to="#e040fb">Numbers</GradientText> That Speak.</SectionHeading>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
        {metricsList.map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            whileHover={{ y: -4, scale: 1.02 }}
            className="relative rounded-3xl p-6 overflow-hidden sch-glass-card"
          >
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full blur-2xl"
              style={{ background: `${m.color}20` }} />
            <div className="relative">
              <p className="text-4xl font-black sch-stat" style={{ color: m.color }}>
                <AnimatedCounter
                  target={m.value}
                  suffix={m.suffix}
                  decimals={m.value % 1 !== 0 ? 1 : 0}
                />
              </p>
              <p className="mt-2 text-sm font-medium text-white sch-body">{m.label}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

/* ═══════════════════════════════════════════════════════════════
   SECTION 7 — TECH ARCHITECTURE
═══════════════════════════════════════════════════════════════ */
const TechArchitecture = () => {
  const layers = [
    { label: 'Frontend Layer', techs: ['React', 'Vite'], color: '#06b6d4' },
    { label: 'API & Auth', techs: ['Express', 'JWT'], color: '#e040fb' },
    { label: 'Business Logic', techs: ['Node.js'], color: '#a855f7' },
    { label: 'Data Layer', techs: ['MySQL'], color: '#10b981' },
    { label: 'Deployment', techs: ['Vercel', 'Render'], color: '#f59e0b' },
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-24">
      <div className="text-center mb-14">
        <SectionPill>Architecture</SectionPill>
        <SectionHeading>Built on a Rock-Solid<br /><GradientText from="#10b981" via="#06b6d4" to="#a855f7">Tech Foundation.</GradientText></SectionHeading>
        <motion.p
          initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
          className="sch-body mx-auto mt-4 max-w-lg text-base" style={{ color: 'rgba(255,255,255,0.45)' }}
        >
          Every layer chosen for performance, security, and developer experience.
        </motion.p>
      </div>

      <div className="grid md:grid-cols-2 gap-10 items-center">
        {/* Architecture pipeline */}
        <div className="space-y-3">
          {layers.map((layer, i) => (
            <motion.div
              key={layer.label}
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-4 rounded-2xl px-5 py-4"
              style={{ background: `${layer.color}09`, border: `1px solid ${layer.color}22` }}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                style={{ background: `${layer.color}20` }}>
                <span className="text-xs font-black sch-stat" style={{ color: layer.color }}>{String(i + 1).padStart(2, '0')}</span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-widest sch-body mb-1" style={{ color: layer.color }}>{layer.label}</p>
                <div className="flex gap-2">
                  {layer.techs.map((t) => (
                    <span key={t} className="rounded-lg px-2 py-0.5 text-xs font-semibold sch-body text-white"
                      style={{ background: `${layer.color}15`, border: `1px solid ${layer.color}30` }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              {i < layers.length - 1 && (
                <ArrowRight className="h-4 w-4 shrink-0" style={{ color: `${layer.color}60` }} />
              )}
            </motion.div>
          ))}
          {/* Connecting arrows */}
        </div>

        {/* Tech stack grid */}
        <div className="grid grid-cols-2 gap-3">
          {techStack.map((tech, i) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -3, scale: 1.04 }}
              className="group relative rounded-2xl p-4 sch-glass-card"
            >
              <div className="absolute -right-2 -top-2 h-16 w-16 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `${tech.color}30` }} />
              <div className="relative flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `${tech.color}18`, border: `1px solid ${tech.color}30` }}>
                  <tech.icon className="h-4 w-4" style={{ color: tech.color }} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white sch-heading">{tech.name}</p>
                  <p className="text-[10px] sch-body" style={{ color: 'rgba(255,255,255,0.4)' }}>{tech.category}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SECTION 8 — AI INTELLIGENCE
═══════════════════════════════════════════════════════════════ */
const AIIntelligence = () => {
  const aiFeatures = [
    { label: 'Anomaly Detection', desc: 'Flags unusual attendance or behavioral patterns instantly.', icon: Radar, color: '#e040fb' },
    { label: 'Predictive Alerts', desc: 'Warns students of attendance risk before it hits thresholds.', icon: Brain, color: '#a855f7' },
    { label: 'Smart Automation', desc: 'Auto-schedules, auto-notifies, auto-reports — hands free.', icon: Zap, color: '#06b6d4' },
    { label: 'Campus Analytics', desc: 'Live occupancy, energy, and utilization heatmaps.', icon: BarChart3, color: '#10b981' },
    { label: 'AI Placement Match', desc: 'Matches student profiles to active recruiter requirements.', icon: TrendingUp, color: '#f59e0b' },
    { label: 'Intelligent Routing', desc: 'Routes communications to the right person, right time.', icon: Workflow, color: '#ef4444' },
  ];

  return (
    <section className="sch-section-bg border-y py-24" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="text-center mb-14">
          <SectionPill>AI Intelligence Layer</SectionPill>
          <SectionHeading>A Campus That<br /><GradientText from="#e040fb" via="#a855f7" to="#ec4899">Thinks for Itself.</GradientText></SectionHeading>
          <motion.p
            initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="sch-body mx-auto mt-4 max-w-lg text-base" style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            AI woven into every layer — from attendance anomalies to placement predictions.
          </motion.p>
        </div>

        {/* Neural visual + grid */}
        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Left — AI visual */}
          <div className="relative flex items-center justify-center" style={{ height: 380 }}>
            {/* Rings */}
            <div className="absolute rounded-full sch-orbit-ring"
              style={{ width: 320, height: 320, border: '1px solid rgba(224,64,251,0.15)' }} />
            <div className="absolute rounded-full sch-orbit-ring-rev"
              style={{ width: 220, height: 220, border: '1px dashed rgba(168,85,247,0.2)' }} />

            {/* Center brain */}
            <div className="relative flex flex-col items-center justify-center rounded-full z-10"
              style={{
                width: 120, height: 120,
                background: 'linear-gradient(135deg, rgba(224,64,251,0.25), rgba(168,85,247,0.2))',
                border: '1px solid rgba(224,64,251,0.4)',
                boxShadow: '0 0 60px rgba(224,64,251,0.3)',
              }}>
              <Brain className="h-10 w-10" style={{ color: '#e040fb' }} />
            </div>

            {/* Orbiting nodes */}
            {[
              { label: 'Anomaly', color: '#e040fb', angle: 0 },
              { label: 'Predict', color: '#a855f7', angle: 72 },
              { label: 'Route', color: '#06b6d4', angle: 144 },
              { label: 'Match', color: '#10b981', angle: 216 },
              { label: 'Alert', color: '#f59e0b', angle: 288 },
            ].map((node) => {
              const rad = (node.angle - 90) * (Math.PI / 180);
              const r = 150;
              return (
                <motion.div
                  key={node.label}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="absolute flex flex-col items-center"
                  style={{
                    left: `calc(50% + ${r * Math.cos(rad)}px)`,
                    top: `calc(50% + ${r * Math.sin(rad)}px)`,
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full text-[10px] font-bold sch-stat"
                    style={{ background: `${node.color}20`, border: `1px solid ${node.color}40`, color: node.color }}>
                    {node.label.slice(0, 2)}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right — feature list */}
          <div className="grid gap-3">
            {aiFeatures.map((feat, i) => (
              <motion.div
                key={feat.label}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="flex items-start gap-3 rounded-2xl p-4"
                style={{ background: `${feat.color}08`, border: `1px solid ${feat.color}18` }}
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: `${feat.color}18` }}>
                  <feat.icon className="h-4 w-4" style={{ color: feat.color }} />
                </div>
                <div>
                  <p className="text-sm font-bold text-white sch-heading">{feat.label}</p>
                  <p className="mt-0.5 text-xs sch-body" style={{ color: 'rgba(255,255,255,0.5)' }}>{feat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SECTION 9 — TESTIMONIALS
═══════════════════════════════════════════════════════════════ */
const Testimonials = () => (
  <section className="mx-auto max-w-7xl px-6 py-24">
    <div className="text-center mb-14">
      <SectionPill>Social Proof</SectionPill>
      <SectionHeading><GradientText from="#f59e0b" via="#ef4444" to="#e040fb">Loved</GradientText> by Campuses.</SectionHeading>
    </div>

    <div className="grid gap-5 md:grid-cols-3">
      {testimonials.map((t, i) => (
        <motion.div
          key={t.name}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ y: -5 }}
          className="relative rounded-3xl p-6 sch-glass-card flex flex-col"
        >
          <div className="flex mb-4">
            {Array.from({ length: t.rating }).map((_, j) => (
              <Star key={j} className="h-4 w-4" style={{ fill: '#f59e0b', color: '#f59e0b' }} />
            ))}
          </div>
          <p className="text-sm leading-relaxed italic sch-body flex-1" style={{ color: 'rgba(255,255,255,0.65)' }}>
            "{t.quote}"
          </p>
          <div className="mt-5 flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${t.color} text-xs font-bold text-white sch-heading`}>
              {t.avatar}
            </div>
            <div>
              <p className="text-sm font-bold text-white sch-heading">{t.name}</p>
              <p className="text-xs sch-body" style={{ color: 'rgba(255,255,255,0.4)' }}>{t.role}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </section>
);

/* ═══════════════════════════════════════════════════════════════
   SECTION 10 — FINAL DRAMATIC CTA
═══════════════════════════════════════════════════════════════ */
const FinalCTA = () => (
  <section className="mx-auto max-w-6xl px-6 pb-28">
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="relative overflow-hidden rounded-[2.5rem] p-[1px]"
      style={{
        background: 'linear-gradient(135deg, #e040fb, #7c3aed, #06b6d4, #10b981)',
        boxShadow: '0 0 80px rgba(224,64,251,0.25), 0 0 40px rgba(6,182,212,0.15)',
      }}
    >
      <div className="relative overflow-hidden rounded-[2.5rem] px-8 py-20 text-center"
        style={{ background: '#07041a' }}>
        {/* Bg orbs */}
        <div className="absolute -left-24 top-0 h-64 w-64 rounded-full blur-3xl" style={{ background: 'rgba(224,64,251,0.12)' }} />
        <div className="absolute -right-24 bottom-0 h-64 w-64 rounded-full blur-3xl" style={{ background: 'rgba(6,182,212,0.10)' }} />
        <div className="absolute left-1/2 top-1/2 h-96 w-96 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"
          style={{ background: 'rgba(124,58,237,0.08)' }} />

        {/* Grid */}
        <div className="absolute inset-0" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }} />

        <div className="relative">
          <motion.div
            initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mb-5 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold sch-body"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}
          >
            <LiveDot color="#10b981" /> Production-ready · Deploy in minutes
          </motion.div>

          <h2 className="sch-heading text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">
            The Future of<br />
            <GradientText from="#e040fb" via="#7c3aed" to="#06b6d4">Campus Intelligence</GradientText><br />
            Starts Here.
          </h2>

          <p className="sch-body mx-auto mt-5 max-w-2xl text-base" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Spin up the full platform, explore role-based dashboards, and experience enterprise-grade
            campus management — built for recruiters, judged by engineers.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link to="/register">
              <motion.button
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                className="sch-primary-btn sch-body flex items-center gap-2 rounded-xl px-8 py-4 text-sm font-bold text-white"
              >
                <Sparkles className="h-4 w-4" /> Launch Your Campus Hub <ArrowRight className="h-4 w-4" />
              </motion.button>
            </Link>
            <Link to="/contact">
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="sch-ghost-btn sch-body flex items-center gap-2 rounded-xl px-8 py-4 text-sm font-semibold text-white"
              >
                Schedule a Demo
              </motion.button>
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-8 text-sm sch-body" style={{ color: 'rgba(255,255,255,0.45)' }}>
            {['No credit card required', 'JWT-secured APIs', 'Socket.IO realtime', 'Open source ready'].map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" style={{ color: '#10b981' }} /> {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  </section>
);

/* ═══════════════════════════════════════════════════════════════
   FOOTER
═══════════════════════════════════════════════════════════════ */
const Footer = () => (
  <footer className="relative border-t" style={{ borderColor: 'rgba(255,255,255,0.07)', background: 'rgba(0,0,0,0.3)' }}>
    <div className="mx-auto max-w-7xl px-6 py-16">
      <div className="grid gap-10 md:grid-cols-5">

        {/* Brand */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: 'linear-gradient(135deg, #e040fb, #7c3aed)' }}>
              <Atom className="h-5 w-5 text-white" />
            </div>
            <p className="text-lg font-bold text-white sch-heading">Smart Campus Hub</p>
          </div>
          <p className="text-sm leading-relaxed sch-body mb-6" style={{ color: 'rgba(255,255,255,0.45)', maxWidth: 280 }}>
            A flagship full-stack campus intelligence platform — unifying students, faculty, and administrators
            in a single production-grade digital ecosystem.
          </p>
          <div className="space-y-2">
            <a href="tel:+918850706982" className="flex items-center gap-2 text-sm sch-body transition-colors"
              style={{ color: 'rgba(255,255,255,0.45)' }}
              onMouseEnter={(e) => e.target.style.color = '#e040fb'}
              onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.45)'}>
              📞 +91 8850706982
            </a>
            <a href="mailto:yashsurve2019@gmail.com" className="flex items-center gap-2 text-sm sch-body transition-colors"
              style={{ color: 'rgba(255,255,255,0.45)' }}
              onMouseEnter={(e) => e.target.style.color = '#06b6d4'}
              onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.45)'}>
              ✉️ yashsurve2019@gmail.com
            </a>
            <a href="https://github.com/YashSurve2006" target="_blank" rel="noreferrer"
              className="flex items-center gap-2 text-sm sch-body transition-colors"
              style={{ color: 'rgba(255,255,255,0.45)' }}
              onMouseEnter={(e) => e.target.style.color = '#a855f7'}
              onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.45)'}>
              <GitBranch className="h-3.5 w-3.5" /> github.com/YashSurve2006
            </a>
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(footerLinks).map(([col, links]) => (
          <div key={col}>
            <p className="text-xs font-bold uppercase tracking-widest sch-body mb-4" style={{ color: '#e040fb' }}>{col}</p>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm sch-body transition-colors"
                    style={{ color: 'rgba(255,255,255,0.45)' }}
                    onMouseEnter={(e) => e.target.style.color = 'rgba(255,255,255,0.85)'}
                    onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.45)'}>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="mt-14 flex flex-col items-center justify-between gap-4 pt-7 sm:flex-row"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-xs sch-body" style={{ color: 'rgba(255,255,255,0.3)' }}>
          © 2024 Smart Campus Hub — Crafted with ♥ by Yash Surve
        </p>
        <div className="flex items-center gap-2 rounded-full px-3 py-1.5 text-xs sch-body"
          style={{ background: 'rgba(224,64,251,0.1)', border: '1px solid rgba(224,64,251,0.2)', color: '#e040fb' }}>
          <LiveDot color="#e040fb" /> All systems operational
        </div>
      </div>
    </div>
  </footer>
);

/* ═══════════════════════════════════════════════════════════════
   ROOT EXPORT
═══════════════════════════════════════════════════════════════ */
export default function Landing() {
  return (
    <>
      <FontLoader />
      <StyleInjector />
      <div className="relative overflow-x-hidden">
        <AuroraBackground />
        <MouseGlow />

        <div className="relative z-10">
          <Hero />
          <InstitutionTicker />

          <Transformation />
          <ProductShowcase />
          <BentoGrid />
          <LiveMetrics />
          <TechArchitecture />
          <AIIntelligence />
          <Testimonials />
          <FinalCTA />
          <Footer />
        </div>
      </div>
    </>
  );
}