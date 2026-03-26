import React, { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

type ThemeProviderState = {
  theme: Theme
  resolvedTheme: 'dark' | 'light'
  setTheme: (theme: Theme) => void
}

const STORAGE_KEY = 'presently-theme'

const initialState: ThemeProviderState = {
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => null,
}

const ThemeContext = createContext<ThemeProviderState>(initialState)

function getSystemTheme(): 'dark' | 'light' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme): 'dark' | 'light' {
  const resolved = theme === 'system' ? getSystemTheme() : theme
  const root = document.documentElement
  root.classList.remove('light', 'dark')
  root.classList.add(resolved)
  return resolved
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  ...props
}: {
  children: React.ReactNode
  defaultTheme?: Theme
}) {
  const [theme, setThemeState] = useState<Theme>(
    () => (localStorage.getItem(STORAGE_KEY) as Theme) || defaultTheme
  )
  const [resolvedTheme, setResolvedTheme] = useState<'dark' | 'light'>(() => {
    const saved = (localStorage.getItem(STORAGE_KEY) as Theme) || defaultTheme
    return saved === 'system' ? getSystemTheme() : saved
  })

  // Apply on mount and theme change
  useEffect(() => {
    const resolved = applyTheme(theme)
    setResolvedTheme(resolved)
  }, [theme])

  // React to system theme changes
  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      const resolved = applyTheme('system')
      setResolvedTheme(resolved)
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  // Listen for theme changes from other components (Settings, Layout)
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        const newTheme = e.newValue as Theme
        setThemeState(newTheme)
        const resolved = applyTheme(newTheme)
        setResolvedTheme(resolved)
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem(STORAGE_KEY, newTheme)
    setThemeState(newTheme)
    const resolved = applyTheme(newTheme)
    setResolvedTheme(resolved)
    // Notify other tabs/components
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEY,
      newValue: newTheme,
    }))
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }} {...props}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined)
    throw new Error('useTheme must be used within a ThemeProvider')
  return context
}
