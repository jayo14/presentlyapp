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
        sans: ['Outfit', 'Lexend', 'system-ui', 'sans-serif'],
        headline: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        "surface-container-low": "var(--surface-container-low)",
        "surface-container-high": "var(--surface-container-high)",
        "surface-container-highest": "var(--surface-container-highest)",
        "presently-black": "#231F0F",
        "sungold": "#F9C406",
  
        text: "var(--on-surface)",
        textMuted: "var(--on-surface-variant)",
  
        primary: "var(--primary)",
        "primary-container": "var(--primary-container)",
        "on-primary-fixed": "var(--on-primary-fixed)",
  
        outline: "var(--outline)",
        success: "var(--success)",
        error: "var(--error)",
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(1.1)' },
        }
      },
      animation: {
        'pulse-glow': 'pulse-glow 8s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
