/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cyan: {
          950: '#020d10',
        },
        rose: {
          950: '#100208',
        },
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { textShadow: '0 0 4px #22d3ee' },
          '100%': { textShadow: '0 0 16px #22d3ee, 0 0 40px #22d3ee' },
        },
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(34, 211, 238, 0.4)',
        'neon-rose': '0 0 20px rgba(244, 63, 94, 0.4)',
      },
    },
  },
  plugins: [],
};
