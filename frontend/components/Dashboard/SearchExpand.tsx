import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MagnifyingGlass, X, User, BookOpen, NavigationArrow, Spinner } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api/client';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SearchResult {
  id: string;
  type: 'page' | 'user' | 'course';
  title: string;
  subtitle?: string;
  href: string;
}

// ─── Static page index (always available, no API needed) ─────────────────────

const PAGES: SearchResult[] = [
  { id: 'p-dashboard',     type: 'page', title: 'Dashboard',          subtitle: 'Overview',                  href: '/dashboard' },
  { id: 'p-courses',       type: 'page', title: 'Courses',            subtitle: 'All enrolled courses',       href: '/dashboard/courses' },
  { id: 'p-sessions',      type: 'page', title: 'Sessions',           subtitle: 'Attendance sessions',        href: '/dashboard/sessions' },
  { id: 'p-analytics',     type: 'page', title: 'Analytics',          subtitle: 'Reports & insights',         href: '/dashboard/analytics' },
  { id: 'p-institutions',  type: 'page', title: 'Institutions',       subtitle: 'Manage institutions',        href: '/dashboard/institutions' },
  { id: 'p-users',         type: 'page', title: 'Users',              subtitle: 'Manage all users',           href: '/dashboard/users' },
  { id: 'p-venues',        type: 'page', title: 'Venues',             subtitle: 'Manage venues',              href: '/dashboard/venues' },
  { id: 'p-blog',          type: 'page', title: 'Blog',               subtitle: 'Editorial management',       href: '/dashboard/blog' },
  { id: 'p-staff',         type: 'page', title: 'Staff',              subtitle: 'Staff management',           href: '/dashboard/staff' },
  { id: 'p-departments',   type: 'page', title: 'Departments',        subtitle: 'Department management',      href: '/dashboard/departments' },
  { id: 'p-notifications', type: 'page', title: 'Notifications',      subtitle: 'View all notifications',     href: '/dashboard/notifications' },
  { id: 'p-settings',      type: 'page', title: 'Settings',           subtitle: 'Account & preferences',      href: '/dashboard/settings' },
  { id: 'p-security',      type: 'page', title: 'Security',           subtitle: 'Devices & security',         href: '/dashboard/security' },
  { id: 'p-profile',       type: 'page', title: 'Profile',            subtitle: 'View your profile',          href: '/dashboard/profile' },
  { id: 'p-logs',          type: 'page', title: 'Audit Logs',         subtitle: 'System audit trail',         href: '/dashboard/logs' },
  { id: 'p-email',         type: 'page', title: 'Email Monitor',      subtitle: 'Email delivery logs',        href: '/dashboard/email-monitor' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreMatch(text: string, query: string): number {
  const t = text.toLowerCase();
  const q = query.toLowerCase();
  if (t === q) return 3;
  if (t.startsWith(q)) return 2;
  if (t.includes(q)) return 1;
  return 0;
}

function searchPages(query: string): SearchResult[] {
  if (!query.trim()) return [];
  return PAGES
    .map(p => ({ ...p, score: Math.max(scoreMatch(p.title, query), scoreMatch(p.subtitle || '', query)) }))
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}

// ─── Main component ───────────────────────────────────────────────────────────

export const SearchExpand: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  // ── Open / close ────────────────────────────────────────────────────────
  const open = () => {
    setIsExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 150);
  };

  const close = () => {
    setIsExpanded(false);
    setQuery('');
    setResults([]);
    setActiveIndex(-1);
  };

  // Click outside to close
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Search logic ─────────────────────────────────────────────────────────
  const runSearch = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      setResults([]);
      return;
    }

    setLoading(true);
    setActiveIndex(-1);

    try {
      // Always include page matches immediately
      const pageMatches = searchPages(trimmed);

      // Fetch users and courses in parallel; gracefully ignore failures
      const [usersRes, coursesRes] = await Promise.allSettled([
        apiClient.get('/institutions/users/', { params: { search: trimmed, page_size: 5 } }),
        apiClient.get('/institutions/courses/', { params: { search: trimmed, page_size: 5 } }),
      ]);

      const userResults: SearchResult[] = [];
      if (usersRes.status === 'fulfilled') {
        const data = usersRes.value.data?.results ?? usersRes.value.data ?? [];
        (Array.isArray(data) ? data : []).slice(0, 5).forEach((u: any) => {
          userResults.push({
            id: `u-${u.id}`,
            type: 'user',
            title: u.full_name || u.username || u.email,
            subtitle: `${u.role?.toLowerCase() ?? 'user'} · ${u.email ?? ''}`,
            href: `/dashboard/users?highlight=${u.id}`,
          });
        });
      }

      const courseResults: SearchResult[] = [];
      if (coursesRes.status === 'fulfilled') {
        const data = coursesRes.value.data?.results ?? coursesRes.value.data ?? [];
        (Array.isArray(data) ? data : []).slice(0, 5).forEach((c: any) => {
          courseResults.push({
            id: `c-${c.id}`,
            type: 'course',
            title: `${c.course_code ?? ''} — ${c.name ?? c.course_name ?? ''}`.trim(),
            subtitle: c.department_name ?? c.lecturer_name ?? '',
            href: `/dashboard/courses?highlight=${c.id}`,
          });
        });
      }

      setResults([...pageMatches, ...userResults, ...courseResults]);
    } catch {
      setResults(searchPages(trimmed));
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(val), 280);
  };

  // ── Keyboard navigation ──────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, results.length - 1));
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, -1));
    }
    if (e.key === 'Enter' && activeIndex >= 0 && results[activeIndex]) {
      navigate(results[activeIndex].href);
      close();
    }
  };

  const handleSelect = (result: SearchResult) => {
    navigate(result.href);
    close();
  };

  // Icon per result type
  const ResultIcon = ({ type }: { type: SearchResult['type'] }) => {
    if (type === 'user') return <User size={14} weight="bold" className="text-violet-500" />;
    if (type === 'course') return <BookOpen size={14} weight="bold" className="text-blue-500" />;
    return <NavigationArrow size={14} weight="bold" className="text-emerald-500" />;
  };

  const typeLabel = (type: SearchResult['type']) => {
    if (type === 'user') return 'User';
    if (type === 'course') return 'Course';
    return 'Page';
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex items-center transition-all duration-300 ease-premium",
        isExpanded ? "w-full md:w-[380px]" : "w-10"
      )}
    >
      {/* Search icon button */}
      <button
        onClick={isExpanded ? undefined : open}
        className={cn(
          "p-2 text-textMuted hover:bg-surface-highest/40 hover:text-text rounded-xl transition-all z-10",
          isExpanded && "absolute left-0"
        )}
        aria-label={isExpanded ? undefined : "Open search"}
      >
        <MagnifyingGlass size={20} weight="bold" />
      </button>

      {/* Input */}
      <div className={cn(
        "flex-1 flex items-center bg-surface-highest/20 rounded-xl border border-outline/5 overflow-visible transition-all duration-300",
        isExpanded ? "opacity-100 pl-10 pr-2" : "opacity-0 w-0 pointer-events-none"
      )}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Search pages, users, courses…"
          className="w-full bg-transparent border-none py-2 text-sm text-text placeholder:text-textMuted focus:ring-0 outline-none"
          autoComplete="off"
        />
        <div className="flex items-center gap-1 pr-1">
          {loading && <Spinner size={14} className="animate-spin text-textMuted" />}
          {query && !loading && (
            <button
              onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus(); }}
              className="p-1 text-textMuted hover:text-text rounded-md transition-colors"
              aria-label="Clear"
            >
              <X size={14} weight="bold" />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isExpanded && results.length > 0 && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-surface border border-outline rounded-2xl shadow-xl z-50 overflow-hidden">
          {/* Group by type */}
          {(['page', 'user', 'course'] as const).map(type => {
            const group = results.filter(r => r.type === type);
            if (group.length === 0) return null;
            return (
              <div key={type}>
                <div className="px-3 pt-2.5 pb-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-textMuted">
                    {typeLabel(type)}s
                  </span>
                </div>
                {group.map((result, idx) => {
                  const globalIdx = results.indexOf(result);
                  return (
                    <button
                      key={result.id}
                      onClick={() => handleSelect(result)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors",
                        globalIdx === activeIndex ? "bg-primary/8 text-text" : "hover:bg-surfaceHigh"
                      )}
                    >
                      <div className="w-6 h-6 rounded-lg bg-surfaceHigh flex items-center justify-center flex-shrink-0">
                        <ResultIcon type={result.type} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text truncate">{result.title}</p>
                        {result.subtitle && (
                          <p className="text-xs text-textMuted truncate">{result.subtitle}</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
          <div className="px-3 py-2 border-t border-outline/5">
            <p className="text-[10px] text-textMuted">
              ↑↓ navigate · Enter select · Esc close
            </p>
          </div>
        </div>
      )}

      {/* Empty state */}
      {isExpanded && query.trim().length > 0 && results.length === 0 && !loading && (
        <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-surface border border-outline rounded-2xl shadow-xl z-50 px-4 py-6 text-center">
          <p className="text-sm text-textMuted">No results for <span className="font-medium text-text">"{query}"</span></p>
        </div>
      )}
    </div>
  );
};
