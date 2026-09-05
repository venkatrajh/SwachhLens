/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#168A5B',
          hover: '#13754D',
          dark: '#0F5132',
          light: '#EAF6EF',
        },
        secondary: {
          DEFAULT: '#22A06B',
        },
        deepforest: '#0F5132',
        surface: '#FFFFFF',
        background: '#F7FAF8',
        border: '#DCE7E1',
        textPrimary: '#17211B',
        textSecondary: '#64736A',
        // Dark theme tokens
        darkBg: '#0D1712',
        darkSurface: '#14221B',
        darkElevated: '#1A2C23',
        darkPrimary: '#39B77A',
        darkText: '#F2F7F4',
        darkTextSec: '#A9BBB1',
        darkBorder: '#294037',
        priority: {
          low: '#2E8B57',
          medium: '#D89B18',
          high: '#E56B2F',
          critical: '#D64545',
          success: '#168A5B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(15, 81, 50, 0.08)',
        'glass-hover': '0 12px 36px 0 rgba(15, 81, 50, 0.14)',
        'card': '0 2px 8px -1px rgba(23, 33, 27, 0.06), 0 1px 4px -1px rgba(23, 33, 27, 0.04)',
        'floating': '0 10px 25px -5px rgba(22, 138, 91, 0.2), 0 8px 10px -6px rgba(22, 138, 91, 0.1)',
        'dark-card': '0 2px 8px -1px rgba(0, 0, 0, 0.35)',
      },
      backdropBlur: {
        'glass': '12px',
      },
    },
  },
  plugins: [],
}
