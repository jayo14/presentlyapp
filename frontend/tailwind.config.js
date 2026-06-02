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
    screens: {
      'xs': '480px',
      'mobile': { 'max': '767px' },
      'tablet': '768px',
      'md': '768px',
      'desktop': '1024px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      fontFamily: {
        sans: ['Outfit', 'Lexend', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        headline: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '44': '44px',
      },
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        surfaceContainer: "var(--surface-container)",
        surfaceLow: "var(--surface-container-low)",
        surfaceHigh: "var(--surface-container-high)",
        surfaceHighest: "var(--surface-container-highest)",
  
        text: "var(--on-surface)",
        textMuted: "var(--on-surface-variant)",
  
        primary: "var(--primary)",
        primaryContainer: "var(--primary-container)",
  
        outline: "var(--outline-variant)",
        foreground: "var(--foreground)",
        error: "var(--error)",
        success: "var(--success)",
        warning: "var(--warning)",

        // Brand Colors
        'sungold': '#F9C406',
        'presently-black': '#231F0F',
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
