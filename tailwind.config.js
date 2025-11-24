/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'royal-blue': {
          DEFAULT: '#4169E1',
          50: '#E8EDFF',
          100: '#D1DBFF',
          200: '#A3B7FF',
          300: '#7593FF',
          400: '#476FFF',
          500: '#4169E1',
          600: '#3454B8',
          700: '#273F8F',
          800: '#1A2A66',
          900: '#0D153D',
        },
        'coral': {
          DEFAULT: '#FF6B6B',
          50: '#FFF0F0',
          100: '#FFE0E0',
          200: '#FFC1C1',
          300: '#FFA2A2',
          400: '#FF8383',
          500: '#FF6B6B',
          600: '#FF5252',
          700: '#E63946',
          800: '#CC2936',
          900: '#B21E2B',
        },
        'teal': {
          DEFAULT: '#20B2AA',
          50: '#E0F7F5',
          100: '#B2E8E3',
          200: '#80D9D1',
          300: '#4DCCC0',
          400: '#26BDB0',
          500: '#20B2AA',
          600: '#1A9A93',
          700: '#14827C',
          800: '#0E6A65',
          900: '#08524E',
        },
        'amber': {
          DEFAULT: '#FFB84D',
          50: '#FFF8ED',
          100: '#FFF0D6',
          200: '#FFE1AD',
          300: '#FFD285',
          400: '#FFC35C',
          500: '#FFB84D',
          600: '#FFA726',
          700: '#FF9800',
          800: '#E68900',
          900: '#CC7A00',
        },
        'green': {
          DEFAULT: '#10B981',
          50: '#ECFDF5',
          100: '#D1FAE5',
          200: '#A7F3D0',
          300: '#6EE7B7',
          400: '#34D399',
          500: '#10B981',
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        },
      },
      fontFamily: {
        'body': ['Inter', 'sans-serif'],      // Primary - for body text, descriptions, lists
        'heading': ['Poppins', 'sans-serif'], // Secondary - for headings, titles, buttons
      },
      fontSize: {
        'body': ['16px', { lineHeight: '1.5', letterSpacing: '0' }],
        'body-sm': ['14px', { lineHeight: '1.5', letterSpacing: '0' }],
        'h1': ['32px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '700' }],
        'h2': ['24px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        'h3': ['20px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        'button': ['16px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '600' }],
        'price': ['20px', { lineHeight: '1.2', letterSpacing: '0', fontWeight: '700' }],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'slide-in-left': 'slideInLeft 0.6s ease-out',
        'slide-in-right': 'slideInRight 0.6s ease-out',
        'nav-link': 'navLink 0.3s ease-out',
        'bounce-gentle': 'bounceGentle 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        navLink: {
          '0%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-2px) scale(1.02)' },
          '100%': { transform: 'translateY(0) scale(1)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
}

