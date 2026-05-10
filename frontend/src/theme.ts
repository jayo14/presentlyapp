/**
 * Presently Design System v1.0
 * Custom theme configuration for the rebranded Presently app
 */

export const colors = {
  // Brand Colors
  sungold: '#F5C518',
  presentlyBlack: '#0D0D0D',

  // Secondary / Semantic
  paleHoney: '#FBF6E9',
  warmIvory: '#FAF5EB',
  mossGreen: '#4A7C59',
  softCoral: '#E87461',
  skyTeal: '#2E9CCA',

  // UI Surfaces (Light Mode)
  background: '#FFFFFF',
  surface: '#F9F7F3',
  surfaceCard: '#FFFFFF',

  // Text
  onSurface: '#0D0D0D',
  onSurfaceVariant: '#64748B',

  // Status (Matches semantic rules in design.md)
  success: '#4A7C59',
  error: '#E87461',
  info: '#2E9CCA',
  warning: '#F5C518',
} as const

export const semanticTokens = {
  // Button styles
  buttonPrimary: {
    background: colors.sungold,
    color: colors.presentlyBlack,
  },
  buttonSecondary: {
    background: colors.presentlyBlack,
    color: '#FFFFFF',
  },

  // Card styles
  cardBackground: colors.surfaceCard,
  cardText: colors.onSurface,
  cardBorder: '#E2E8F0',

  // Input styles
  inputBackground: '#FFFFFF',
  inputBorder: '#CBD5E1',
  inputText: colors.onSurface,

  // Text colors
  textPrimary: colors.onSurface,
  textSecondary: colors.onSurfaceVariant,

  // Shadows
  shadowSm: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
  shadowMd: '0 4px 16px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.06)',
  shadowLg: '0 16px 40px rgba(0,0,0,0.14), 0 4px 16px rgba(0,0,0,0.08)',
  shadowGold: '0 8px 32px rgba(245,197,24,0.22)',
}

export const themeStyles = `
  :root {
    --sungold: ${colors.sungold};
    --presently-black: ${colors.presentlyBlack};
    --pale-honey: ${colors.paleHoney};
    --warm-ivory: ${colors.warmIvory};
    --moss-green: ${colors.mossGreen};
    --soft-coral: ${colors.softCoral};
    --sky-teal: ${colors.skyTeal};
    
    --background: ${colors.background};
    --surface: ${colors.surface};
    --on-surface: ${colors.onSurface};
    --on-surface-variant: ${colors.onSurfaceVariant};
    
    --primary: ${colors.sungold};
    --on-primary: ${colors.presentlyBlack};
    --outline: #E2E8F0;
    --error: ${colors.error};
    --success: ${colors.success};

    --radius-sm: 4px;
    --radius-md: 12px;
    --radius-lg: 20px;
    --radius-xl: 24px;
    --radius-full: 9999px;
  }

  .dark {
    --background: #0D0D0D;
    --surface: #141414;
    --on-surface: #FFFFFF;
    --on-surface-variant: #94A3B8;
    --outline: #2A2A2A;
  }
` as const

export type Colors = typeof colors
export type SemanticTokens = typeof semanticTokens
