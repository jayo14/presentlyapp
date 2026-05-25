import React, { useState, useRef, useEffect } from 'react';
import { MagnifyingGlass, X } from '@phosphor-icons/react';
import { cn } from '../../src/components/ui/utils';

export const SearchExpand: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isExpanded]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) {
        setIsExpanded(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsExpanded(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpanded]);

  return (
    <div className="relative flex items-center">
      <div
        role="button"
        aria-label="Search"
        tabIndex={0}
        className={cn(
          "flex items-center bg-surface-highest/50 border border-outline rounded-full transition-all duration-500 ease-premium overflow-hidden",
          isExpanded ? "w-64 md:w-80 px-4" : "w-11 px-0 justify-center cursor-pointer hover:bg-surface-highest"
        )}
        onClick={() => !isExpanded && setIsExpanded(true)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(true);
          }
        }}
      >
        <MagnifyingGlass
          size={18}
          weight="bold"
          className={cn(
            "shrink-0 transition-colors duration-300",
            isExpanded ? "text-on-surface-variant" : "text-on-surface"
          )}
        />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search (Cmd + K)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={cn(
            "bg-transparent border-none focus:ring-0 text-sm w-full h-11 ml-2 transition-opacity duration-300",
            isExpanded ? "opacity-100" : "opacity-0 w-0"
          )}
        />
        {isExpanded && (
          <button
            aria-label={query ? "Clear search" : "Close search"}
            onClick={(e) => {
              e.stopPropagation();
              if (query) setQuery('');
              else setIsExpanded(false);
            }}
            className="p-1 hover:bg-surface-variant rounded-full transition-colors"
          >
            <X size={14} weight="bold" className="text-on-surface-variant" />
          </button>
        )}
      </div>
    </div>
  );
};
