# Dashboard Sidebar System - Implementation Guide

## Overview

The dashboard sidebar system uses shadcn/ui components for a modern, theme-adaptive, and role-based navigation experience. The system supports three main roles:

- **Student/ClassRep**: Attendance tracking, course management, schedule
- **Lecturer**: Session management, attendance reports, analytics
- **Admin**: System control, user management, institutional oversight

## Architecture

### Components

#### 1. **Sidebar Components** (`src/components/ui/sidebar.tsx`)
Core shadcn-style sidebar components:
- `Sidebar` - Main container
- `SidebarHeader` - Logo and branding area
- `SidebarContent` - Navigation menu area
- `SidebarFooter` - User profile and logout
- `SidebarMenu/MenuItem` - Navigation items
- `SidebarMenuButton` - Individual nav buttons with active states
- `SidebarMenuSub` - Nested submenu items
- `SidebarSeparator` - Visual dividers

**Features:**
- Theme-adaptive (light/dark mode support)
- Active state indicators
- Badge support for notifications
- Submenu expansion/collapse
- Smooth transitions

#### 2. **Navigation Configuration** (`utils/navigation.ts`)
Role-based navigation structure:
- Defines nav items for each role
- Supports nested menus for grouping
- Badge support for alerts/counts
- Dynamic filtering by role

#### 3. **DashboardSidebar Component** (`components/Dashboard/DashboardSidebar.tsx`)
Main sidebar wrapper that:
- Renders role-specific navigation
- Handles active state tracking
- Manages menu expansion
- Shows user profile and logout
- Integrates with routing

#### 4. **Layout Integration** (`components/Layout.tsx`)
Updated to:
- Import and use DashboardSidebar
- Add proper margin for sidebar (`md:ml-60 lg:ml-72`)
- Use theme tokens instead of hard-coded colors

#### 5. **Dashboard Page Components** (`components/Dashboard/DashboardPages.tsx`)
Example page components for each role:
- `StudentDashboardPage`
- `LecturerDashboardPage`
- `AdminDashboardPage`

## Usage

### 1. Basic Setup

The sidebar is already integrated into the Layout component:

```tsx
<DashboardSidebar
  userRole={userRole}
  userName={userName}
  onLogout={onLogout}
  onNavigate={() => setIsSidebarOpen(false)}
/>
```

### 2. Adding New Navigation Items

Edit `utils/navigation.ts`:

```tsx
export const navigationItems: NavItem[] = [
  {
    id: 'new-page',
    label: 'My New Page',
    icon: NewIcon,
    href: '/dashboard/new-page',
    roles: ['student', 'lecturer'],  // Visible to these roles
    badge: 5,  // Optional badge
  },
];
```

### 3. Creating Nested Menus

```tsx
{
  id: 'management',
  label: 'Management',
  icon: Users,
  roles: ['admin'],
  children: [
    {
      id: 'users',
      label: 'Users',
      icon: UserIcon,
      href: '/dashboard/users',
      roles: ['admin'],
    },
    // More items...
  ],
}
```

### 4. Using Dashboard Pages

In your route handlers or dashboard wrapper:

```tsx
import {
  StudentDashboardPage,
  LecturerDashboardPage,
  AdminDashboardPage,
} from './DashboardPages';

// Render based on role
if (userRole === 'student') {
  return <StudentDashboardPage userName={userName} />;
}
```

## Styling & Colors

The sidebar uses theme tokens for full theme adaptation:

- `bg-surface` - Card backgrounds
- `bg-surface-container` - Hover/active backgrounds
- `text-on-surface` - Primary text
- `text-textMuted` - Secondary text
- `border-outline` - Borders
- `text-primary` / `bg-primary` - Active states and accents

### Active State
When a nav item is active:
```tsx
isActive
  ? "bg-primary text-on-primary-fixed shadow-md"
  : "text-on-surface/70 hover:text-on-surface hover:bg-surface-container/50"
```

## Responsive Design

### Desktop (md and above)
- Sidebar visible: `md:w-60 lg:w-72`
- Fixed positioned: `sticky top-0 h-screen`
- Content margin: `md:ml-60 lg:ml-72`

### Mobile (below md)
- No sidebar shown
- Mobile header with user profile
- Bottom dock navigation (existing implementation)

## Features

### 1. Badge Support
Display notifications or counts:
```tsx
{
  id: 'users',
  label: 'Users',
  icon: Users,
  roles: ['admin'],
  badge: 2543,  // Shows badge
}
```

### 2. Nested Menus
Support for grouped navigation items with expandable sections.

### 3. Icons
Uses Lucide React icons for consistency with app design.

### 4. Active State Tracking
Automatically highlights current page based on URL.

### 5. Role-Based Filtering
Navigation items automatically filtered based on user role.

## File Structure

```
frontend/
├── src/
│   └── components/
│       └── ui/
│           └── sidebar.tsx                 # Core UI components
├── components/
│   ├── Layout.tsx                          # Updated with DashboardSidebar
│   └── Dashboard/
│       ├── DashboardSidebar.tsx            # Main sidebar component
│       ├── DashboardPages.tsx              # Example page components
│       ├── StudentDashboard.tsx            # Current student dashboard
│       ├── LecturerDashboard.tsx           # Current lecturer dashboard
│       └── AdminDashboard.tsx              # Current admin dashboard
└── utils/
    └── navigation.ts                       # Navigation configuration
```

## Migration Checklist

- [x] Create shadcn sidebar components
- [x] Create navigation configuration
- [x] Create DashboardSidebar wrapper
- [x] Update Layout component
- [x] Create example dashboard pages
- [ ] Update existing dashboard components to use new pages
- [ ] Test with different user roles
- [ ] Add more navigation items as needed
- [ ] Customize colors if needed

## Next Steps

1. **Update Dashboard Routes**: Route to appropriate dashboard pages based on role
2. **Add More Pages**: Create additional dashboard pages for:
   - Profile management
   - Settings
   - Notifications
   - Help/Support
3. **Customize Navigation**: Add more items specific to your institution
4. **Add Animations**: Consider adding page transitions using Framer Motion
5. **Mobile Navigation**: Enhance mobile experience with additional features

## Example: Adding a New Admin Feature

1. Add to `navigationItems` in `utils/navigation.ts`:
```tsx
{
  id: 'reports',
  label: 'Reports',
  icon: FileText,
  href: '/dashboard/reports',
  roles: ['admin'],
  badge: undefined,
}
```

2. Create component at `components/Dashboard/Reports.tsx`

3. Update routing to render the component

4. Sidebar automatically shows it for admin users only

## Theme Support

The sidebar is fully theme-adaptive using CSS variables:
- Light mode: Default appearance
- Dark mode: Colors automatically adjust
- Changes applied via Tailwind CSS theme tokens

All colors use semantic tokens:
- `primary` / `on-primary-fixed` - Interactive elements
- `surface` / `on-surface` - Base surfaces and text
- `surface-container` / `on-surface-container` - Secondary surfaces
- `outline` / `outline-variant` - Borders and dividers
- `textMuted` - Secondary text
- `error` - Error states

## Troubleshooting

### Sidebar not showing
- Verify user role is correctly set
- Check that role matches items in `navigationItems`
- Ensure layout is updated with `DashboardSidebar` component

### Navigation items not appearing
- Check role-based filtering in `getNavItemsForRole`
- Verify item roles array includes the user's role
- Check browser console for errors

### Styling issues
- Verify theme tokens are applied in Tailwind config
- Check `sidebar.tsx` class names match Tailwind setup
- Inspect element to verify classes are applied

## Performance Considerations

- Navigation is memoized with `useMemo` where applicable
- Active state uses URL comparison (fast)
- Submenu expansion state is local to component
- No unnecessary re-renders on navigation

---

**Last Updated:** May 2024
**Version:** 1.0
