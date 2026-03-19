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
        headline: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Material Design 3 Color Palette
        primary: '#755b00',
        'primary-container': '#ffca0d',
        'primary-fixed': '#ffdf90',
        'primary-fixed-dim': '#f3c000',
        'on-primary-fixed': '#241a00',
        
        secondary: '#5f5e61',
        'secondary-fixed-dim': '#c8c6c9',
        
        surface: '#fbf8fc',
        'surface-bright': '#fbf8fc',
        'surface-container': '#f0edf1',
        'surface-container-low': '#f5f3f6',
        'surface-container-lowest': '#ffffff',
        'surface-container-high': '#eae7eb',
        'surface-container-highest': '#e4e1e5',
        'surface-variant': '#e4e1e5',
        
        'on-surface': '#1b1b1e',
        'on-surface-variant': '#4e4632',
        background: '#fbf8fc',
        'outline-variant': '#d2c5ab',
        error: '#ba1a1a',
        'inverse-surface': '#303033',
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
