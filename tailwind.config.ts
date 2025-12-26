import type { Config } from 'tailwindcss'
import plugin from 'tailwindcss/plugin'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        'card-foreground': 'var(--card-foreground)',
        popover: 'var(--popover)',
        'popover-foreground': 'var(--popover-foreground)',
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-foreground)',
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          foreground: 'var(--secondary-foreground)',
        },
        muted: {
          DEFAULT: 'var(--muted)',
          foreground: 'var(--muted-foreground)',
        },
        accent: {
          DEFAULT: 'var(--accent)',
          foreground: 'var(--accent-foreground)',
        },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        // Bimo Yacht Luxury Color Palette
        jet: {
          DEFAULT: '#0B0B0B',
          50: '#1A1A1A',
          100: '#151515',
          200: '#121212',
          300: '#0F0F0F',
          400: '#0D0D0D',
          500: '#0B0B0B',
          600: '#090909',
          700: '#070707',
          800: '#050505',
          900: '#030303',
        },
        navy: {
          DEFAULT: '#0E1A2B',
          50: '#1E3A5F',
          100: '#1A3252',
          200: '#162A45',
          300: '#122238',
          400: '#0E1A2B',
          500: '#0A121E',
          600: '#060A11',
          700: '#020304',
        },
        gold: {
          DEFAULT: '#C9A24D',
          50: '#F5EDD8',
          100: '#F0E4C5',
          200: '#E6D39E',
          300: '#DCC277',
          400: '#D2B150',
          500: '#C9A24D',
          600: '#B08A3A',
          700: '#8A6C2E',
          800: '#644E21',
          900: '#3E3015',
        },
        white: '#FFFFFF',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-inter)', 'system-ui', 'serif'],
        arabic: ['var(--font-ibm-plex-arabic)', 'var(--font-tajawal)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-md': ['3rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'display-sm': ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'body-xl': ['1.25rem', { lineHeight: '1.6' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        'body-md': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
        '34': '8.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-up': 'fadeUp 0.6s ease-out',
        'slide-in': 'slideIn 0.6s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-gold': 'pulseGold 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(201, 162, 77, 0.4)' },
          '50%': { boxShadow: '0 0 0 10px rgba(201, 162, 77, 0)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-luxury': 'linear-gradient(135deg, #0B0B0B 0%, #0E1A2B 50%, #0B0B0B 100%)',
        'gradient-gold': 'linear-gradient(135deg, #C9A24D 0%, #E6D39E 50%, #C9A24D 100%)',
        'shimmer-gold': 'linear-gradient(90deg, transparent, rgba(201, 162, 77, 0.1), transparent)',
      },
      boxShadow: {
        'luxury': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        'luxury-lg': '0 35px 60px -15px rgba(0, 0, 0, 0.6)',
        'gold': '0 10px 40px -10px rgba(201, 162, 77, 0.3)',
        'gold-lg': '0 20px 60px -15px rgba(201, 162, 77, 0.4)',
        'inner-gold': 'inset 0 2px 4px 0 rgba(201, 162, 77, 0.1)',
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      },
    },
  },
  plugins: [
    // RTL/LTR Direction Variants
    plugin(function ({ addVariant, addUtilities }) {
      // Add rtl: and ltr: variants that work with dir attribute
      addVariant('rtl', '[dir="rtl"] &')
      addVariant('ltr', '[dir="ltr"] &')

      // Add logical property utilities for directional-agnostic layouts
      addUtilities({
        // Margin logical properties
        '.ms-auto': { 'margin-inline-start': 'auto' },
        '.me-auto': { 'margin-inline-end': 'auto' },
        '.ms-0': { 'margin-inline-start': '0' },
        '.me-0': { 'margin-inline-end': '0' },
        '.ms-1': { 'margin-inline-start': '0.25rem' },
        '.me-1': { 'margin-inline-end': '0.25rem' },
        '.ms-2': { 'margin-inline-start': '0.5rem' },
        '.me-2': { 'margin-inline-end': '0.5rem' },
        '.ms-3': { 'margin-inline-start': '0.75rem' },
        '.me-3': { 'margin-inline-end': '0.75rem' },
        '.ms-4': { 'margin-inline-start': '1rem' },
        '.me-4': { 'margin-inline-end': '1rem' },
        '.ms-5': { 'margin-inline-start': '1.25rem' },
        '.me-5': { 'margin-inline-end': '1.25rem' },
        '.ms-6': { 'margin-inline-start': '1.5rem' },
        '.me-6': { 'margin-inline-end': '1.5rem' },
        '.ms-8': { 'margin-inline-start': '2rem' },
        '.me-8': { 'margin-inline-end': '2rem' },

        // Padding logical properties
        '.ps-0': { 'padding-inline-start': '0' },
        '.pe-0': { 'padding-inline-end': '0' },
        '.ps-1': { 'padding-inline-start': '0.25rem' },
        '.pe-1': { 'padding-inline-end': '0.25rem' },
        '.ps-2': { 'padding-inline-start': '0.5rem' },
        '.pe-2': { 'padding-inline-end': '0.5rem' },
        '.ps-3': { 'padding-inline-start': '0.75rem' },
        '.pe-3': { 'padding-inline-end': '0.75rem' },
        '.ps-4': { 'padding-inline-start': '1rem' },
        '.pe-4': { 'padding-inline-end': '1rem' },
        '.ps-5': { 'padding-inline-start': '1.25rem' },
        '.pe-5': { 'padding-inline-end': '1.25rem' },
        '.ps-6': { 'padding-inline-start': '1.5rem' },
        '.pe-6': { 'padding-inline-end': '1.5rem' },
        '.ps-8': { 'padding-inline-start': '2rem' },
        '.pe-8': { 'padding-inline-end': '2rem' },

        // Text alignment logical properties
        '.text-start': { 'text-align': 'start' },
        '.text-end': { 'text-align': 'end' },

        // Border radius logical properties
        '.rounded-s': { 'border-start-start-radius': '0.25rem', 'border-end-start-radius': '0.25rem' },
        '.rounded-e': { 'border-start-end-radius': '0.25rem', 'border-end-end-radius': '0.25rem' },
        '.rounded-s-lg': { 'border-start-start-radius': '0.5rem', 'border-end-start-radius': '0.5rem' },
        '.rounded-e-lg': { 'border-start-end-radius': '0.5rem', 'border-end-end-radius': '0.5rem' },

        // Inset logical properties
        '.start-0': { 'inset-inline-start': '0' },
        '.end-0': { 'inset-inline-end': '0' },
        '.start-1': { 'inset-inline-start': '0.25rem' },
        '.end-1': { 'inset-inline-end': '0.25rem' },
        '.start-2': { 'inset-inline-start': '0.5rem' },
        '.end-2': { 'inset-inline-end': '0.5rem' },
        '.start-4': { 'inset-inline-start': '1rem' },
        '.end-4': { 'inset-inline-end': '1rem' },
        '.start-auto': { 'inset-inline-start': 'auto' },
        '.end-auto': { 'inset-inline-end': 'auto' },

        // Border logical properties
        '.border-s': { 'border-inline-start-width': '1px' },
        '.border-e': { 'border-inline-end-width': '1px' },
        '.border-s-0': { 'border-inline-start-width': '0' },
        '.border-e-0': { 'border-inline-end-width': '0' },
      })
    }),
  ],
}

export default config
