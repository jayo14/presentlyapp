import React, { useState, useRef, useEffect } from 'react';
import { MagnifyingGlass, X } from '@phosphor-icons/react';
import { cn } from '../../lib/utils';

export const SearchExpand: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setTimeout(() => inputRef.current?.focus(), 200);
    } else {
      setSearchValue('');
    }
  };

  const handleClear = () => {
    setSearchValue('');
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (isExpanded && searchValue === '') {
          setIsExpanded(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded, searchValue]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex items-center transition-all duration-300 ease-premium",
        isExpanded ? "w-full md:w-[320px]" : "w-10"
      )}
    >
      <button
        onClick={toggleExpand}
        className={cn(
          "p-2 text-textMuted hover:bg-surface-highest/40 hover:text-text rounded-xl transition-all z-10",
          isExpanded && "absolute left-0"
        )}
        aria-label={isExpanded ? "Close search" : "Open search"}
      >
        <MagnifyingGlass size={20} weight="bold" />
      </button>

      <div className={cn(
        "flex-1 flex items-center bg-surface-highest/20 rounded-xl border border-outline/5 overflow-hidden transition-all duration-300",
        isExpanded ? "opacity-100 pl-10 pr-2" : "opacity-0 w-0 pointer-events-none"
      )}>
        <input
          ref={inputRef}
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search everything..."
          className="w-full bg-transparent border-none py-2 text-sm text-text placeholder:text-textMuted focus:ring-0 outline-none"
        />

        {searchValue && (
          <button
            onClick={handleClear}
            className="p-1 text-textMuted hover:text-text rounded-md transition-colors"
            aria-label="Clear search"
          >
            <X size={14} weight="bold" />
          </button>
        )}
      </div>
    </div>
  );
};
