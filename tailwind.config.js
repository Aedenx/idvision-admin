/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // <-- WAJIB ADA AGAR CLASS 'dark' DI HTML BERFUNGSI
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
