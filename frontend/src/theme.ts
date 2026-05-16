/**
 * Presently Design System v1.1 - Redesign Update
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
  surfaceContainer: '#F3F0EA',
  surfaceHighest: '#EBE7DF',

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
  cardBackground: colors.surfaceContainer,
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
  shadowPremium: '0 20px 50px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)',
}

export type Colors = typeof colors
export type SemanticTokens = typeof semanticTokens
