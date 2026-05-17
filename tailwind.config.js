/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './app-logic.js', './app-data.js'],
  theme: {
    extend: {
      colors: {
        brand: '#b45309',
        dark: '#7f1d1d'
      }
    }
  },
  plugins: [],
}
