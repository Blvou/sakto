/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0066FF',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#FF6B00',
          foreground: '#FFFFFF',
        },
        success: '#00C853',
        warning: '#FFB800',
        background: {
          DEFAULT: '#F7F9FC',
          dark: '#0D1526',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#1A2332',
        },
        border: {
          DEFAULT: '#DDE3ED',
          dark: '#2A3548',
        },
        text: {
          primary: '#0A1F44',
          secondary: '#6B7A99',
          'primary-dark': '#F0F4FF',
          'secondary-dark': '#8B9BB8',
        },
      },
      fontFamily: {
        sans: ['PlusJakartaSans_400Regular'],
        'sans-medium': ['PlusJakartaSans_500Medium'],
        'sans-semibold': ['PlusJakartaSans_600SemiBold'],
        'sans-bold': ['PlusJakartaSans_700Bold'],
      },
      fontSize: {
        h1: ['24px', { lineHeight: '32px', letterSpacing: '-0.5px', fontWeight: '700' }],
        h2: ['20px', { lineHeight: '28px', fontWeight: '600' }],
        h3: ['16px', { lineHeight: '24px', fontWeight: '600' }],
        body: ['14px', { lineHeight: '20px', fontWeight: '400' }],
        caption: ['12px', { lineHeight: '16px', fontWeight: '400' }],
        price: ['18px', { lineHeight: '24px', fontWeight: '700' }],
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        pill: '9999px',
      },
      boxShadow: {
        card: '0 2px 8px rgba(10, 31, 68, 0.08)',
        fab: '0 4px 12px rgba(255, 107, 0, 0.3)',
      },
      spacing: {
        touch: '44px',
      },
    },
  },
  plugins: [],
};
