import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { ArrowLeft, LogIn } from 'lucide-react';

import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const setAuth = useAuthStore((s) => s.setAuth);

  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);

    try {
      const { data } = await api.post('/api/auth/login', {
        email,
        password,
      });

      setAuth(data.user, data.token);

      toast.success('Welcome back!');

      const role = data.user.role;

      const target =
        from ||
        (role === 'admin'
          ? '/admin/dashboard'
          : role === 'faculty'
            ? '/faculty/dashboard'
            : '/student/dashboard');

      navigate(target, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16">

      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 bg-mesh-gradient opacity-80" />

      <div className="pointer-events-none absolute -left-20 top-20 h-72 w-72 rounded-full bg-hub-blue/20 blur-3xl" />

      <div className="pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-hub-purple/20 blur-3xl" />

      {/* Back Button */}
      <Link
        to="/"
        className="absolute left-4 top-4 z-20 flex items-center gap-2 rounded-xl border border-white/20 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-700 shadow-lg backdrop-blur transition-all hover:scale-105 hover:bg-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <GlassCard className="border border-white/[0.12] bg-[rgba(10,12,40,0.80)] p-8 shadow-2xl backdrop-blur-2xl">

          {/* Header */}
          <div className="mb-8 text-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-hub-blue via-hub-purple to-hub-teal text-white shadow-xl"
            >
              <LogIn className="h-7 w-7" />
            </motion.div>

            <h1 className="mt-5 text-3xl font-bold text-white">
              Welcome Back
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Sign in to access your Smart Campus workspace.
            </p>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>

            {/* Email */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Email Address
              </label>

              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-2 w-full rounded-2xl border border-white/[0.12] bg-white/[0.07] px-4 py-3 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-500 focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/20 focus:bg-white/[0.09]"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Password
              </label>

              <input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="mt-2 w-full rounded-2xl border border-white/[0.12] bg-white/[0.07] px-4 py-3 text-sm text-slate-100 outline-none transition-all placeholder:text-slate-500 focus:border-indigo-500/60 focus:ring-4 focus:ring-indigo-500/20 focus:bg-white/[0.09]"
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl py-3 text-sm font-semibold shadow-xl transition-all hover:scale-[1.02]"
            >
              {loading ? 'Signing in...' : 'Continue'}
            </Button>
          </form>

          {/* Footer */}
          <p className="mt-8 text-center text-sm text-slate-600">
            New here?{' '}
            <Link
              to="/register"
              className="font-semibold text-hub-purple transition hover:text-hub-blue hover:underline"
            >
              Create an account
            </Link>
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}