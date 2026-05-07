/**
 * Presently Modern Native Theme
 * Custom theme configuration for the redesigned Presently app
 */

export const colors = {
  // Primary colors (Gold/Yellow)
  primary: '#D4AF37',
  primaryContainer: '#D4AF37',
  primaryFixed: '#E5C158',
  primaryFixedDim: '#D4AF37',
  onPrimaryFixed: '#091723',

  // Secondary colors (Dark/Slate/Navy)
  secondary: '#091723',
  secondaryFixedDim: '#1B2936',

  // Surface colors (Light Mode)
  surface: '#FFFFFF',
  surfaceBright: '#FFFFFF',
  surfaceContainer: '#F7F9FC',
  surfaceContainerLow: '#F1F5F9',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerHigh: '#E2E8F0',
  surfaceContainerHighest: '#CBD5E1',
  surfaceVariant: '#EEF2F7',

  // Text colors
  onSurface: '#091723',
  onSurfaceVariant: '#64748B',

  // Background and other colors
  background: '#F7F9FC',
  outlineVariant: '#E2E8F0',
  error: '#FF4F40',
  success: '#14B86A',
  inverseSurface: '#091723',
} as const

export const semanticTokens = {
  // Button styles
  buttonPrimary: {
    background: colors.primary,
    color: colors.onPrimaryFixed,
  },
  buttonSecondary: {
    background: colors.surfaceVariant,
    color: colors.onSurface,
  },

  // Card styles
  cardBackground: colors.surface,
  cardText: colors.onSurface,
  cardBorder: colors.outlineVariant,

  // Input styles
  inputBackground: colors.surfaceVariant,
  inputBorder: colors.outlineVariant,
  inputText: colors.onSurface,

  // Text colors
  textPrimary: colors.onSurface,
  textSecondary: colors.onSurfaceVariant,

  // Shadow
  shadow: 'rgba(9, 23, 35, 0.04)',
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
    --success: ${colors.success};
    --inverse-surface: ${colors.inverseSurface};

    --radius-sm: 8px;
    --radius-md: 16px;
    --radius-lg: 24px;
    --radius-xl: 28px;
    --radius-full: 999px;
  }

  .dark {
    --background: #091723;
    --surface: #121E2A;
    --surface-container: #1B2936;
    --on-surface: #F7F9FC;
    --on-surface-variant: #94A3B8;
    --outline-variant: #1E293B;
  }
` as const

export type Colors = typeof colors
export type SemanticTokens = typeof semanticTokens
