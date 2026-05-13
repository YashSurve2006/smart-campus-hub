/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
      },
      colors: {
        hub: {
          blue: '#2563eb',
          indigo: '#4f46e5',
          purple: '#7c3aed',
          teal: '#0d9488',
          night: '#050914',
        },
      },
      backgroundImage: {
        /*
         * v2.1 REBALANCED ambient mesh:
         * Opacity cut ~40% — background supports content, never competes.
         * Ellipse shapes/positions preserved for atmospheric depth.
         */
        'mesh-ambient':
          'radial-gradient(ellipse 90% 70% at 15% 5%,  rgba(99,102,241,0.11) 0%, transparent 55%), ' +
          'radial-gradient(ellipse 70% 55% at 85% 90%, rgba(139,92,246,0.09) 0%, transparent 50%), ' +
          'radial-gradient(ellipse 60% 45% at 80% 15%, rgba(59,130,246,0.06) 0%, transparent 45%), ' +
          'radial-gradient(ellipse 50% 40% at 45% 70%, rgba(6,182,212,0.05) 0%, transparent 40%)',
        /* Legacy names kept for backward compat */
        'mesh-gradient':
          'radial-gradient(at 40% 20%, rgba(37,99,235,0.25) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(124,58,237,0.22) 0px, transparent 50%), radial-gradient(at 0% 80%, rgba(13,148,136,0.18) 0px, transparent 45%)',
        'mesh-dark':
          'radial-gradient(at 20% 20%, rgba(59,130,246,0.12) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(124,58,237,0.12) 0px, transparent 45%), radial-gradient(at 50% 80%, rgba(13,148,136,0.08) 0px, transparent 40%)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      boxShadow: {
        /*
         * v2.1 REBALANCED shadows:
         * - inset top highlight lifted (0.06→0.10) for visible glass edge
         * - outer shadows deeper for genuine elevation
         * - button glow amplified for CTA energy
         */
        'glass': '0 1px 0 rgba(255,255,255,0.10) inset, 0 8px 32px rgba(0,0,0,0.40)',
        'glass-dark': '0 1px 0 rgba(255,255,255,0.08) inset, 0 16px 48px rgba(0,0,0,0.55)',
        'glass-elevated': '0 1px 0 rgba(255,255,255,0.12) inset, 0 20px 60px rgba(0,0,0,0.60), 0 0 0 1px rgba(255,255,255,0.06)',
        'glow-indigo': '0 0 28px rgba(99,102,241,0.28),  0 0 56px rgba(99,102,241,0.10)',
        'glow-blue': '0 0 28px rgba(59,130,246,0.25),  0 0 56px rgba(59,130,246,0.09)',
        'glow-cyan': '0 0 28px rgba(6,182,212,0.22),   0 0 56px rgba(6,182,212,0.08)',
        'glow-violet': '0 0 28px rgba(139,92,246,0.25),  0 0 56px rgba(139,92,246,0.09)',
        'glow-emerald': '0 0 28px rgba(16,185,129,0.22),  0 0 56px rgba(16,185,129,0.08)',
        'glow-amber': '0 0 28px rgba(245,158,11,0.22),  0 0 56px rgba(245,158,11,0.08)',
        'card-hover': '0 24px 48px rgba(0,0,0,0.50), 0 0 0 1px rgba(255,255,255,0.10)',
        'sidebar': '0 0 0 1px rgba(255,255,255,0.08), 0 20px 60px rgba(0,0,0,0.65), 4px 0 32px rgba(0,0,0,0.45)',
        'premium': '0 25px 50px rgba(0,0,0,0.60)',
        /* AMPLIFIED: button shadow stronger for clear CTA separation */
        'button-primary': '0 4px 20px rgba(99,102,241,0.40), 0 1px 4px rgba(0,0,0,0.35)',
        'button-primary-hover': '0 8px 28px rgba(99,102,241,0.50), 0 2px 8px rgba(0,0,0,0.40)',
        'inner-top': 'inset 0 1px 0 rgba(255,255,255,0.10)',
        /* New: depth layers for layered surfaces */
        'depth-1': '0 1px 0 rgba(255,255,255,0.09) inset, 0 4px 16px rgba(0,0,0,0.28)',
        'depth-2': '0 1px 0 rgba(255,255,255,0.12) inset, 0 8px 28px rgba(0,0,0,0.38)',
        'depth-3': '0 1px 0 rgba(255,255,255,0.14) inset, 0 16px 48px rgba(0,0,0,0.50)',
      },
      animation: {
        'shimmer': 'shimmer 1.8s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2.5s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
        'spin-slow': 'spin-slow 8s linear infinite',
        'ping-slow': 'ping-slow 1.5s cubic-bezier(0,0,0.2,1) infinite',
        'fade-in-up': 'fade-in-up 0.4s cubic-bezier(0.25,0.46,0.45,0.94) both',
        'gradient': 'gradient-shift 5s ease infinite',
        'mesh-drift': 'mesh-drift 20s ease-in-out infinite',
        'border-glow': 'border-glow 3s ease-in-out infinite',
        'slide-left': 'slide-in-left 0.3s cubic-bezier(0.25,0.46,0.45,0.94) both',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'spin-slow': {
          to: { transform: 'rotate(360deg)' },
        },
        'ping-slow': {
          '75%, 100%': { transform: 'scale(1.8)', opacity: '0' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'mesh-drift': {
          '0%, 100%': { transform: 'translate(0,0) scale(1)' },
          '33%': { transform: 'translate(30px,-20px) scale(1.05)' },
          '66%': { transform: 'translate(-20px,15px) scale(0.97)' },
        },
        'border-glow': {
          '0%, 100%': { boxShadow: '0 0 0 1px rgba(99,102,241,0.25), 0 0 20px rgba(99,102,241,0.10)' },
          '50%': { boxShadow: '0 0 0 1px rgba(99,102,241,0.45), 0 0 30px rgba(99,102,241,0.20)' },
        },
        'slide-in-left': {
          from: { opacity: '0', transform: 'translateX(-12px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
      borderOpacity: {
        8: '0.08',
        12: '0.12',
        15: '0.15',
      },
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        68: '17rem',
        72: '18rem',
        76: '19rem',
      },
      backdropBlur: {
        '3xl': '64px',
        '4xl': '80px',
      },
    },
  },
  plugins: [],
};