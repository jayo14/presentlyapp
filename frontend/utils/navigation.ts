import { LucideIcon } from 'lucide-react';
import {
  Home,
  Users,
  Calendar,
  CheckCircle2,
  ClipboardList,
  TrendingUp,
  Building2,
  MapPin,
  BookOpen,
  FileText,
  Bell,
  Cog,
  Shield,
  Newspaper,
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  roles: string[];
  badge?: string | number;
  section?: 'core' | 'management' | 'system';
}

export const navigationItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    href: '/dashboard',
    roles: ['student', 'lecturer', 'admin', 'class_rep'],
    section: 'core',
  },
  {
    id: 'courses',
    label: 'Attendance',
    icon: CheckCircle2,
    href: '/dashboard/courses',
    roles: ['student', 'class_rep'],
    section: 'core',
  },
  {
    id: 'timetable',
    label: 'Schedule',
    icon: Calendar,
    href: '/dashboard/timetable',
    roles: ['student', 'lecturer', 'class_rep'],
    section: 'core',
  },
  {
    id: 'sessions',
    label: 'Sessions',
    icon: ClipboardList,
    href: '/dashboard/sessions',
    roles: ['lecturer'],
    section: 'core',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: TrendingUp,
    href: '/dashboard/analytics',
    roles: ['student', 'lecturer', 'class_rep'],
    section: 'core',
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: FileText,
    href: '/dashboard/reports',
    roles: ['lecturer'],
    section: 'core',
  },
  {
    id: 'institutions',
    label: 'Institutions',
    icon: Building2,
    href: '/dashboard/institutions',
    roles: ['admin'],
    section: 'management',
  },
  {
    id: 'users',
    label: 'Users',
    icon: Users,
    href: '/dashboard/users',
    roles: ['admin'],
    section: 'management',
  },
  {
    id: 'venues',
    label: 'Venues',
    icon: MapPin,
    href: '/dashboard/venues',
    roles: ['admin'],
    section: 'management',
  },
  {
    id: 'departments',
    label: 'Departments',
    icon: Building2,
    href: '/dashboard/departments',
    roles: ['admin'],
    section: 'management',
  },
  {
    id: 'courses-admin',
    label: 'Courses',
    icon: BookOpen,
    href: '/dashboard/courses',
    roles: ['admin'],
    section: 'management',
  },
  {
    id: 'blog',
    label: 'Blog',
    icon: Newspaper,
    href: '/dashboard/blog',
    roles: ['admin'],
    section: 'management',
  },
  {
    id: 'logs',
    label: 'System Logs',
    icon: FileText,
    href: '/dashboard/logs',
    roles: ['admin'],
    section: 'system',
  },
  {
    id: 'config',
    label: 'Configuration',
    icon: Cog,
    href: '/dashboard/config',
    roles: ['admin'],
    section: 'system',
  },
  {
    id: 'security',
    label: 'Security',
    icon: Shield,
    href: '/dashboard/security',
    roles: ['admin'],
    section: 'system',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    href: '/dashboard/notifications',
    roles: ['student', 'lecturer', 'admin', 'class_rep'],
    section: 'system',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Cog,
    href: '/dashboard/settings',
    roles: ['student', 'lecturer', 'admin', 'class_rep'],
    section: 'system',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: Users,
    href: '/dashboard/profile',
    roles: ['student', 'lecturer', 'admin', 'class_rep'],
    section: 'system',
  },
];

export const getNavItemsForRole = (role: string): NavItem[] => {
  return navigationItems.filter((item) => item.roles.includes(role));
};
