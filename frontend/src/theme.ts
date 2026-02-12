import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        body: { value: "'Outfit', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
        heading: { value: "'Outfit', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
      },
      colors: {
        background: { value: "#010409" },
        foreground: { value: "#f4f4f5" },
        primary: { value: "#FFD700" },
        secondary: { value: "#09090b" },
        muted: { value: "#27272a" },
        accent: { value: "#27272a" },
        border: { value: "#27272a" },
      },
      radii: {
        full: { value: "9999px" },
      },
    },
    semanticTokens: {
      colors: {
        // Background colors
        "bg.canvas": {
          value: { base: "#010409", _dark: "#010409" },
        },
        "bg.surface": {
          value: { base: "#09090b", _dark: "#09090b" },
        },
        // Primary colors
        "colorPalette.solid": {
          value: { base: "#FFD700", _dark: "#FFD700" },
        },
        "colorPalette.contrast": {
          value: { base: "#09090b", _dark: "#09090b" },
        },
      },
    },
    recipes: {
      button: {
        base: {
          borderRadius: "full",
          fontWeight: "medium",
          transition: "all 0.2s",
        },
      },
      input: {
        base: {
          borderRadius: "full",
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
