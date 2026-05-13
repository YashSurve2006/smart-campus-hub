import { Inbox } from 'lucide-react';
import { motion } from 'framer-motion';

export function EmptyState({
  title = 'No Data Found',
  description = 'There is currently nothing available here.',
  icon: Icon = Inbox,
  action,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="
        relative overflow-hidden rounded-[28px]
        border border-white/10
        bg-gradient-to-br
        from-slate-900/95
        via-slate-900/90
        to-slate-950/95
        px-8 py-16
        text-center
        shadow-[0_20px_80px_rgba(0,0,0,0.45)]
        backdrop-blur-2xl
      "
    >
      <div className="pointer-events-none absolute -top-24 left-1/2 h-52 w-52 -translate-x-1/2 rounded-full bg-violet-500/20 blur-3xl" />

      <div className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl" />

      <div
        className="
          mx-auto mb-5 flex h-20 w-20 items-center justify-center
          rounded-3xl border border-white/10
          bg-white/[0.04]
          shadow-inner shadow-white/5
        "
      >
        <Icon className="h-10 w-10 text-violet-400" />
      </div>

      <h3 className="text-2xl font-bold tracking-tight text-white">
        {title}
      </h3>

      {description && (
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-slate-400">
          {description}
        </p>
      )}

      {action && (
        <div className="mt-7 flex justify-center">
          {action}
        </div>
      )}

      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-violet-500/70 to-transparent" />
    </motion.div>
  );
}