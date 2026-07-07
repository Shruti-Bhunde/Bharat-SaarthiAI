/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          blue: {
            50: '#f0f4f9',
            100: '#dbeafe',
            600: '#1d4ed8',
            700: '#1e40af',
            800: '#1e3a8a',
            900: '#0f172a'
          },
          saffron: {
            50: '#fff7ed',
            500: '#f97316',
            600: '#ea580c',
            700: '#c2410c',
            800: '#9a3412'
          },
          green: {
            50: '#f0fdf4',
            600: '#16a34a',
            700: '#15803d',
            800: '#166534'
          }
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
