import { useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import {
  Mail,
  MapPin,
  Phone,
  Send,
  Sparkles,
  MessageSquareText,
  ArrowRight,
  CheckCircle2,
  Clock,
  Globe,
  Zap,
  Shield,
  Users,
  Building2,
  ChevronRight,
} from 'lucide-react';

import { GlassCard } from '../../components/ui/GlassCard';

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
const FloatingOrb = ({ className }) => (
  <div className={`pointer-events-none absolute rounded-full blur-3xl ${className}`} />
);

const StatBadge = ({ icon: Icon, label, value, color }) => (
  <motion.div
    whileHover={{ y: -4, scale: 1.03 }}
    className="flex flex-col items-center gap-1 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 shadow-lg backdrop-blur-xl"
  >
    <div className={`rounded-xl p-2 ${color}`}>
      <Icon className="h-4 w-4" />
    </div>
    <span className="text-xl font-black text-white">{value}</span>
    <span className="text-xs font-medium text-slate-400">{label}</span>
  </motion.div>
);

const ContactRow = ({ icon: Icon, label, value, href, colorClass }) => (
  <motion.a
    href={href || '#'}
    whileHover={{ x: 6 }}
    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-md backdrop-blur-xl transition-all hover:bg-white/10 hover:shadow-xl"
  >
    <div className={`flex-shrink-0 rounded-xl p-3 ${colorClass}`}>
      <Icon className="h-5 w-5" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">{label}</p>
      <p className="mt-0.5 truncate text-sm font-semibold text-slate-100">{value}</p>
    </div>
    <ChevronRight className="h-4 w-4 flex-shrink-0 text-slate-600 transition-all group-hover:translate-x-1 group-hover:text-slate-300" />
  </motion.a>
);

const FeatureChip = ({ text, index }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.07 }}
    whileHover={{ scale: 1.05 }}
    className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/5 px-4 py-3 shadow-md backdrop-blur-xl"
  >
    <div className="h-2 w-2 flex-shrink-0 rounded-full bg-gradient-to-r from-hub-blue to-hub-purple" />
    <span className="text-sm font-medium text-slate-300">{text}</span>
    <CheckCircle2 className="ml-auto h-3.5 w-3.5 flex-shrink-0 text-hub-teal" />
  </motion.div>
);

const InputField = ({ label, id, type = 'text', placeholder, rows, required }) => {
  const [focused, setFocused] = useState(false);
  const [filled, setFilled] = useState(false);

  const baseClass =
    'w-full rounded-2xl border bg-white/5 px-4 py-3.5 text-sm font-medium text-slate-100 outline-none transition-all duration-200 placeholder:text-slate-600 backdrop-blur-sm';
  const stateClass = focused
    ? 'border-hub-blue ring-4 ring-hub-blue/20 shadow-lg shadow-hub-blue/10'
    : filled
      ? 'border-hub-teal/50 shadow-md'
      : 'border-white/10 hover:border-white/20';

  const Tag = rows ? 'textarea' : 'input';

  return (
    <div className="group relative">
      <label
        htmlFor={id}
        className={`mb-2 block text-xs font-bold uppercase tracking-widest transition-colors ${focused ? 'text-hub-blue' : 'text-slate-500'
          }`}
      >
        {label}
        {required && <span className="ml-1 text-hub-purple">*</span>}
      </label>
      <div className="relative">
        <Tag
          id={id}
          type={type}
          required={required}
          rows={rows}
          placeholder={placeholder}
          onFocus={() => setFocused(true)}
          onBlur={(e) => {
            setFocused(false);
            setFilled(e.target.value.length > 0);
          }}
          className={`${baseClass} ${stateClass} ${rows ? 'resize-none' : ''}`}
        />
        {filled && !focused && !rows && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
          >
            <CheckCircle2 className="h-4 w-4 text-hub-teal" />
          </motion.div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Enquiry Type Picker
───────────────────────────────────────────── */
const ENQUIRY_TYPES = [
  'General Enquiry',
  'Enterprise/Deployment',
  'Partnership',
  'Technical Support',
  'Demo Request',
];

function EnquiryTypePicker() {
  const [selected, setSelected] = useState(null);
  return (
    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500">
        Enquiry Type
      </p>
      <div className="flex flex-wrap gap-2">
        {ENQUIRY_TYPES.map((type) => (
          <motion.button
            key={type}
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setSelected(type)}
            className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition-all ${selected === type
                ? 'border-hub-purple/50 bg-hub-purple/20 text-hub-purple shadow-md shadow-hub-purple/20'
                : 'border-white/10 bg-white/5 text-slate-400 hover:border-hub-blue/30 hover:bg-white/10 hover:text-slate-200'
              }`}
          >
            {type}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
export default function Contact() {
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    toast.success("Message sent! We'll be in touch within 24 hours.", {
      position: 'bottom-right',
      style: {
        borderRadius: '16px',
        fontWeight: 600,
        background: '#1e293b',
        color: '#f1f5f9',
        border: '1px solid rgba(255,255,255,0.1)',
      },
    });
    setSent(true);
    setSubmitting(false);
  }

  const stats = [
    { icon: Clock, label: 'Response time', value: '< 24h', color: 'bg-hub-blue/20 text-hub-blue' },
    { icon: Users, label: 'Institutions', value: '200+', color: 'bg-hub-purple/20 text-hub-purple' },
    { icon: Globe, label: 'Countries', value: '18', color: 'bg-hub-teal/20 text-hub-teal' },
    { icon: Zap, label: 'Uptime SLA', value: '99.9%', color: 'bg-amber-500/20 text-amber-400' },
  ];

  const features = [
    'Realtime campus communication',
    'Modern role-based dashboards',
    'Enterprise-grade architecture',
    'Scalable API infrastructure',
    'Premium user experience',
    'GDPR-compliant data handling',
    'SSO & multi-tenant support',
    'Dedicated onboarding team',
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950">

      {/* Dark ambient glow */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 60% -10%, rgba(99,102,241,0.18) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 5% 80%, rgba(20,184,166,0.12) 0%, transparent 55%), radial-gradient(ellipse 70% 60% at 95% 90%, rgba(59,130,246,0.12) 0%, transparent 55%)',
        }}
      />

      {/* Dot grid */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage: 'radial-gradient(rgba(148,163,184,0.07) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <FloatingOrb className="h-[600px] w-[600px] -left-48 -top-24 bg-hub-blue/10 opacity-60" />
      <FloatingOrb className="h-[700px] w-[700px] -right-48 top-24 bg-hub-purple/10 opacity-50" />
      <FloatingOrb className="h-[500px] w-[500px] bottom-0 left-1/2 -translate-x-1/2 bg-hub-teal/10 opacity-40" />

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">

        {/* HERO */}
        <motion.section
          ref={heroRef}
          style={{ y: heroY, opacity: heroOpacity }}
          className="text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="inline-flex items-center gap-2.5 rounded-full border border-hub-purple/30 bg-hub-purple/10 px-5 py-2.5 text-sm font-bold text-hub-purple shadow-lg shadow-hub-purple/10 backdrop-blur-xl"
          >
            <Sparkles className="h-4 w-4 animate-pulse" />
            Contact Smart Campus Hub
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.6 }}
            className="mx-auto mt-7 max-w-5xl text-5xl font-black leading-[1.1] tracking-tight text-white md:text-6xl lg:text-7xl"
          >
            {"Let's build the future of "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #2dd4bf 100%)',
              }}
            >
              digital campuses
            </span>
            .
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, duration: 0.6 }}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-400"
          >
            Questions about deployment, integrations, partnerships, academic
            workflows, or enterprise customization? Reach out and we will help you
            transform your campus operations.
          </motion.p>

          {/* CTA row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32, duration: 0.5 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <motion.a
              href="#contact-form"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-hub-blue to-hub-purple px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-hub-purple/30 transition-shadow hover:shadow-xl hover:shadow-hub-purple/40"
            >
              Send a Message <ArrowRight className="h-4 w-4" />
            </motion.a>
            <motion.a
              href="mailto:support@smartcampushub.com"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-7 py-3.5 text-sm font-bold text-slate-200 shadow-sm backdrop-blur-xl transition-all hover:border-hub-blue/40 hover:bg-white/10"
            >
              <Mail className="h-4 w-4 text-hub-blue" /> Email Directly
            </motion.a>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.44, duration: 0.6 }}
            className="mt-14 flex flex-wrap justify-center gap-4"
          >
            {stats.map((s) => (
              <StatBadge key={s.label} {...s} />
            ))}
          </motion.div>
        </motion.section>

        {/* DIVIDER */}
        <div className="my-20 flex items-center gap-6">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-slate-500 backdrop-blur-xl">
            Get In Touch
          </div>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        {/* MAIN GRID */}
        <section id="contact-form" className="grid gap-8 lg:grid-cols-[1fr_1.35fr] lg:gap-10">

          {/* LEFT */}
          <div className="space-y-6">

            <motion.div
              initial={{ opacity: 0, x: -32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55 }}
            >
              <GlassCard className="overflow-hidden border border-white/10 bg-slate-900/60 shadow-2xl backdrop-blur-2xl">
                <div
                  className="px-8 py-6"
                  style={{
                    background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(139,92,246,0.15) 100%)',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className="rounded-2xl bg-hub-blue/20 p-3 shadow-md">
                      <MessageSquareText className="h-6 w-6 text-hub-blue" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-white">Contact Information</h2>
                      <p className="mt-0.5 text-xs font-medium text-slate-400">We reply within 24 hours, Mon-Sat</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 p-8 pt-6">
                  <ContactRow icon={Mail} label="Email" value="support@smartcampushub.com" href="mailto:support@smartcampushub.com" colorClass="bg-hub-purple/20 text-hub-purple" />
                  <ContactRow icon={Phone} label="Phone" value="+91 8850706982" href="tel:+918850706982" colorClass="bg-hub-blue/20 text-hub-blue" />
                  <ContactRow icon={MapPin} label="Office" value="Smart Campus Innovation Center, Mumbai" href="#" colorClass="bg-hub-teal/20 text-hub-teal" />
                </div>

                <div className="mx-8 mb-8 flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-3">
                  <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </span>
                  <p className="text-xs font-semibold text-emerald-400">Our team is currently online and available</p>
                </div>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.1 }}
            >
              <GlassCard className="border border-white/10 bg-slate-900/60 p-8 shadow-2xl backdrop-blur-2xl">
                <div className="mb-2 flex items-center gap-3">
                  <div className="rounded-xl bg-hub-purple/20 p-2.5 text-hub-purple">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-black text-white">Why institutions choose us</h3>
                </div>
                <p className="mb-6 text-xs font-medium text-slate-500">Trusted by 200+ campuses across 18 countries</p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {features.map((item, i) => (
                    <FeatureChip key={item} text={item} index={i} />
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex flex-wrap gap-3"
            >
              {[
                { icon: Shield, text: 'SOC 2 Compliant', color: 'text-hub-blue' },
                { icon: Zap, text: '99.9% Uptime', color: 'text-amber-400' },
                { icon: Globe, text: 'GDPR Ready', color: 'text-hub-teal' },
              ].map(({ icon: Icon, text, color }) => (
                <div key={text} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-xl">
                  <Icon className={`h-4 w-4 ${color}`} />
                  <span className="text-xs font-bold text-slate-300">{text}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* RIGHT — FORM */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <GlassCard className="relative overflow-hidden border border-white/10 bg-slate-900/60 shadow-2xl backdrop-blur-2xl">
              <div
                className="h-1.5 w-full"
                style={{ background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #14b8a6 100%)' }}
              />

              <div className="p-8 md:p-10">
                <div className="mb-8">
                  <h2 className="text-3xl font-black tracking-tight text-white">Send us a message</h2>
                  <p className="mt-2 text-sm font-medium text-slate-400">
                    Fill out the form below and our team will connect with you shortly.
                  </p>
                </div>

                <AnimatePresence>
                  {sent && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.85, y: 16 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center gap-4 py-12 text-center"
                    >
                      <div className="rounded-full bg-emerald-500/20 p-5 shadow-lg shadow-emerald-500/10">
                        <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                      </div>
                      <h3 className="text-2xl font-black text-white">Message Sent!</h3>
                      <p className="max-w-xs text-sm font-medium text-slate-400">
                        Thanks for reaching out. We will get back to you within 24 hours.
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setSent(false)}
                        className="mt-2 rounded-full border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-bold text-slate-300 transition-all hover:bg-white/10"
                      >
                        Send another message
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {!sent && (
                  <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <InputField id="name" label="Full Name" placeholder="John Doe" required />
                      <InputField id="email" label="Email Address" placeholder="you@example.com" type="email" required />
                    </div>

                    <InputField id="subject" label="Subject" placeholder="e.g. Enterprise deployment inquiry" required />

                    <EnquiryTypePicker />

                    <InputField id="msg" label="Your Message" placeholder="Tell us about your requirements, deployment needs, or questions..." rows={5} required />

                    <motion.button
                      type="submit"
                      disabled={submitting}
                      whileHover={!submitting ? { scale: 1.02, y: -2 } : {}}
                      whileTap={!submitting ? { scale: 0.98 } : {}}
                      className="relative w-full overflow-hidden rounded-2xl py-4 text-sm font-black text-white shadow-xl shadow-hub-purple/20 transition-all disabled:cursor-not-allowed disabled:opacity-60"
                      style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 60%, #14b8a6 100%)' }}
                    >
                      <motion.div
                        className="absolute inset-0 -skew-x-12 bg-white/10"
                        initial={{ x: '-120%' }}
                        animate={{ x: ['-120%', '120%'] }}
                        transition={{ repeat: Infinity, duration: 2.8, ease: 'linear' }}
                      />
                      <span className="relative flex items-center justify-center gap-2.5">
                        {submitting ? (
                          <>
                            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Send Message
                          </>
                        )}
                      </span>
                    </motion.button>

                    <p className="text-center text-[11px] font-medium text-slate-600">
                      By submitting you agree to our{' '}
                      <a href="#" className="text-hub-blue underline underline-offset-2 hover:text-hub-purple">Privacy Policy</a>
                      . We never share your data.
                    </p>
                  </form>
                )}
              </div>
            </GlassCard>
          </motion.div>
        </section>

        {/* BOTTOM CTA */}
        <motion.section
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20"
        >
          <div
            className="relative overflow-hidden rounded-3xl p-10 text-center"
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(139,92,246,0.12) 50%, rgba(20,184,166,0.08) 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(24px)',
            }}
          >
            <FloatingOrb className="h-64 w-64 -left-20 -top-16 bg-hub-blue/15 opacity-60" />
            <FloatingOrb className="h-64 w-64 -right-20 -bottom-16 bg-hub-purple/15 opacity-60" />

            <div className="relative">
              <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-hub-purple/30 bg-hub-purple/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-hub-purple backdrop-blur-xl">
                <Zap className="h-3.5 w-3.5" /> Fast Implementation
              </div>
              <h2 className="text-3xl font-black text-white md:text-4xl">Ready to modernize your campus?</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm font-medium text-slate-400">
                Join 200+ institutions who have transformed their digital infrastructure with Smart Campus Hub.
                Average deployment in under 2 weeks.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <motion.a
                  href="#contact-form"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-black text-white shadow-xl shadow-hub-purple/30"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
                >
                  Book a Demo <ArrowRight className="h-4 w-4" />
                </motion.a>
                <motion.a
                  href="mailto:support@smartcampushub.com"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-4 text-sm font-black text-slate-200 backdrop-blur-xl transition-all hover:bg-white/10"
                >
                  <Mail className="h-4 w-4 text-hub-blue" /> Email Our Team
                </motion.a>
              </div>
            </div>
          </div>
        </motion.section>

      </div>
    </div>
  );
}