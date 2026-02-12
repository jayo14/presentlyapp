import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react"

const config = defineConfig({
  theme: {
    tokens: {
      fonts: {
        body: { value: "'Outfit', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
        heading: { value: "'Outfit', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
      },
      colors: {
        // Dark mode colors
        "dark.bg": { value: "#010409" },
        "dark.surface": { value: "#09090b" },
        "dark.card": { value: "#18181b" },
        "dark.border": { value: "#27272a" },
        "dark.text": { value: "#f4f4f5" },
        "dark.text.secondary": { value: "#a1a1aa" },
        
        // Light mode colors
        "light.bg": { value: "#ffffff" },
        "light.surface": { value: "#f9fafb" },
        "light.card": { value: "#ffffff" },
        "light.border": { value: "#e5e7eb" },
        "light.text": { value: "#111827" },
        "light.text.secondary": { value: "#6b7280" },
        
        // Primary color (same for both modes)
        primary: { value: "#FFD700" },
        "primary.hover": { value: "#FFE44D" },
        "primary.text": { value: "#09090b" },
      },
      radii: {
        full: { value: "9999px" },
      },
    },
    semanticTokens: {
      colors: {
        // Background colors
        "bg.canvas": {
          value: { base: "light.bg", _dark: "dark.bg" },
        },
        "bg.surface": {
          value: { base: "light.surface", _dark: "dark.surface" },
        },
        "bg.card": {
          value: { base: "light.card", _dark: "dark.card" },
        },
        // Border colors
        "border.default": {
          value: { base: "light.border", _dark: "dark.border" },
        },
        // Text colors
        "text.primary": {
          value: { base: "light.text", _dark: "dark.text" },
        },
        "text.secondary": {
          value: { base: "light.text.secondary", _dark: "dark.text.secondary" },
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
      select: {
        base: {
          borderRadius: "full",
        },
      },
      nativeSelect: {
        base: {
          borderRadius: "full",
        },
      },
    },
  },
})

export const system = createSystem(defaultConfig, config)
