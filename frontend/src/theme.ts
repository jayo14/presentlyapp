/**
 * Material Design 3 Color Palette
 * Custom theme configuration for the Presently app
 */

export const colors = {
  // Primary colors
  primary: '#755b00',
  primaryContainer: '#ffca0d',
  primaryFixed: '#ffdf90',
  primaryFixedDim: '#f3c000',
  onPrimaryFixed: '#241a00',

  // Secondary colors
  secondary: '#5f5e61',
  secondaryFixedDim: '#c8c6c9',

  // Surface colors
  surface: '#fbf8fc',
  surfaceBright: '#fbf8fc',
  surfaceContainer: '#f0edf1',
  surfaceContainerLow: '#f5f3f6',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerHigh: '#eae7eb',
  surfaceContainerHighest: '#e4e1e5',
  surfaceVariant: '#e4e1e5',

  // Text colors
  onSurface: '#1b1b1e',
  onSurfaceVariant: '#4e4632',

  // Background and other colors
  background: '#fbf8fc',
  outlineVariant: '#d2c5ab',
  error: '#ba1a1a',
  inverseSurface: '#303033',
} as const

export const semanticTokens = {
  // Button styles
  buttonPrimary: {
    background: colors.primaryContainer,
    color: colors.onPrimaryFixed,
  },
  buttonSecondary: {
    background: colors.surface,
    color: colors.onSurface,
  },

  // Card styles
  cardBackground: colors.surfaceContainerLowest,
  cardText: colors.onSurface,
  cardBorder: colors.outlineVariant,

  // Input styles
  inputBackground: colors.surfaceContainerLow,
  inputBorder: colors.outlineVariant,
  inputText: colors.onSurface,

  // Text colors
  textPrimary: colors.onSurface,
  textSecondary: colors.onSurfaceVariant,

  // Shadow
  shadow: 'rgba(27, 27, 30, 0.07)',
}

export const themeStyles = `
  :root {
    --primary: ${colors.primary};
    --primary-container: ${colors.primaryContainer};
    --primary-fixed: ${colors.primaryFixed};
    --primary-fixed-dim: ${colors.primaryFixedDim};
    --on-primary-fixed: ${colors.onPrimaryFixed};
    
    --secondary: ${colors.secondary};
    --secondary-fixed-dim: ${colors.secondaryFixedDim};
    
    --surface: ${colors.surface};
    --surface-bright: ${colors.surfaceBright};
    --surface-container: ${colors.surfaceContainer};
    --surface-container-low: ${colors.surfaceContainerLow};
    --surface-container-lowest: ${colors.surfaceContainerLowest};
    --surface-container-high: ${colors.surfaceContainerHigh};
    --surface-container-highest: ${colors.surfaceContainerHighest};
    --surface-variant: ${colors.surfaceVariant};
    
    --on-surface: ${colors.onSurface};
    --on-surface-variant: ${colors.onSurfaceVariant};
    
    --background: ${colors.background};
    --outline-variant: ${colors.outlineVariant};
    --error: ${colors.error};
    --inverse-surface: ${colors.inverseSurface};
  }
` as const

export type Colors = typeof colors
export type SemanticTokens = typeof semanticTokens
