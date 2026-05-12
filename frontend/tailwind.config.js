/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Sora"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: '#0f1117',
          50: '#f5f6f8',
          100: '#e8eaef',
          200: '#c9cdd8',
          300: '#9aa0b4',
          400: '#636d87',
          500: '#3d4559',
          600: '#232b3e',
          700: '#161c2c',
          800: '#0f1117',
          900: '#080b10',
        },
        brand: {
          DEFAULT: '#5b6af7',
          50: '#eef0ff',
          100: '#d8dcff',
          200: '#b3bbff',
          300: '#8590ff',
          400: '#5b6af7',
          500: '#3d4fe8',
          600: '#2d3cd4',
          700: '#2431ac',
          800: '#1e298a',
          900: '#1a246d',
        },
        success: '#22c55e',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease both',
        'shimmer': 'shimmer 1.5s infinite',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
