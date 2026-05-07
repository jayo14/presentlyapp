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
        sans: ['Inter', 'SF Pro Display', 'Geist', 'Outfit', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        headline: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xs': '8px',
        'sm': '16px',
        'md': '24px',
        'lg': '28px',
        'full': '999px',
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'base': '16px',
        'lg': '20px',
        'xl': '24px',
        '2xl': '32px',
        '3xl': '48px',
        '4xl': '64px',
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
        },
        'shimmer': {
          '100%': { transform: 'translateX(100%)' },
        }
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 4s ease-in-out infinite',
        'reveal': 'reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'shimmer': 'shimmer 2s infinite',
      },
      boxShadow: {
        'soft': '0px 2px 10px rgba(0,0,0,0.04)',
        'premium': '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
        'dock': '0 -4px 12px rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
}
