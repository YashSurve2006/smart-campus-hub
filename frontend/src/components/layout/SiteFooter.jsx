import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Github,
  Globe,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Twitter,
  Zap,
  Brain,
} from 'lucide-react';

export function SiteFooter() {
  return (
    <footer
      className="relative overflow-hidden border-t text-slate-300"
      style={{
        background: '#05030f',
        borderColor: 'rgba(255,255,255,0.07)',
      }}
    >
      {/* ── Aurora blobs ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-40 -top-20 h-[420px] w-[420px] rounded-full blur-[110px]"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.28) 0%, transparent 70%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -right-24 h-[380px] w-[380px] rounded-full blur-[100px]"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.22) 0%, transparent 70%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/3 h-[260px] w-[260px] rounded-full blur-[90px]"
        style={{ background: 'radial-gradient(circle, rgba(192,38,211,0.16) 0%, transparent 70%)' }}
      />

      {/* ── Grid overlay ── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)',
          backgroundSize: '44px 44px',
        }}
      />

      <div className="relative">

        {/* ══ Top CTA strip ══ */}
        <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-6 py-12 md:flex-row md:gap-6">

            <div className="max-w-2xl text-center md:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest"
                style={{
                  background: 'rgba(139,92,246,0.12)',
                  border: '1px solid rgba(139,92,246,0.28)',
                  color: '#c084fc',
                }}
              >
                <Sparkles className="h-3 w-3" />
                Next Generation Academic Platform
              </div>

              <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-white md:text-[2.4rem]">
                Empower your campus with{' '}
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(90deg, #818cf8, #c084fc, #22d3ee)' }}
                >
                  intelligent infrastructure
                </span>
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                Smart Campus Hub unifies communication, administration,
                attendance, analytics, and realtime academic workflows into one
                enterprise-grade ecosystem.
              </p>
            </div>

            <Link
              to="/register"
              className="group inline-flex shrink-0 items-center gap-2 rounded-2xl px-7 py-3.5 text-sm font-bold text-white shadow-2xl transition-all hover:scale-[1.03]"
              style={{
                background: 'linear-gradient(130deg, #6d28d9 0%, #a855f7 55%, #06b6d4 100%)',
                boxShadow: '0 4px 24px rgba(109,40,217,0.4)',
              }}
            >
              Get Started
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* ══ Main grid ══ */}
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center rounded-2xl"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                  boxShadow: '0 0 20px rgba(139,92,246,0.45)',
                }}
              >
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-white">Smart Campus Hub</p>
                <p className="text-[11px] text-slate-600">Intelligent Academic Ecosystem</p>
              </div>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-slate-500">
              Built to modernize academic institutions with realtime
              communication, secure infrastructure, analytics, and premium user
              experience.
            </p>

            <div className="mt-6 space-y-3">
              {[
                { icon: Zap, label: 'Realtime Campus Operations', color: '#22d3ee' },
                { icon: ShieldCheck, label: 'Secure JWT Infrastructure', color: '#818cf8' },
                { icon: Globe, label: 'Modern Enterprise UI', color: '#c084fc' },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className="flex items-center gap-2.5 text-sm text-slate-500">
                  <Icon className="h-3.5 w-3.5 shrink-0" style={{ color }} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Navigation
            </p>

            <ul className="mt-6 space-y-3.5">
              {[
                { to: '/', label: 'Home' },
                { to: '/about', label: 'About Platform' },
                { to: '/contact', label: 'Contact Team' },
                { to: '/login', label: 'Sign In' },
                { to: '/register', label: 'Create Account' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="group flex items-center gap-2.5 text-sm text-slate-500 transition-all hover:text-white"
                  >
                    <span
                      className="h-1.5 w-1.5 rounded-full transition-all group-hover:scale-150"
                      style={{ background: 'rgba(139,92,246,0.6)' }}
                    />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Platform
            </p>

            <div className="mt-6 space-y-3.5">
              {[
                'Attendance Management',
                'Realtime Notifications',
                'Analytics Dashboard',
                'Role-Based Access',
                'Academic Scheduling',
                'Campus Communication',
              ].map((feature) => (
                <div key={feature} className="flex items-center gap-2.5 text-sm text-slate-500">
                  <div className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: '#22d3ee' }} />
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* Connect */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">
              Connect
            </p>

            <div className="mt-6 space-y-5">
              {[
                {
                  icon: Mail,
                  label: 'Email',
                  value: 'support@smartcampushub.com',
                  href: 'mailto:support@smartcampushub.com',
                  color: '#818cf8',
                },
                {
                  icon: Phone,
                  label: 'Phone',
                  value: '+91 98765 43210',
                  color: '#c084fc',
                },
                {
                  icon: MapPin,
                  label: 'Headquarters',
                  value: 'Mumbai, Maharashtra, India',
                  color: '#22d3ee',
                },
              ].map(({ icon: Icon, label, value, href, color }) => (
                <div key={label} className="flex items-start gap-3">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} />
                  <div>
                    <p className="text-xs font-semibold text-slate-300">{label}</p>
                    {href ? (
                      <a href={href} className="text-sm text-slate-500 transition hover:text-white">
                        {value}
                      </a>
                    ) : (
                      <p className="text-sm text-slate-500">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Social icons */}
            <div className="mt-7 flex gap-2.5">
              {[
                { icon: Mail, href: 'mailto:support@smartcampushub.com' },
                { icon: Github, href: '#' },
                { icon: Linkedin, href: '#' },
                { icon: Twitter, href: '#' },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-all hover:-translate-y-1 hover:text-white"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(139,92,246,0.12)';
                    e.currentTarget.style.border = '1px solid rgba(139,92,246,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)';
                  }}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ══ Bottom bar ══ */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-5 md:flex-row">

            <div className="flex items-center gap-2.5">
              <Brain className="h-3.5 w-3.5 text-violet-500" />
              <p className="text-xs text-slate-600">
                © {new Date().getFullYear()} Smart Campus Hub. All rights reserved.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              {['Enterprise Ready', 'Realtime Infrastructure', 'Presentation Ready'].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full px-3 py-1 text-[10px] font-semibold text-slate-600"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}