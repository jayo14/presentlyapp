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
      // Mobile optimization breakpoints
      screens: {
        'xs': '480px',
        'mobile': {'max': '767px'},  // < 768px
        'tablet': '768px',
        'desktop': '1024px',
      },
      // Touch target sizes for mobile
      spacing: {
        '44': '44px',  // Minimum touch target size
      },
      // Animation and transitions
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      keyframes: {
        'confetti': {
          '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
          '100%': { transform: 'translateY(-100vh) rotate(360deg)', opacity: '0' },
        },
        'checkmark': {
          '0%': { transform: 'scale(0) rotate(-45deg)' },
          '50%': { transform: 'scale(1.2) rotate(-45deg)' },
          '100%': { transform: 'scale(1) rotate(-45deg)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.95)', opacity: '1' },
          '50%': { transform: 'scale(1)', opacity: '0.7' },
          '100%': { transform: 'scale(0.95)', opacity: '1' },
        },
      },
      animation: {
        'confetti': 'confetti 3s ease-out forwards',
        'checkmark': 'checkmark 0.5s ease-out forwards',
        'pulse-ring': 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      colors: {
        // LIGHT MODE - Primary Brand Colors
        primary: {
          DEFAULT: '#B8860B',          // Dark Goldenrod - main brand
          light: '#DAA520',            // Goldenrod - lighter variant
          accent: '#FFD700',           // Gold - highlights, accents
          hover: '#A0780A',            // Darker goldenrod for hover states
          foreground: '#FFFFFF',       // White text on primary
        },
        // LIGHT MODE - Text Colors
        text: {
          primary: '#1A1A1A',          // Near black
          secondary: '#4A4A4A',        // Dark gray
          tertiary: '#7A7A7A',         // Medium gray
          disabled: '#B0B0B0',         // Light gray
        },
        // LIGHT MODE - Background Colors
        background: {
          DEFAULT: '#FFFFFF',          // Pure white
          primary: '#FFFFFF',          // Pure white
          secondary: '#FAFAFA',        // Off-white for cards
          tertiary: '#F5F5F5',         // Light gray for inputs
        },
        // LIGHT MODE - Border & Divider Colors
        border: {
          DEFAULT: '#E0E0E0',          // Very light gray
          light: '#E0E0E0',            // Very light gray
          medium: '#CCCCCC',           // Light gray
          heavy: '#B0B0B0',            // Medium gray
        },
        // Status & Feedback Colors (work in both modes)
        success: {
          DEFAULT: '#228B22',          // Forest Green
          dark: '#32CD32',             // Lime Green (for dark mode)
        },
        warning: {
          DEFAULT: '#FF8C00',          // Dark Orange
          dark: '#FFA500',             // Orange (for dark mode)
        },
        error: {
          DEFAULT: '#B22222',          // Firebrick
          dark: '#FF4444',             // Light Red (for dark mode)
        },
        info: {
          DEFAULT: '#1E90FF',          // Dodger Blue
          dark: '#6495ED',             // Cornflower Blue (for dark mode)
        },
        // DARK MODE - Override with 'dark:' prefix
        dark: {
          // Primary Brand Colors for Dark Mode
          primary: {
            DEFAULT: '#FFD700',        // Gold - brighter for dark mode
            light: '#FFE44D',          // Light Gold
            accent: '#FFEE99',         // Pale Gold
            hover: '#FFE44D',          // Light Gold for hover
            foreground: '#121212',     // Near black text on gold
          },
          // Text Colors for Dark Mode
          text: {
            primary: '#F5F5F5',        // Near white
            secondary: '#CCCCCC',      // Light gray
            tertiary: '#999999',       // Medium gray
            disabled: '#666666',       // Dark gray
          },
          // Background Colors for Dark Mode
          background: {
            primary: '#121212',        // Near black
            secondary: '#1E1E1E',      // Dark gray
            tertiary: '#2A2A2A',       // Medium dark gray
          },
          // Border & Divider Colors for Dark Mode
          border: {
            light: '#333333',          // Dark gray
            medium: '#444444',         // Medium gray
            heavy: '#555555',          // Light gray
          },
        },
        // Legacy support (backward compatible)
        surface: '#FFFFFF',
        foreground: '#1A1A1A',
        'text-primary': '#1A1A1A',
        'text-secondary': '#4A4A4A',
        'text-tertiary': '#7A7A7A',
        'text-muted': '#7A7A7A',
      }
    },
  },
  plugins: [],
}
