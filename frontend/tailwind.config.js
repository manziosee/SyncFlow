/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand — SyncFlow green (COINEST-inspired)
        primary: {
          DEFAULT: '#22C55E',
          50:  '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
          800: '#166534',
          900: '#14532D',
        },

        // Sidebar dark navy (COINEST sidebar)
        sidebar: {
          DEFAULT: '#0F172A',
          hover:   '#1E293B',
          border:  '#1E293B',
          text:    '#94A3B8',
          active:  '#FFFFFF',
          icon:    '#64748B',
        },

        // App background
        canvas: {
          DEFAULT: '#F1F5F9',
          card:    '#FFFFFF',
        },

        // Text
        ink: {
          DEFAULT: '#0F172A',
          secondary: '#64748B',
          muted: '#94A3B8',
        },

        // Status
        success: { DEFAULT: '#22C55E', bg: '#F0FDF4' },
        danger:  { DEFAULT: '#EF4444', bg: '#FEF2F2' },
        warning: { DEFAULT: '#F59E0B', bg: '#FFFBEB' },
        info:    { DEFAULT: '#3B82F6', bg: '#EFF6FF' },
        purple:  { DEFAULT: '#8B5CF6', bg: '#F5F3FF' },
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },

      borderRadius: {
        lg: '12px',
        xl: '16px',
        '2xl': '20px',
      },

      boxShadow: {
        card:    '0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.10)',
        sidebar: '2px 0 12px 0 rgb(0 0 0 / 0.15)',
      },

      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'pulse-green': 'pulseGreen 2s ease-in-out infinite',
      },

      keyframes: {
        fadeIn: {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateX(-12px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        pulseGreen: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(34, 197, 94, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(34, 197, 94, 0)' },
        },
      },
    },
  },
  plugins: [],
}
