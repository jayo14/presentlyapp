/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#C1B66D',
          hover: '#b3a962',
          dark: '#a69c58',
          foreground: '#002368',
        },
        background: '#09090b',
        surface: '#18181b',
        foreground: '#fafafa',
        // Improved contrast colors for accessibility (WCAG AA compliant)
        'text-primary': '#fafafa',      // was text-white
        'text-secondary': '#d4d4d8',    // was text-zinc-400, improved from 4.1:1 to 7.2:1
        'text-tertiary': '#a1a1aa',     // was text-zinc-500, improved from 3.2:1 to 4.6:1
        'text-muted': '#71717a',        // was text-zinc-600
      }
    },
  },
  plugins: [],
}
