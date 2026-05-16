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
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        nimbus: ['"Tan Nimbus"', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },

      borderRadius: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '20px',
        'xl': '24px',
        '2xl': '32px',
        '3xl': '40px',
        'full': '9999px',
      },
      spacing: {
        '4': '4px',
        '8': '8px',
        '12': '12px',
        '16': '16px',
        '20': '20px',
        '24': '24px',
        '32': '32px',
        '40': '40px',
        '48': '48px',
        '64': '64px',
        '80': '80px',
        '96': '96px',
        '128': '128px',
      },
        colors: {
          sungold: '#F5C518',
          'presently-black': '#0D0D0D',
          'pale-honey': '#FBF6E9',
          'warm-ivory': '#FAF5EB',
        'moss-green': '#4A7C59',
        'soft-coral': '#E87461',
        'sky-teal': '#2E9CCA',

          background: "var(--background)",
          surface: "var(--surface)",
          surfaceContainer: "var(--surface-container)",
          'surface-container': "var(--surface-container)",
          'surface-variant': "var(--surface-variant)",
          'surface-highest': "var(--surface-highest)",

          text: "var(--on-surface)",
          textMuted: "var(--on-surface-variant)",
          'on-surface': "var(--on-surface)",
          'on-surface-variant': "var(--on-surface-variant)",
  
          primary: "var(--primary)",
          'primary-foreground': "var(--on-primary)",
          'on-primary-fixed': "var(--on-primary-fixed)",
  
          outline: "var(--outline)",
          'outline-variant': "var(--outline-variant)",
          error: "var(--error)",
          success: "var(--success)",
        warning: "var(--warning)",
      },
      transitionTimingFunction: {
        'premium': 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.02)' },
        },
        'reveal': {
          '0%': { transform: 'translateY(24px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 4s ease-in-out infinite',
        'reveal': 'reveal 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      boxShadow: {
        'sm': '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        'md': '0 4px 16px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)',
        'lg': '0 16px 40px rgba(0,0,0,0.14), 0 4px 16px rgba(0,0,0,0.08)',
        'gold': '0 8px 32px rgba(245,197,24,0.22)',
        'premium': '0 20px 50px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)',
      }
    },
  },
  plugins: [],
}
