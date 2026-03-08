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
        sans: ['Outfit', 'Lexend', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#FFCA0D',
          dark: '#E5B50C',
          light: '#FFD43D',
          accent: '#FFF5CC',
        },
        // Primary semantic tokens
        'primary-hover': '#FFE44D',
        'primary-foreground': '#09090b',

        // Dark-mode primary variants
        'dark-primary': '#FFD700',
        'dark-primary-DEFAULT': '#FFD700',
        'dark-primary-hover': '#FFE44D',
        'dark-primary-foreground': '#09090b',

        // Light / dark background surfaces used in mobile layouts
        'light-background': '#F5F5F0',        // warm light background
        'light-surface': '#FFFFFF',           // cards / surfaces
        'dark-background': '#020617',         // very dark background
        'dark-surface': '#18181b',            // dark cards / dock surface

        // Additional background tiers for auth & inputs
        'background-primary': '#F5F5F0',
        'background-secondary': '#FAFAFA',
        'background-tertiary': '#E5E7EB',
        'dark-background-primary': '#010409',
        'dark-background-secondary': '#09090b',
        'dark-background-tertiary': '#18181b',

        // Generic surface + border tokens
        surface: '#FFFFFF',
        border: '#E5E7EB',

        // Border variants used in classnames
        'light-border': '#E5E7EB',
        'border-light': '#E0E0E0',
        'dark-border': '#27272a',
        'dark-border-light': '#3F3F46',

        // Text tokens (generic)
        'text-primary': '#111827',
        'text-secondary': '#6B7280',
        'text-tertiary': '#9CA3AF',

        // Text tokens for explicit dark variants
        'dark-text-primary': '#F4F4F5',
        'dark-text-secondary': '#A1A1AA',
        'dark-text-tertiary': '#71717A',

        // Light / dark text aliases used in student layouts
        'light-text': '#111827',
        'light-text-secondary': '#6B7280',
        'light-text-tertiary': '#9CA3AF',
        'dark-text': '#F4F4F5',

        // Status colors
        success: '#16A34A',
        'success-light': '#4ADE80',
        warning: '#F59E0B',
        'warning-light': '#FACC15',
        error: '#DC2626',
        'error-dark': '#F97373',
      },
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        'reveal': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 4s ease-in-out infinite',
        'reveal': 'reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }
    },
  },
  plugins: [],
}
