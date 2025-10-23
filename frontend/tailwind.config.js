/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#10B981',
          DEFAULT: '#059669',
          dark: '#047857',
        },
        secondary: {
          light: '#D2691E',
          DEFAULT: '#8B4513',
          dark: '#654321',
        },
        accent: {
          DEFAULT: '#F59E0B',
        },
      },
    },
  },
  plugins: [],
}
