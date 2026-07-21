/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: "#0d0d0d",
        // طلایی اصیل پرچم آلمان
        germanGold: "#FFCC00",
        germanRed: "#DD0000",
      },
    },
  },
  plugins: [],
}