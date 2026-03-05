/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}"
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg': '#0f172a',
        'dark-surface': '#1e293b',
        'dark-border': '#334155',
        'primary': '#3b82f6',
        'primary-dark': '#1e40af',
        'primary-light': '#60a5fa',
        'success': '#10b981',
        'warning': '#f59e0b',
        'danger': '#ef4444'
      }
    }
  },
  plugins: []
}
