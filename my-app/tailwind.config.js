/** @type {import('tailwindcss').Config} */ 

module.exports = {
  darkMode:'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
   transitionTimingFunction: {
        'in-expo': 'cubic-bezier(0.95, 0.05, 0.795, 0.035)',
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
        'out-sine': 'cubic-bezier(0.45,0.05,0.55,0.95)'
      }
    },
  },
  plugins: [],
}
