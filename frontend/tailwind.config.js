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
        nimbus: ['Tan Nimbus', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        background: "var(--background)",
        surface: "var(--surface)",
        surfaceContainer: "var(--surface-container)",
        surfaceLow: "var(--surface-container-low)",
        surfaceHigh: "var(--surface-container-high)",
        "surface-highest": "var(--surface-container-highest)",
  
        text: "var(--on-surface)",
        textMuted: "var(--on-surface-variant)",
  
        primary: "var(--primary)",
        "primary-container": "var(--primary-container)",
        primaryContainer: "var(--primary-container)",
  
        outline: "var(--outline-variant)",
        foreground: "var(--foreground)",
        error: "var(--error)",
        success: "var(--success)",
        warning: "var(--warning)",

        // Brand colors
        sungold: "#F5C518",
        "presently-black": "#0D0D0D",
        "soft-cream": "#FDF9F0",
        paper: "#F5F5F5",
      },
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.2, 0.8, 0.2, 1)',
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
