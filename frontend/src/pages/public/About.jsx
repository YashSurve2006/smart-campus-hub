/**
 * About.jsx — DARK-FIRST PREMIUM UPGRADE
 *
 * Root causes fixed:
 * - bg-mesh-gradient was painting a light gradient wash
 * - text-slate-900/600 invisible on dark navy canvas
 * - bg-white/60-70 cards invisible / muddy on dark bg
 * - GlassCard overrides with bg-white/60 fighting dark system
 *
 * Upgrade: Full dark glass system + advanced layout additions:
 * - Cinematic hero with animated stat counter strip
 * - Story section with dark glass feature list
 * - Animated timeline / platform capability showcase
 * - Values grid with premium icon treatment
 * - Tech stack bento grid (new)
 * - Final CTA with gradient border
 */

import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, BrainCircuit, CheckCircle2, Cpu, Globe,
  GraduationCap, HeartHandshake, Layers3, ShieldCheck,
  Sparkles, Target, Users, Zap, Code2, Database,
  BarChart3, Wifi, Lock, Activity, TrendingUp,
  BookOpen, Bell, Calendar, Map,
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';

/* ─── Data ───────────────────────────────────────────────────── */

const values = [
  {
    title: 'Mission',
    icon: Target,
    gradient: 'from-blue-500/[0.18] to-cyan-500/[0.10]',
    iconBg: 'bg-blue-500/[0.18]',
    iconColor: 'text-blue-400',
    border: 'border-blue-500/[0.18]',
    accent: '#3b82f6',
    desc: 'Eliminate operational friction across campuses with realtime systems, automation, and intuitive workflows that actually work.',
  },
  {
    title: 'Community',
    icon: HeartHandshake,
    gradient: 'from-violet-500/[0.18] to-purple-500/[0.10]',
    iconBg: 'bg-violet-500/[0.18]',
    iconColor: 'text-violet-400',
    border: 'border-violet-500/[0.18]',
    accent: '#8b5cf6',
    desc: 'Bring students, faculty, and administrators together inside one intelligent digital ecosystem built for connection.',
  },
  {
    title: 'Engineering',
    icon: Cpu,
    gradient: 'from-emerald-500/[0.18] to-teal-500/[0.10]',
    iconBg: 'bg-emerald-500/[0.18]',
    iconColor: 'text-emerald-400',
    border: 'border-emerald-500/[0.18]',
    accent: '#10b981',
    desc: 'Built using modern enterprise architecture with realtime APIs, JWT security, analytics, and scalable UI components.',
  },
];

const statItems = [
  { label: 'Realtime Modules', value: 12, suffix: '+', color: 'text-indigo-400' },
  { label: 'Connected Roles', value: 3, suffix: '', color: 'text-violet-400' },
  { label: 'API Endpoints', value: 40, suffix: '+', color: 'text-cyan-400' },
  { label: 'Campus Ops', value: 99, suffix: '%', color: 'text-emerald-400' },
];

const features = [
  { label: 'Realtime announcements and notifications', icon: Bell },
  { label: 'Role-based dashboards for every user', icon: Users },
  { label: 'JWT secured APIs and route guards', icon: Lock },
  { label: 'Attendance and academic workflows', icon: BookOpen },
  { label: 'Modern analytics and reporting system', icon: BarChart3 },
  { label: 'Interactive UI with motion effects', icon: Zap },
];

const capabilityCards = [
  {
    icon: Layers3,
    title: 'Centralized Operations',
    desc: 'Notices, attendance, analytics, dashboards, and academic workflows unified into one platform.',
    iconBg: 'bg-blue-500/[0.15]',
    iconColor: 'text-blue-400',
    border: 'border-blue-500/[0.15]',
  },
  {
    icon: ShieldCheck,
    title: 'Enterprise Security',
    desc: 'JWT authentication, role-based permissions, protected APIs, and secure academic infrastructure.',
    iconBg: 'bg-violet-500/[0.15]',
    iconColor: 'text-violet-400',
    border: 'border-violet-500/[0.15]',
  },
  {
    icon: BrainCircuit,
    title: 'Intelligent Experience',
    desc: 'Modern UI, realtime updates, interactive analytics, and scalable architecture for future-ready institutions.',
    iconBg: 'bg-emerald-500/[0.15]',
    iconColor: 'text-emerald-400',
    border: 'border-emerald-500/[0.15]',
  },
];

const techStack = [
  { label: 'React', color: 'from-cyan-500 to-blue-500', icon: Code2 },
  { label: 'Node.js', color: 'from-emerald-500 to-green-600', icon: Database },
  { label: 'Socket.IO', color: 'from-slate-400 to-slate-600', icon: Wifi },
  { label: 'JWT Auth', color: 'from-amber-500 to-orange-500', icon: Lock },
  { label: 'MySQL', color: 'from-blue-600 to-indigo-600', icon: Database },
  { label: 'Framer', color: 'from-pink-500 to-rose-500', icon: Activity },
];

const timeline = [
  {
    num: '01',
    title: 'Role Registration',
    desc: 'Students, faculty, and admins sign up with role-specific profiles and get personalized dashboards instantly.',
    icon: Users,
    color: 'indigo',
  },
  {
    num: '02',
    title: 'Campus Intelligence',
    desc: 'AI-powered notice routing, smart timetable sync, and attendance automation across every department.',
    icon: BrainCircuit,
    color: 'violet',
  },
  {
    num: '03',
    title: 'Realtime Operations',
    desc: 'Socket.IO broadcasts keep every stakeholder in sync — no refresh, no lag, no missed updates.',
    icon: Wifi,
    color: 'cyan',
  },
  {
    num: '04',
    title: 'Analytics & Growth',
    desc: 'Admin dashboards surface attendance trends, campus utilization, and actionable operational insights.',
    icon: TrendingUp,
    color: 'emerald',
  },
];

/* ─── Counter animation ──────────────────────────────────────── */
const AnimatedCounter = ({ end, suffix = '', duration = 1800 }) => {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let frame = 0;
    const totalFrames = Math.round(duration / 16);
    const timer = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (frame >= totalFrames) { setCount(end); clearInterval(timer); }
    }, 16);
    return () => clearInterval(timer);
  }, [started, end, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
};

/* ─── Orb ────────────────────────────────────────────────────── */
const Orb = ({ className }) => (
  <div className={`pointer-events-none absolute rounded-full blur-3xl ${className}`} />
);

/* ─── Grid overlay ───────────────────────────────────────────── */
const Grid = () => (
  <div
    className="pointer-events-none absolute inset-0"
    style={{
      backgroundImage: `linear-gradient(rgba(99,102,241,0.035) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(99,102,241,0.035) 1px, transparent 1px)`,
      backgroundSize: '60px 60px',
    }}
  />
);

/* ─── Color map for timeline ─────────────────────────────────── */
const timelineColors = {
  indigo: { bg: 'bg-indigo-500/[0.15]', text: 'text-indigo-400', border: 'border-indigo-500/[0.20]', num: 'text-indigo-500/30' },
  violet: { bg: 'bg-violet-500/[0.15]', text: 'text-violet-400', border: 'border-violet-500/[0.20]', num: 'text-violet-500/30' },
  cyan: { bg: 'bg-cyan-500/[0.15]', text: 'text-cyan-400', border: 'border-cyan-500/[0.20]', num: 'text-cyan-500/30' },
  emerald: { bg: 'bg-emerald-500/[0.15]', text: 'text-emerald-400', border: 'border-emerald-500/[0.20]', num: 'text-emerald-500/30' },
};

/* ═══════════════════════════════════════════════════════════════
   EXPORT
═══════════════════════════════════════════════════════════════ */
export default function About() {
  return (
    <div className="relative overflow-hidden">

      {/* ── Ambient background (reduced opacity, dark-correct) ── */}
      <Orb className="h-[500px] w-[500px] -left-40 top-0 bg-indigo-600/[0.10]" />
      <Orb className="h-[400px] w-[400px] -right-32 top-60 bg-violet-600/[0.08]" />
      <Orb className="h-80 w-80 left-1/3 top-[50%] bg-cyan-500/[0.06]" />
      <Orb className="h-72 w-72 right-1/4 bottom-0 bg-emerald-500/[0.06]" />
      <Grid />

      <div className="relative mx-auto max-w-7xl px-4 py-20">

        {/* ══════════════════════════════════════════════════════
            HERO — cinematic dark heading
        ══════════════════════════════════════════════════════ */}
        <section className="text-center">

          {/* Badge pill — dark glass */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-indigo-500/25 bg-indigo-500/[0.10] px-4 py-2 text-sm font-semibold text-indigo-300 shadow-lg backdrop-blur-xl"
          >
            <Sparkles className="h-4 w-4" />
            Intelligent Campus Ecosystem
          </motion.div>

          {/* H1 — white, cinematic weight */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mx-auto mt-6 max-w-5xl text-5xl font-black leading-[1.08] tracking-tight text-white md:text-6xl lg:text-7xl"
          >
            Reimagining how{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              modern campuses
            </span>{' '}
            operate digitally.
          </motion.h1>

          {/* Subtext — slate-400 */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.10 }}
            className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-slate-400"
          >
            Smart Campus Hub is an enterprise-grade academic management platform
            engineered to unify communication, attendance, analytics,
            administration, scheduling, and realtime collaboration into one
            seamless intelligent ecosystem.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-10 flex flex-wrap justify-center gap-4"
          >
            <Link to="/register">
              <Button size="lg" className="rounded-2xl px-7">
                Explore Platform <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="ghost" size="lg" className="rounded-2xl px-7">
                Learn More
              </Button>
            </Link>
          </motion.div>
        </section>

        {/* ══════════════════════════════════════════════════════
            ANIMATED STATS STRIP
        ══════════════════════════════════════════════════════ */}
        <section className="mt-20">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statItems.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -3 }}
                className="relative overflow-hidden rounded-2xl border border-white/[0.09] bg-white/[0.05] p-6 text-center backdrop-blur-xl"
                style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.09) inset, 0 8px 32px rgba(0,0,0,0.35)' }}
              >
                {/* Subtle corner glow */}
                <div className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-indigo-500/[0.12] blur-2xl" />
                <p className={`text-4xl font-black ${s.color}`}>
                  <AnimatedCounter end={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-2 text-sm font-medium text-slate-400">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            ABOUT STORY — 2-col layout
        ══════════════════════════════════════════════════════ */}
        <section className="mt-28 grid items-center gap-12 lg:grid-cols-2">

          {/* LEFT — text + feature list */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-400">
              About The Platform
            </p>

            <h2 className="mt-4 text-4xl font-bold leading-tight text-white md:text-5xl">
              One unified operating{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                system
              </span>{' '}
              for academic excellence.
            </h2>

            <p className="mt-6 text-lg leading-relaxed text-slate-400">
              Educational institutions still rely on fragmented systems,
              spreadsheets, scattered communication channels, and disconnected
              workflows.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-slate-400">
              Smart Campus Hub modernizes the entire academic experience by
              centralizing operations into a secure, scalable, realtime digital
              platform designed for next-generation campuses.
            </p>

            {/* Feature checklist — dark glass rows */}
            <div className="mt-8 space-y-3">
              {features.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.05] px-4 py-3 backdrop-blur"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/[0.15]">
                    <f.icon className="h-4 w-4 text-indigo-400" />
                  </div>
                  {/* FIXED: was text-slate-700 */}
                  <span className="text-sm font-medium text-slate-200">{f.label}</span>
                  <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-emerald-400" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* RIGHT — capability cards */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative space-y-4"
          >
            {/* Ambient behind cards */}
            <div className="pointer-events-none absolute -right-8 top-0 h-48 w-48 rounded-full bg-violet-500/[0.10] blur-3xl" />

            {capabilityCards.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.10 }}
                whileHover={{ x: 4 }}
                className={`flex items-start gap-4 rounded-2xl border bg-white/[0.05] p-5 backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.08] ${c.border}`}
                style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.08) inset, 0 8px 24px rgba(0,0,0,0.30)' }}
              >
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${c.iconBg}`}>
                  <c.icon className={`h-6 w-6 ${c.iconColor}`} />
                </div>
                <div>
                  {/* FIXED: was text-slate-900 */}
                  <h3 className="font-bold text-white">{c.title}</h3>
                  {/* FIXED: was text-slate-600 */}
                  <p className="mt-1 text-sm leading-relaxed text-slate-400">{c.desc}</p>
                </div>
              </motion.div>
            ))}

            {/* Live status badge */}
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/[0.20] bg-emerald-500/[0.08] px-5 py-4">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </span>
              <p className="text-sm font-semibold text-emerald-300">Platform live · All systems operational</p>
              <span className="ml-auto rounded-lg bg-emerald-500/[0.15] px-2.5 py-1 text-xs font-bold text-emerald-400">99.9%</span>
            </div>
          </motion.div>
        </section>

        {/* ══════════════════════════════════════════════════════
            HOW IT WORKS — TIMELINE (new section)
        ══════════════════════════════════════════════════════ */}
        <section className="mt-28">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-400">
              Platform Journey
            </p>
            <h2 className="mt-4 text-4xl font-bold text-white md:text-5xl">
              How the platform works
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base text-slate-400">
              From registration to intelligent campus operations — four stages that transform how your institution runs.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {timeline.map((step, i) => {
              const c = timelineColors[step.color];
              return (
                <motion.div
                  key={step.num}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.09 }}
                  whileHover={{ y: -5 }}
                  className={`group relative overflow-hidden rounded-2xl border bg-white/[0.05] p-6 backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.08] ${c.border}`}
                  style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.08) inset, 0 8px 32px rgba(0,0,0,0.35)' }}
                >
                  {/* Big number watermark */}
                  <p className={`text-7xl font-black ${c.num} transition-all duration-300 group-hover:opacity-100`}>
                    {step.num}
                  </p>

                  {/* Icon */}
                  <div className={`mt-2 flex h-11 w-11 items-center justify-center rounded-xl ${c.bg}`}>
                    <step.icon className={`h-5 w-5 ${c.text}`} />
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.desc}</p>

                  {/* Connector dot for desktop */}
                  {i < 3 && (
                    <div className="absolute -right-2.5 top-1/2 hidden h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full border border-white/[0.12] bg-white/[0.06] lg:flex">
                      <ArrowRight className="h-3 w-3 text-slate-500" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            TECH STACK BENTO (new section)
        ══════════════════════════════════════════════════════ */}
        <section className="mt-24">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-400">
              Built With
            </p>
            <h2 className="mt-4 text-4xl font-bold text-white">
              Enterprise-grade tech stack
            </h2>
          </div>

          <div className="mt-12 grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
            {techStack.map((tech, i) => (
              <motion.div
                key={tech.label}
                initial={{ opacity: 0, scale: 0.85 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ y: -4, scale: 1.04 }}
                className="flex flex-col items-center gap-3 rounded-2xl border border-white/[0.09] bg-white/[0.05] py-5 px-3 text-center backdrop-blur-xl transition-all duration-200 hover:border-white/[0.15] hover:bg-white/[0.08]"
                style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.08) inset' }}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tech.color}`}>
                  <tech.icon className="h-5 w-5 text-white" />
                </div>
                <span className="text-xs font-bold text-slate-200">{tech.label}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            VALUES GRID
        ══════════════════════════════════════════════════════ */}
        <section className="mt-28">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-violet-400">
              Core Principles
            </p>
            <h2 className="mt-4 text-4xl font-bold text-white md:text-5xl">
              Built with innovation,{' '}
              <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                reliability
              </span>
              , and community.
            </h2>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.09 }}
                whileHover={{ y: -6 }}
                className={`group relative overflow-hidden rounded-2xl border bg-white/[0.05] p-8 backdrop-blur-xl transition-all duration-300 hover:bg-white/[0.08] ${v.border}`}
                style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.09) inset, 0 12px 40px rgba(0,0,0,0.38)' }}
              >
                {/* Corner ambient */}
                <div className={`pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-gradient-to-br ${v.gradient} blur-2xl transition-all duration-500 group-hover:scale-150`} />

                <div className={`relative inline-flex rounded-2xl ${v.iconBg} p-4`}>
                  <v.icon className={`h-7 w-7 ${v.iconColor}`} />
                </div>

                {/* FIXED: was text-slate-900 */}
                <h3 className="relative mt-6 text-2xl font-bold text-white">{v.title}</h3>
                {/* FIXED: was text-slate-600 */}
                <p className="relative mt-3 leading-relaxed text-slate-400">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            LARGE SHOWCASE BANNER (new)
        ══════════════════════════════════════════════════════ */}
        <section className="mt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl border border-white/[0.09] bg-white/[0.04] p-8 md:p-12 backdrop-blur-xl"
            style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.09) inset, 0 24px 60px rgba(0,0,0,0.45)' }}
          >
            <div className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-indigo-600/[0.12] blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-violet-600/[0.10] blur-3xl" />

            <div className="relative grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-indigo-400">
                  Platform Intelligence
                </p>
                <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl">
                  Every campus interaction,{' '}
                  <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                    intelligently connected.
                  </span>
                </h2>
                <p className="mt-5 text-base leading-relaxed text-slate-400">
                  Smart Campus Hub integrates every touchpoint — from attendance to analytics, from notices to navigation — into a single intelligent layer that makes campus operations frictionless for everyone.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  {['Zero data silos', 'Role-aware UX', 'Sub-100ms sync', 'JWT secured'].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-indigo-500/[0.25] bg-indigo-500/[0.10] px-3 py-1.5 text-xs font-semibold text-indigo-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Mini metrics panel */}
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { label: 'Active Users', val: '1,240+', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/[0.12]' },
                  { label: 'Avg. Attendance', val: '87%', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/[0.12]' },
                  { label: 'Realtime Events', val: '∞', icon: Wifi, color: 'text-cyan-400', bg: 'bg-cyan-500/[0.12]' },
                  { label: 'System Uptime', val: '99.9%', icon: Activity, color: 'text-violet-400', bg: 'bg-violet-500/[0.12]' },
                ].map((m) => (
                  <div
                    key={m.label}
                    className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-4"
                    style={{ boxShadow: '0 1px 0 rgba(255,255,255,0.07) inset' }}
                  >
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${m.bg}`}>
                      <m.icon className={`h-4 w-4 ${m.color}`} />
                    </div>
                    <p className={`mt-3 text-2xl font-black ${m.color}`}>{m.val}</p>
                    <p className="text-xs font-medium text-slate-500">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        {/* ══════════════════════════════════════════════════════
            FINAL CTA
        ══════════════════════════════════════════════════════ */}
        <section className="mt-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-[2rem] bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-600 p-[1.5px] shadow-2xl shadow-violet-900/40"
          >
            <div className="relative overflow-hidden rounded-[2rem] bg-[#070b1f] px-8 py-16 text-center">
              {/* Orbs inside CTA */}
              <div className="pointer-events-none absolute -left-16 top-0 h-48 w-48 rounded-full bg-indigo-500/[0.12] blur-3xl" />
              <div className="pointer-events-none absolute -right-16 bottom-0 h-48 w-48 rounded-full bg-violet-500/[0.12] blur-3xl" />
              {/* Grid */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.03]"
                style={{
                  backgroundImage: `linear-gradient(rgba(99,102,241,1) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)`,
                  backgroundSize: '60px 60px',
                }}
              />

              <div className="relative">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white/[0.08] backdrop-blur-xl ring-1 ring-white/[0.12]">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>

                <h2 className="mt-6 text-4xl font-bold text-white md:text-5xl">
                  Empower the future of campus management.
                </h2>

                <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-white/60">
                  Smart Campus Hub combines engineering excellence, realtime
                  systems, elegant user experience, and scalable architecture to
                  redefine digital academic operations.
                </p>

                <div className="mt-10 flex flex-wrap justify-center gap-4">
                  <Link to="/register">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 rounded-xl bg-white px-7 py-3 text-sm font-bold text-slate-900 shadow-xl shadow-white/20 transition hover:shadow-white/30"
                    >
                      Get Started <ArrowRight className="h-4 w-4" />
                    </motion.button>
                  </Link>
                  <Link to="/contact">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-7 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
                    >
                      View Documentation
                    </motion.button>
                  </Link>
                </div>

                {/* Trust badges */}
                <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-white/40">
                  {['No credit card required', 'Open source friendly', 'Production ready'].map((t) => (
                    <div key={t} className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-cyan-400" /> {t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </section>

      </div>
    </div>
  );
}