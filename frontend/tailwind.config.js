/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f7fa',
          100: '#e6ebf2',
          500: '#2c5282',
          600: '#1f3d63',
          700: '#152e4d',
          900: '#0a1830',
        },
      },
    },
  },
  plugins: [],
};
