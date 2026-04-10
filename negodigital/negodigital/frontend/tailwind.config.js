/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#E8FF59',
          dim: '#C5D94B',
          glow: 'rgba(232,255,89,0.15)',
        },
        surface: {
          primary: '#0A0A0C',
          secondary: '#111114',
          card: '#16161A',
          elevated: '#1E1E24',
        },
        content: {
          primary: '#F0EDE6',
          secondary: '#9B978F',
          muted: '#5C5A55',
        },
      },
      fontFamily: {
        display: ['Instrument Serif', 'Georgia', 'serif'],
        body: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        xl: '22px',
        '2xl': '32px',
      },
    },
  },
  plugins: [],
};
