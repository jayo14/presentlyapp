/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./App.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./screens/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#C1B66D',
          foreground: '#002368',
        },
        secondary: {
          DEFAULT: '#002368',
          foreground: '#FFFFFF',
        },
        background: '#09090b',
        surface: '#18181b',
        foreground: '#fafafa',
        'text-primary': '#fafafa',
        'text-secondary': '#d4d4d8',
        'text-tertiary': '#a1a1aa',
        'text-muted': '#71717a',
        border: '#27272a',
        input: '#27272a',
        destructive: '#ef4444',
      },
    },
  },
  plugins: [],
}