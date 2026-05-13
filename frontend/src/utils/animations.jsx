/**
 * Shared Framer Motion animation variants for the Enterprise Midnight Glass design system.
 * Eliminates duplication of fadeUp, stagger, slideIn, etc. across 8+ pages.
 *
 * Usage:
 *   import { fadeUp, stagger, slideIn, scaleIn, Orb, GridTexture } from '../../utils/animations';
 *   <motion.div {...fadeUp(0.1)}>...</motion.div>
 *   <motion.div variants={stagger} initial="initial" animate="animate">
 *     <motion.div variants={fadeUpVariant}>child</motion.div>
 *   </motion.div>
 */

/** Fade up — accepts optional delay in seconds */
export const fadeUp = (delay = 0) => ({
  initial:    { opacity: 0, y: 18 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

/** Fade down — for dropdowns/menus */
export const fadeDown = (delay = 0) => ({
  initial:    { opacity: 0, y: -12 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.35, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

/** Fade in — simple opacity */
export const fadeIn = (delay = 0) => ({
  initial:    { opacity: 0 },
  animate:    { opacity: 1 },
  transition: { duration: 0.4, delay },
});

/** Scale in — for modals, cards appearing */
export const scaleIn = (delay = 0) => ({
  initial:    { opacity: 0, scale: 0.92 },
  animate:    { opacity: 1, scale: 1 },
  transition: { duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

/** Slide in from left */
export const slideInLeft = (delay = 0) => ({
  initial:    { opacity: 0, x: -16 },
  animate:    { opacity: 1, x: 0 },
  transition: { duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

/** Slide in from right */
export const slideInRight = (delay = 0) => ({
  initial:    { opacity: 0, x: 16 },
  animate:    { opacity: 1, x: 0 },
  transition: { duration: 0.4, delay, ease: [0.25, 0.46, 0.45, 0.94] },
});

/** Stagger container — wrap children with this */
export const stagger = {
  animate: { transition: { staggerChildren: 0.07 } },
};

/** Stagger — fast version */
export const staggerFast = {
  animate: { transition: { staggerChildren: 0.04 } },
};

/** Child variant for stagger containers */
export const fadeUpVariant = {
  initial:    { opacity: 0, y: 16 },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
};

/** Hover lift effect props */
export const hoverLift = {
  whileHover: { y: -3, scale: 1.01 },
  transition: { duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] },
};

/** Hover scale — for buttons/tiles */
export const hoverScale = {
  whileHover: { scale: 1.04 },
  whileTap:   { scale: 0.97 },
};

/** Orb background decoration — must be in .jsx because it uses JSX */
export function Orb({ className }) {
  return (
    <div className={`pointer-events-none absolute rounded-full blur-3xl ${className}`} />
  );
}

/** Grid texture overlay — must be in .jsx because it uses JSX */
export function GridTexture({ opacity = 0.025, color = '99,102,241' }) {
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        opacity,
        backgroundImage: `linear-gradient(rgba(${color},1) 1px, transparent 1px), linear-gradient(90deg, rgba(${color},1) 1px, transparent 1px)`,
        backgroundSize: '48px 48px',
      }}
    />
  );
}
