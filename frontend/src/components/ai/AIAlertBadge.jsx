/**
 * AIAlertBadge — Animated alert chip with severity-based styling.
 * Used in AI panels to surface anomalies and urgent alerts.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { useState } from 'react';

const SEVERITY_CONFIG = {
  critical: {
    bg: 'bg-red-500/15',
    border: 'border-red-500/40',
    text: 'text-red-300',
    icon: AlertTriangle,
    dot: 'bg-red-400',
    pulse: true,
    label: 'CRITICAL',
  },
  warning: {
    bg: 'bg-amber-500/15',
    border: 'border-amber-500/40',
    text: 'text-amber-300',
    icon: AlertCircle,
    dot: 'bg-amber-400',
    pulse: false,
    label: 'WARNING',
  },
  info: {
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    text: 'text-cyan-300',
    icon: Info,
    dot: 'bg-cyan-400',
    pulse: false,
    label: 'INFO',
  },
};

/**
 * Compact badge variant — use inside tables/lists
 */
export function AIAlertBadge({ severity = 'info', label }) {
  const cfg = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.info;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider
      ${cfg.bg} ${cfg.border} ${cfg.text}`}>
      {cfg.pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${cfg.dot}`} />
          <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
        </span>
      )}
      {!cfg.pulse && <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />}
      {label || cfg.label}
    </span>
  );
}

/**
 * Full alert card variant — dismissible, used in alert feeds
 */
export function AIAlertCard({ severity = 'info', title, message, onDismiss, delay = 0 }) {
  const [visible, setVisible] = useState(true);
  const cfg = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.info;
  const Icon = cfg.icon;

  function handleDismiss() {
    setVisible(false);
    onDismiss?.();
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: -10, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 10, scale: 0.95, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.3, delay }}
          className={`relative flex items-start gap-3 rounded-2xl border p-4
            ${cfg.bg} ${cfg.border} backdrop-blur-sm`}
        >
          {/* Icon */}
          <div className="shrink-0 pt-0.5">
            {cfg.pulse ? (
              <span className="relative flex h-5 w-5">
                <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-60 ${cfg.dot}`} />
                <span className={`relative inline-flex h-5 w-5 items-center justify-center rounded-full ${cfg.dot} bg-opacity-80`}>
                  <Icon className="h-3 w-3 text-white" />
                </span>
              </span>
            ) : (
              <Icon className={`h-5 w-5 ${cfg.text}`} />
            )}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="mb-0.5 flex items-center gap-2">
                  <AIAlertBadge severity={severity} />
                  {title && <p className={`text-sm font-semibold ${cfg.text}`}>{title}</p>}
                </div>
                {message && <p className="text-xs text-slate-400 leading-relaxed">{message}</p>}
              </div>
              <button
                onClick={handleDismiss}
                className="shrink-0 rounded-lg p-1 text-slate-600 transition hover:text-slate-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
