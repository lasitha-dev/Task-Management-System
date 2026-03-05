/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        'slate': {
          '950': '#0d1117',
          '900': '#0f172a',
          '800': '#1a2035',
          '700': '#1e293b',
          '600': '#334155',
          '400': '#94a3b8',
          '300': '#cbd5e1'
        },
        'blue': {
          '500': '#3b82f6'
        }
      }
    }
  },
  plugins: []
}
