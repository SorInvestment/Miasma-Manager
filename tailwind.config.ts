import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        plague: {
          50: '#fef3c7',
          100: '#fde68a',
          300: '#fb923c',
          500: '#dc2626',
          700: '#7f1d1d',
          900: '#1a0505',
        },
        ink: {
          900: '#0a0e1a',
          800: '#101524',
          700: '#1a2236',
          600: '#2a3550',
          500: '#3d4a6c',
          300: '#7c8aa8',
          100: '#c5cee0',
        },
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        marquee: 'marquee 50s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
