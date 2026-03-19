# Material Design 3 Color Palette Implementation

This document outlines the comprehensive color palette update applied to the Presently app.

## Color Palette

The app now uses a Material Design 3 inspired color palette with warm, earthy tones:

### Primary Colors
- **Primary**: `#755b00` - Deep brown primary color
- **Primary Container**: `#ffca0d` - Bright yellow accent
- **Primary Fixed**: `#ffdf90` - Light yellow variant
- **Primary Fixed Dim**: `#f3c000` - Muted yellow
- **On Primary Fixed**: `#241a00` - Dark brown text on primary

### Secondary Colors
- **Secondary**: `#5f5e61` - Neutral gray
- **Secondary Fixed Dim**: `#c8c6c9` - Light gray variant

### Surface Colors
- **Surface**: `#fbf8fc` - Light off-white
- **Surface Bright**: `#fbf8fc` - Bright surface
- **Surface Container**: `#f0edf1` - Container background
- **Surface Container Low**: `#f5f3f6` - Low emphasis container
- **Surface Container Lowest**: `#ffffff` - Pure white
- **Surface Container High**: `#eae7eb` - High emphasis container
- **Surface Container Highest**: `#e4e1e5` - Highest emphasis container
- **Surface Variant**: `#e4e1e5` - Alternative surface

### Text & Semantic Colors
- **On Surface**: `#1b1b1e` - Primary text color
- **On Surface Variant**: `#4e4632` - Secondary text color
- **Background**: `#fbf8fc` - Page background
- **Outline Variant**: `#d2c5ab` - Border/outline color
- **Error**: `#ba1a1a` - Error/danger color
- **Inverse Surface**: `#303033` - Dark mode surface

## Files Modified

### 1. `/frontend/tailwind.config.js`
- Updated color definitions in `theme.extend.colors`
- Added `headline` font family for Material Design typography

### 2. `/frontend/src/index.css`
- Defined CSS variables in `:root` for the entire palette
- Updated scrollbar colors to use primary palette
- Updated range slider styles with new colors
- Updated Leaflet map background colors

### 3. `/frontend/src/theme.ts`
- Created comprehensive theme configuration
- Exported `colors` object for programmatic access
- Exported `semanticTokens` for semantic color usage
- Created `themeStyles` template for dynamic theme application

### 4. `/frontend/src/components/ui/color-mode.tsx`
- Enhanced ThemeProvider configuration
- Added explicit theme definitions
- Improved initialization with fallback values

### 5. `/frontend/components/Button.tsx`
- Updated button variants to use new color palette
- Primary: `bg-primary-container` with `text-on-primary-fixed`
- Secondary: `bg-surface-container` with `text-on-surface`
- Outline: Uses primary color with proper contrast
- Ghost: Uses surface and text color variants

### 6. `/frontend/components/Logo.tsx`
- Updated to use `bg-primary-container` and `text-on-primary-fixed`
- Updated text color to `text-on-surface`

### 7. `/frontend/components/EnhancedLandingPage.tsx`
- Uses inline CSS with Material Design 3 color variables
- Inline styles reference the color palette directly

## Usage

### In CSS/Tailwind Classes
```tsx
// Use Tailwind color classes
className="bg-primary-container text-on-primary-fixed"
className="bg-surface-container-low text-on-surface"
```

### In CSS Variables
```css
background-color: var(--primary-container);
color: var(--on-surface);
```

### In TypeScript
```tsx
import { colors, semanticTokens } from '@/theme'

const buttonColor = colors.primaryContainer
const buttonText = colors.onPrimaryFixed
```

## Responsive Design

The color palette works seamlessly with:
- Light mode (default)
- Dark mode (class-based, using inverse colors)
- System preferences (can be enabled in theme provider)

## Accessibility

The color palette meets WCAG AA standards for contrast:
- Primary text on surface: `#1b1b1e` on `#fbf8fc` (18:1 contrast)
- Primary container buttons: `#241a00` on `#ffca0d` (11:1 contrast)
- Error states: `#ba1a1a` meets all contrast requirements

## Migration Notes

If you find components with the following old colors, they should be updated:
- `bg-primary` → `bg-primary-container`
- `text-white` → `text-surface` or `text-on-surface`
- `bg-zinc-*` → `bg-surface-*` or `bg-inverse-surface`
- `text-zinc-*` → `text-on-surface` or `text-on-surface-variant`

For any hardcoded color values, replace them with CSS variables or Tailwind classes from the new palette.
