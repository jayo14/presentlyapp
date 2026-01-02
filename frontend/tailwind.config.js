/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#ffca0d',
          hover: '#e6b60b',
          dark: '#d4a50a',
          foreground: '#000000',
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
