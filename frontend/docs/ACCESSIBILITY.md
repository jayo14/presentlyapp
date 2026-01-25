# Accessibility Guidelines for Presently

## Color Contrast Requirements

### WCAG AA Compliance (4.5:1 for normal text, 3:1 for large text)

**Approved Color Combinations:**

#### Dark Theme (Primary)
- Background: `#09090b` (zinc-950)
- Surface: `#18181b` (zinc-900)

**Text on Dark Backgrounds:**
- Primary text: `#fafafa` (zinc-50) - Ratio: 16.1:1 ✓✓
- Secondary text: `#d4d4d8` (zinc-300) - Ratio: 7.2:1 ✓✓
- Tertiary text: `#a1a1aa` (zinc-400) - Ratio: 4.6:1 ✓
- Muted text: `#71717a` (zinc-500) - Ratio: 3.2:1 (use for large text only 18px+)

**Replace These Problematic Combinations:**
❌ `text-zinc-400` on `bg-zinc-900` → ✓ Use `text-zinc-300`
❌ `text-zinc-500` on `bg-zinc-800` → ✓ Use `text-zinc-400` 
❌ `text-zinc-600` on `bg-zinc-900` → ✓ Use `text-zinc-500`

## Button Accessibility

### All buttons must have accessible names

```tsx
// ❌ BAD - Icon-only button without label
<button onClick={handleClick}>
  <XIcon />
</button>

// ✓ GOOD - With aria-label
<button onClick={handleClick} aria-label="Close dialog">
  <XIcon />
</button>

// ✓ BETTER - With visible text
<button onClick={handleClick}>
  <XIcon />
  <span>Close</span>
</button>
```

## Heading Hierarchy

### Must follow sequential order (h1 → h2 → h3)

```tsx
// ❌ BAD - Skipping levels
<h1>Main Title</h1>
<h3>Subsection</h3>  // Skipped h2

// ✓ GOOD - Sequential
<h1>Main Title</h1>
<h2>Section</h2>
<h3>Subsection</h3>
```

## Skip Links

### Must be focusable for keyboard users

Already implemented in index.html:
```html
<a href="#main-content" class="skip-to-content">Skip to main content</a>
```

Ensure main content areas have proper IDs:
```tsx
<main id="main-content">
  {/* Content here */}
</main>
```

## Focus Management

### All interactive elements must be keyboard accessible

```tsx
// Ensure proper focus styles
className="focus:outline-none focus:ring-2 focus:ring-primary"
```

## ARIA Labels

### Use semantic HTML first, ARIA as enhancement

```tsx
// Prefer semantic HTML
<nav aria-label="Main navigation">
<main aria-label="Main content">
<aside aria-label="Sidebar">

// Use ARIA for dynamic content
<div role="alert" aria-live="polite">
  Error message here
</div>
```

## Form Accessibility

```tsx
// Always associate labels with inputs
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// Provide error messages
<input 
  id="email" 
  aria-invalid={hasError}
  aria-describedby={hasError ? "email-error" : undefined}
/>
{hasError && <span id="email-error">Please enter a valid email</span>}
```

## Testing Checklist

- [ ] All images have alt text
- [ ] All buttons have accessible names  
- [ ] Color contrast meets WCAG AA (4.5:1)
- [ ] Keyboard navigation works
- [ ] Focus indicators are visible
- [ ] Headings follow hierarchy
- [ ] Skip links are implemented
- [ ] Forms have proper labels
- [ ] Dynamic content uses ARIA live regions
- [ ] Tested with screen reader

## Tools

- Chrome Lighthouse
- axe DevTools
- WAVE (Web Accessibility Evaluation Tool)
- NVDA/JAWS screen readers
