import { clsx } from 'clsx';

const STATUS_CONFIG = {
  draft: { label: 'Draft', classes: 'bg-slate-500/10 text-slate-600 dark:text-slate-400' },
  published: { label: 'Published', classes: 'bg-amber-500/10 text-amber-700 dark:text-amber-300' },
  active: { label: 'Active', classes: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300' },
  expired: { label: 'Expired', classes: 'bg-rose-500/10 text-rose-700 dark:text-rose-300' },
  closed: { label: 'Closed', classes: 'bg-slate-600/10 text-slate-700 dark:text-slate-300' },
};

export function AssignmentStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.draft;

  return (
    <span
      className={clsx(
        'rounded-full px-2 py-0.5 text-[10px] font-bold uppercase',
        config.classes
      )}
    >
      {config.label}
    </span>
  );
}
