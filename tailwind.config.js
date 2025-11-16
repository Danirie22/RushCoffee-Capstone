/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
        display: ['Poppins', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f4edea',
          100: '#e9dcd5',
          200: '#d3b9aa',
          300: '#bd9580',
          400: '#a77255',
          500: '#914f2b',
          600: '#773e20',
          700: '#592200',
          800: '#4d1e00',
          900: '#401a00',
        },
        coffee: {
          50: '#faf6f4',
          100: '#f3e9e4',
          600: '#8d6e63',
          800: '#2a1f1a',
          900: '#1e1612',
        }
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.8s ease-out forwards',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'float-delay': 'float 7s ease-in-out infinite -1s',
        'steam-1': 'steam 3s ease-out infinite',
        'steam-2': 'steam 3s ease-out infinite 0.5s',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'steam': {
          '0%': { transform: 'translateY(10px) scaleX(1)', opacity: '0' },
          '15%': { opacity: '0.4' },
          '50%': { transform: 'translateY(-10px) scaleX(1.2)', opacity: '0.8' },
          '100%': { transform: 'translateY(-30px) scaleX(1)', opacity: '0' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        }
      }
    }
  },
  plugins: [],
}