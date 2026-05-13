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
} from 'lucide-react';

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-slate-950 text-slate-300">

      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(20,184,166,0.12),transparent_30%)]" />

      <div className="pointer-events-none absolute -left-20 top-10 h-72 w-72 rounded-full bg-hub-blue/10 blur-3xl" />

      <div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-hub-purple/10 blur-3xl" />

      <div className="relative">

        {/* Top CTA */}
        <div className="border-b border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-10 text-center md:flex-row md:text-left">

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-hub-purple backdrop-blur-xl">
                <Sparkles className="h-3.5 w-3.5" />
                Next Generation Academic Platform
              </div>

              <h2 className="mt-4 text-3xl font-black leading-tight text-white md:text-4xl">
                Empower your campus with
                <span className="bg-gradient-to-r from-hub-blue via-hub-purple to-hub-teal bg-clip-text text-transparent">
                  {' '}
                  intelligent infrastructure
                </span>
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
                Smart Campus Hub unifies communication, administration,
                attendance, analytics, and realtime academic workflows into one
                enterprise-grade ecosystem.
              </p>
            </div>

            <Link
              to="/register"
              className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-hub-blue via-hub-purple to-hub-teal px-6 py-3 text-sm font-semibold text-white shadow-2xl transition-all hover:scale-105"
            >
              Get Started
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Main Footer */}
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-hub-blue via-hub-purple to-hub-teal text-white shadow-xl">
                <GraduationCap className="h-6 w-6" />
              </div>

              <div>
                <p className="text-xl font-bold text-white">
                  Smart Campus Hub
                </p>

                <p className="text-xs text-slate-500">
                  Intelligent Academic Ecosystem
                </p>
              </div>
            </div>

            <p className="mt-6 text-sm leading-relaxed text-slate-400">
              Built to modernize academic institutions with realtime
              communication, secure infrastructure, analytics, and premium user
              experience.
            </p>

            {/* Features */}
            <div className="mt-6 space-y-3">

              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Zap className="h-4 w-4 text-hub-teal" />
                Realtime Campus Operations
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-400">
                <ShieldCheck className="h-4 w-4 text-hub-blue" />
                Secure JWT Infrastructure
              </div>

              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Globe className="h-4 w-4 text-hub-purple" />
                Modern Enterprise UI
              </div>

            </div>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-white">
              Navigation
            </p>

            <ul className="mt-6 space-y-4 text-sm">

              {[
                { to: '/', label: 'Home' },
                { to: '/about', label: 'About Platform' },
                { to: '/contact', label: 'Contact Team' },
                { to: '/login', label: 'Sign In' },
                { to: '/register', label: 'Create Account' },
              ].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="group flex items-center gap-2 text-slate-400 transition-all hover:text-white"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-hub-purple opacity-70 transition-all group-hover:scale-125" />

                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Platform */}
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-white">
              Platform
            </p>

            <div className="mt-6 space-y-4">

              {[
                'Attendance Management',
                'Realtime Notifications',
                'Analytics Dashboard',
                'Role-Based Access',
                'Academic Scheduling',
                'Campus Communication',
              ].map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 text-sm text-slate-400"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-hub-teal" />

                  {feature}
                </div>
              ))}

            </div>
          </div>

          {/* Contact */}
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-white">
              Connect
            </p>

            <div className="mt-6 space-y-5">

              <div className="flex items-start gap-3">
                <Mail className="mt-0.5 h-4 w-4 text-hub-blue" />

                <div>
                  <p className="text-sm font-medium text-white">
                    Email
                  </p>

                  <a
                    href="mailto:support@smartcampushub.com"
                    className="text-sm text-slate-400 transition hover:text-white"
                  >
                    support@smartcampushub.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-4 w-4 text-hub-purple" />

                <div>
                  <p className="text-sm font-medium text-white">
                    Phone
                  </p>

                  <p className="text-sm text-slate-400">
                    +91 98765 43210
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 text-hub-teal" />

                <div>
                  <p className="text-sm font-medium text-white">
                    Headquarters
                  </p>

                  <p className="text-sm text-slate-400">
                    Mumbai, Maharashtra, India
                  </p>
                </div>
              </div>

            </div>

            {/* Socials */}
            <div className="mt-8 flex gap-3">

              {[
                {
                  icon: Mail,
                  href: 'mailto:support@smartcampushub.com',
                },
                {
                  icon: Github,
                  href: '#',
                },
                {
                  icon: Linkedin,
                  href: '#',
                },
                {
                  icon: Twitter,
                  href: '#',
                },
              ].map((item, i) => (
                <a
                  key={i}
                  href={item.href}
                  className="group flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-400 backdrop-blur-xl transition-all hover:-translate-y-1 hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  <item.icon className="h-4 w-4" />
                </a>
              ))}

            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-white/10">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 text-center md:flex-row md:text-left">

            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} Smart Campus Hub.
              All rights reserved.
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-500">

              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                Enterprise Ready
              </span>

              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                Realtime Infrastructure
              </span>

              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
                Presentation Ready
              </span>

            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}