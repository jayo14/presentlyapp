import { ThemeProvider, useTheme } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import * as React from "react"
import { Moon, Sun } from "lucide-react"

export interface ColorModeProviderProps extends ThemeProviderProps {}

// Define theme attribute values for next-themes
export const THEME_LIGHT = "light"
export const THEME_DARK = "dark"
export const THEME_SYSTEM = "system"

export function ColorModeProvider(props: ColorModeProviderProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
      storageKey="theme-preference"
      themes={[THEME_LIGHT, THEME_DARK]}
      {...props}
    />
  )
}

export type ColorMode = "light" | "dark"

export interface UseColorModeReturn {
  colorMode: ColorMode
  setColorMode: (colorMode: ColorMode) => void
  toggleColorMode: () => void
}

export function useColorMode(): UseColorModeReturn {
  const { resolvedTheme, setTheme, forcedTheme } = useTheme()
  const colorMode = (forcedTheme || resolvedTheme || "light") as ColorMode
  const toggleColorMode = () => {
    setTheme(colorMode === "dark" ? "light" : "dark")
  }
  return {
    colorMode,
    setColorMode: setTheme,
    toggleColorMode,
  }
}

export function useColorModeValue<T>(light: T, dark: T) {
  const { colorMode } = useColorMode()
  return colorMode === "dark" ? dark : light
}

export function ColorModeIcon() {
  const { colorMode } = useColorMode()
  return colorMode === "dark" ? <Moon size={18} /> : <Sun size={18} />
}

interface ColorModeButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const ColorModeButton = React.forwardRef<
  HTMLButtonElement,
  ColorModeButtonProps
>(function ColorModeButton(props, ref) {
  const { colorMode, toggleColorMode } = useColorMode()
  return (
    <button
      onClick={toggleColorMode}
      aria-label="Toggle color mode"
      ref={ref}
      className="inline-flex items-center justify-center rounded-md p-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      {...props}
    >
      {colorMode === "dark" ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  )
})
