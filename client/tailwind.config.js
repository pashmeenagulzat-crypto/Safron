/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: {
          50:  '#fdf8ec',
          100: '#faefc9',
          200: '#f5da8f',
          300: '#f0c155',
          400: '#ecaa28',
          500: '#c8962a',
          600: '#a67420',
          700: '#7f561a',
          800: '#5e3d14',
          900: '#3d280d',
        },
        crimson: {
          50:  '#fdf2f2',
          500: '#8b1a1a',
          600: '#c0392b',
          700: '#96281e',
        },
        saffron: {
          bg:   '#fdf8f0',
          card: '#ffffff',
          dark: '#1a0e05',
          text: '#2c1810',
          muted:'#7a5c3e',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        gold: '0 4px 15px rgba(200,150,42,0.4)',
        'gold-lg': '0 8px 30px rgba(200,150,42,0.3)',
      },
      backgroundImage: {
        'grad-gold': 'linear-gradient(135deg, #c8962a 0%, #e8b84b 50%, #c8962a 100%)',
        'grad-hero': 'linear-gradient(160deg, #1a0e05 0%, #3d1f08 40%, #7a3a0e 100%)',
      },
      animation: {
        shimmer: 'shimmer 1.4s infinite',
        'bounce-in': 'bounceIn 0.6s ease',
        'slide-in-right': 'slideInRight 0.3s ease',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          to: { backgroundPosition: '-200% 0' },
        },
        bounceIn: {
          '0%':   { transform: 'scale(0)' },
          '60%':  { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)' },
        },
        slideInRight: {
          from: { transform: 'translateX(100%)', opacity: '0' },
          to:   { transform: 'translateX(0)',    opacity: '1' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0) rotate(-5deg)' },
          '50%':     { transform: 'translateY(-12px) rotate(5deg)' },
        },
      },
    },
  },
  plugins: [],
}

