/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        khet: {
          50: '#f6f7f4',
          100: '#eaece4',
          200: '#d5d9cb',
          300: '#b5bca7',
          400: '#939d82',
          500: '#768164',
          600: '#5d674f',
          700: '#4a5240',
          800: '#3d4436',
          900: '#1a1f16',
        },
        farm: {
          green: '#15803d',
          light: '#4ade80',
          amber: '#b45309',
          wheat: '#eab308',
          cream: '#faf8f4',
          soil: '#1e261a',
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', '"Noto Sans Bengali"', 'sans-serif'],
        bangla: ['"Noto Sans Bengali"', '"DM Sans"', 'sans-serif'],
      },
      screens: {
        xs: '420px',
      },
    },
  },
  plugins: [],
};
