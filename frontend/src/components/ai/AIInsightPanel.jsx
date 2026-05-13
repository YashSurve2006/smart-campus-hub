/**
 * AIInsightPanel — Premium dark glassmorphism AI insight card
 * Used across student, faculty, and admin AI dashboards.
 * Features animated gradient border, pulse indicator, severity colors.
 */

import { motion } from 'framer-motion';
import {
  AlertTriangle, Info, TrendingUp, TrendingDown, Star,
  Target, Award, BookOpen, Calendar, Brain, Zap,
} from 'lucide-react';

const ICON_MAP = {
  'alert-triangle': AlertTriangle,
  'info': Info,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'star': Star,
  'target': Target,
  'award': Award,
  'book-x': BookOpen,
  'calendar': Calendar,
  'brain': Brain,
  'zap': Zap,
};

const PRIORITY_CONFIG = {
  high: {
    border: 'border-rose-500/40',
    bg: 'bg-rose-500/8',
    glow: 'shadow-rose-500/20',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    dot: 'bg-rose-400',
    iconColor: 'text-rose-400',
    pulseColor: 'bg-rose-400',
  },
  medium: {
    border: 'border-amber-500/40',
    bg: 'bg-amber-500/8',
    glow: 'shadow-amber-500/20',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    dot: 'bg-amber-400',
    iconColor: 'text-amber-400',
    pulseColor: 'bg-amber-400',
  },
  low: {
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-500/8',
    glow: 'shadow-emerald-500/20',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    dot: 'bg-emerald-400',
    iconColor: 'text-emerald-400',
    pulseColor: 'bg-emerald-400',
  },
  urgent: {
    border: 'border-red-500/60',
    bg: 'bg-red-500/10',
    glow: 'shadow-red-500/30',
    badge: 'bg-red-500/25 text-red-300 border-red-500/40',
    dot: 'bg-red-400',
    iconColor: 'text-red-400',
    pulseColor: 'bg-red-400',
  },
};

export function AIInsightPanel({
  title,
  description,
  priority = 'medium',
  icon = 'brain',
  category,
  delay = 0,
  compact = false,
}) {
  const cfg = PRIORITY_CONFIG[priority] || PRIORITY_CONFIG.medium;
  const Icon = ICON_MAP[icon] || Brain;

  return (
    <motion.div
      initial={{ opacity: 0, x: -12, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      whileHover={{ scale: 1.01, y: -1 }}
      className={`relative overflow-hidden rounded-2xl border backdrop-blur-xl transition-all duration-300
        ${cfg.border} ${cfg.bg} shadow-lg ${cfg.glow}
        ${compact ? 'p-3' : 'p-4'}`}
    >
      {/* Animated gradient sweep */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, transparent 60%)',
        }}
      />

      <div className="flex gap-3">
        {/* Icon with pulse */}
        <div className="relative shrink-0">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl
            ${cfg.bg} border ${cfg.border}`}>
            <Icon className={`h-4 w-4 ${cfg.iconColor}`} />
          </div>
          {/* Pulse indicator for high/urgent priority */}
          {(priority === 'high' || priority === 'urgent') && (
            <span className="absolute -right-0.5 -top-0.5">
              <span className={`flex h-2.5 w-2.5`}>
                <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${cfg.pulseColor}`} />
                <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${cfg.dot}`} />
              </span>
            </span>
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-white">{title}</p>
            {category && (
              <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${cfg.badge}`}>
                {category}
              </span>
            )}
          </div>
          <p className="text-xs leading-relaxed text-slate-400">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}
