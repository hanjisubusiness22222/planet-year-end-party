/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivy: {
          950: '#081a14',
          900: '#0d281e',
          800: '#16382c',
          700: '#1e4a3b',
          600: '#28624f',
        },
        navy: {
          950: '#09101f',
          900: '#101c36',
          800: '#1b2a4a',
          700: '#263960',
        },
        bordeaux: {
          950: '#3b0b17',
          900: '#5c1324',
          800: '#741b2d',
          700: '#91273c',
        },
        gold: {
          100: '#faf2de',
          300: '#e8cb85',
          500: '#d4af37',
          600: '#c5a059',
          700: '#a8823b',
          800: '#8a6828',
        },
        cream: {
          50: '#fdfbf7',
          100: '#f9f6f0',
          200: '#f3efe6',
          300: '#e8e1d5',
          400: '#d9cfbe',
        },
        tortoise: '#3d2314',
      },
      fontFamily: {
        magic: ['"Cinzel Decorative"', 'serif'],
        crest: ['Cinzel', 'serif'],
        display: ['"Playfair Display"', 'serif'],
        classic: ['"Cormorant Garamond"', '"Noto Serif KR"', 'serif'],
        typewriter: ['"Courier Prime"', 'monospace'],
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'crest': '0 0 25px rgba(212, 175, 55, 0.25)',
        'wax': '0 8px 24px rgba(92, 19, 36, 0.45)',
        'letter': '0 20px 40px rgba(13, 40, 30, 0.3)',
      },
    },
  },
  plugins: [],
};
