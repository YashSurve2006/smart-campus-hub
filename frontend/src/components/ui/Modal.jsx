/**
 * Modal — Enterprise animated modal with Framer Motion.
 * Features: animated enter/exit, Escape key, body scroll lock, portal, accessibility.
 * Sizes: sm | md | lg | xl | full
 */
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const SIZE_MAP = {
  sm:   'max-w-sm',
  md:   'max-w-lg',
  lg:   'max-w-2xl',
  xl:   'max-w-4xl',
  full: 'max-w-[95vw]',
};

export function Modal({
  open,
  onClose,
  title,
  children,
  size     = 'md',
  footer,
  hideClose = false,
}) {
  /* ── Escape key + body scroll lock ── */
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    const prev  = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const maxW = SIZE_MAP[size] || SIZE_MAP.md;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
        >
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            key="panel"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.94, y: 20  }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={[
              'relative z-[81] m-3 w-full overflow-hidden',
              'rounded-t-3xl sm:rounded-3xl',
              'border border-white/10 bg-slate-900/95',
              'shadow-[0_25px_80px_rgba(0,0,0,0.6)] backdrop-blur-2xl',
              'max-h-[90vh] flex flex-col',
              maxW,
            ].join(' ')}
          >
            {/* Header */}
            {(title || !hideClose) && (
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/8 px-6 py-4">
                {title && (
                  <h2
                    id="modal-title"
                    className="text-base font-bold text-white"
                  >
                    {title}
                  </h2>
                )}
                {!hideClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    className={[
                      'rounded-xl p-1.5 text-slate-500',
                      'transition-all duration-150',
                      'hover:bg-white/8 hover:text-white',
                      'focus-visible:outline-none focus-visible:ring-2',
                      'focus-visible:ring-indigo-500',
                      title ? 'ml-auto' : '',
                    ].join(' ')}
                    aria-label="Close dialog"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}

            {/* Body — scrollable */}
            <div className="scrollbar-thin flex-1 overflow-y-auto px-6 py-5">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="shrink-0 border-t border-white/8 px-6 py-4">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
