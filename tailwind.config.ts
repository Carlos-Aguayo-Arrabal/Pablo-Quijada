import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'fit-base': '#080C14',
        'fit-soft': '#0D1421',
        'fit-card': '#111827',
        'fit-border': 'rgba(255,255,255,0.08)',
        'fit-teal': '#6EE7B7',
        'fit-indigo': '#818CF8',
        'fit-orange': '#FB923C',
        'fit-red': '#F87171',
        'fit-text': '#F8FAFC',
        'fit-muted': '#94A3B8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'blob-slow': 'blob 10s ease-in-out infinite',
        'blob-medium': 'blob 8s ease-in-out infinite 2s',
        'blob-fast': 'blob 12s ease-in-out infinite 4s',
        'fade-up': 'fadeUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'shimmer': 'shimmer 3s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
        'count-up': 'countUp 0.8s ease-out forwards',
      },
      keyframes: {
        blob: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(40px, -60px) scale(1.15)' },
          '66%': { transform: 'translate(-30px, 30px) scale(0.9)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-mesh': `
          radial-gradient(at 20% 30%, rgba(110, 231, 183, 0.15) 0px, transparent 50%),
          radial-gradient(at 80% 10%, rgba(129, 140, 248, 0.15) 0px, transparent 50%),
          radial-gradient(at 60% 80%, rgba(110, 231, 183, 0.08) 0px, transparent 50%)
        `,
      },
      boxShadow: {
        'glass': '0 4px 24px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
        'teal': '0 0 20px rgba(110, 231, 183, 0.3)',
        'indigo': '0 0 20px rgba(129, 140, 248, 0.3)',
        'card': '0 4px 32px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
}

export default config
