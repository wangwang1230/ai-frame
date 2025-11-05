const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0E0F11',
          subtle: '#16181D',
          elevated: '#1E2026'
        },
        surface: '#111318',
        primary: {
          DEFAULT: '#4C8CFF',
          foreground: '#0E1117'
        },
        accent: '#38D28F',
        warning: '#FEC84B',
        danger: '#F97066',
        text: {
          DEFAULT: '#F2F4F7',
          muted: '#98A2B3',
          subtle: '#475467'
        }
      },
      fontFamily: {
        sans: ['"Inter"', ...defaultTheme.fontFamily.sans],
        mono: ['"JetBrains Mono"', ...defaultTheme.fontFamily.mono]
      },
      boxShadow: {
        card: '0 30px 60px rgba(5, 8, 20, 0.35)'
      }
    }
  }
}
