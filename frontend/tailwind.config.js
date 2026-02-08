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
          DEFAULT: '#FFC107',          // Updated to bright yellow/gold from designs
          hover: '#FFB300',
          dark: '#FFA000',
          foreground: '#1a1a1a',
          light: '#FFECB3',            // Light yellow accent
        },
        // Light mode colors (main theme from designs)
        light: {
          background: '#F5F5F0',       // Cream/beige background
          surface: '#FFFFFF',          // White surfaces
          card: '#FAFAF8',             // Slightly off-white for cards
          text: '#1a1a1a',             // Dark text
          'text-secondary': '#6B6B6B', // Secondary text
          'text-tertiary': '#9E9E9E',  // Tertiary text/muted
          border: '#E0E0E0',           // Light borders
        },
        // Dark mode colors (keep existing for dark mode)
        dark: {
          background: '#09090b',
          surface: '#18181b',
          text: '#fafafa',
          'text-secondary': '#d4d4d8',
          'text-tertiary': '#a1a1aa',
          border: '#27272a',
        },
        // Legacy support (backward compatible)
        background: '#F5F5F0',
        surface: '#FFFFFF',
        foreground: '#1a1a1a',
        'text-primary': '#1a1a1a',
        'text-secondary': '#6B6B6B',
        'text-tertiary': '#9E9E9E',
        'text-muted': '#9E9E9E',
      }
    },
  },
  plugins: [],
}
