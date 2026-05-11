import { LucideIcon } from 'lucide-react';
import {
  Home,
  BarChart3,
  Users,
  Settings,
  Calendar,
  CheckCircle2,
  ClipboardList,
  TrendingUp,
  Building2,
  User,
  MapPin,
  BookOpen,
  Clock,
  FileText,
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href?: string;
  roles: string[];
  children?: NavItem[];
  badge?: string | number;
}

export const navigationItems: NavItem[] = [
  // Common items
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    href: '/dashboard',
    roles: ['student', 'lecturer', 'admin', 'class_rep'],
    badge: undefined,
  },

  // Student-specific items
  {
    id: 'attendance',
    label: 'My Attendance',
    icon: CheckCircle2,
    href: '/dashboard/attendance',
    roles: ['student', 'class_rep'],
  },
  {
    id: 'courses',
    label: 'My Courses',
    icon: BookOpen,
    href: '/dashboard/courses',
    roles: ['student', 'class_rep'],
  },
  {
    id: 'schedule',
    label: 'Schedule',
    icon: Calendar,
    href: '/dashboard/schedule',
    roles: ['student', 'lecturer', 'class_rep'],
  },

  // Lecturer-specific items
  {
    id: 'sessions',
    label: 'Sessions',
    icon: ClipboardList,
    href: '/dashboard/sessions',
    roles: ['lecturer'],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: TrendingUp,
    href: '/dashboard/analytics',
    roles: ['student', 'lecturer', 'class_rep'],
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: FileText,
    href: '/dashboard/reports',
    roles: ['lecturer'],
  },

  // Admin-specific items - Main sections
  {
    id: 'admin-system',
    label: 'System',
    icon: BarChart3,
    roles: ['admin'],
    children: [
      {
        id: 'control-center',
        label: 'Control Center',
        icon: BarChart3,
        href: '/dashboard/control-center',
        roles: ['admin'],
      },
      {
        id: 'system-logs',
        label: 'System Logs',
        icon: FileText,
        href: '/dashboard/system-logs',
        roles: ['admin'],
      },
    ],
  },
  {
    id: 'admin-management',
    label: 'Management',
    icon: Users,
    roles: ['admin'],
    children: [
      {
        id: 'institutions',
        label: 'Institutions',
        icon: Building2,
        href: '/dashboard/institutions',
        roles: ['admin'],
      },
      {
        id: 'users',
        label: 'Users',
        icon: Users,
        href: '/dashboard/users',
        roles: ['admin'],
        badge: 2543,
      },
      {
        id: 'venues',
        label: 'Venues',
        icon: MapPin,
        href: '/dashboard/venues',
        roles: ['admin'],
      },
      {
        id: 'departments',
        label: 'Departments',
        icon: Building2,
        href: '/dashboard/departments',
        roles: ['admin'],
      },
      {
        id: 'courses',
        label: 'Courses',
        icon: BookOpen,
        href: '/dashboard/courses',
        roles: ['admin'],
      },
    ],
  },
];

export const getNavItemsForRole = (role: string): NavItem[] => {
  return navigationItems
    .filter(item => item.roles.includes(role))
    .map(item => ({
      ...item,
      children: item.children?.filter(child => child.roles.includes(role)),
    }))
    .filter(item => !item.children || item.children.length > 0 || !item.children);
};
