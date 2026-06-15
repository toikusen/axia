// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#222428',
          secondary: '#2a2c32',
          card: '#262830',
          'admin-dark': '#171412',
        },
        border: {
          DEFAULT: '#3a3c42',
          subtle: '#2e3036',
        },
        'text-primary': '#ddd8cf',
        'text-secondary': '#9c9aa4',
        accent: {
          DEFAULT: '#c8a882',
          dark: '#a8886a',
          muted: '#8a7460',
        },
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Noto Sans TC', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      letterSpacing: {
        widest2: '0.3em',
        widest3: '0.4em',
      },
    },
  },
  plugins: [],
};
