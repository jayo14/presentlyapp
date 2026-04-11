import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

interface Option {
    id: string | number;
    name: string;
    description?: string;
}

interface AccessibleComboboxProps {
    options: Option[];
    value: string | number;
    onChange: (value: string | number) => void;
    placeholder?: string;
    label?: string;
    error?: string;
    id: string;
    required?: boolean;
    disabled?: boolean;
}

export const AccessibleCombobox: React.FC<AccessibleComboboxProps> = ({
    options,
    value,
    onChange,
    placeholder = "Select an option...",
    label,
    error,
    id,
    required = false,
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeIndex, setActiveIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const listboxRef = useRef<HTMLUListElement>(null);

    const filteredOptions = useMemo(() => {
        if (!searchTerm) return options;
        const lowerSearch = searchTerm.toLowerCase();
        return options.filter(opt => 
            opt.name.toLowerCase().includes(lowerSearch) || 
            (opt.description && opt.description.toLowerCase().includes(lowerSearch))
        );
    }, [options, searchTerm]);

    const selectedOption = useMemo(() => 
        options.find(opt => opt.id.toString() === value.toString()), 
    [options, value]);

    // Handle clicks outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Scroll active item into view
    useEffect(() => {
        if (isOpen && activeIndex >= 0 && listboxRef.current) {
            const activeElement = listboxRef.current.children[activeIndex] as HTMLElement;
            if (activeElement) {
                activeElement.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [activeIndex, isOpen]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (disabled) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                if (!isOpen) {
                    setIsOpen(true);
                } else {
                    setActiveIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
                }
                break;
            case 'ArrowUp':
                e.preventDefault();
                setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
                break;
            case 'Enter':
                e.preventDefault();
                if (isOpen && activeIndex >= 0) {
                    selectOption(filteredOptions[activeIndex]);
                } else if (!isOpen) {
                    setIsOpen(true);
                }
                break;
            case 'Escape':
                setIsOpen(false);
                setActiveIndex(-1);
                break;
            case 'Tab':
                setIsOpen(false);
                break;
        }
    };

    const selectOption = (option: Option) => {
        onChange(option.id);
        setSearchTerm("");
        setIsOpen(false);
        setActiveIndex(-1);
    };

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange("");
        setSearchTerm("");
        inputRef.current?.focus();
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            {label && (
                <label 
                    htmlFor={id} 
                    className="block text-sm font-bold text-text mb-2"
                >
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            
            <div 
                className={`relative group transition-all rounded-xl border ${
                    isOpen 
                        ? 'border-primary ring-2 ring-primary/20 bg-surface' 
                        : 'border-outline bg-surfaceLow hover:border-textMuted'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}`}
                onClick={() => !disabled && setIsOpen(true)}
            >
                <div className="flex items-center px-3 py-2.5">
                    <Search className={`mr-2.5 ${isOpen ? 'text-primary' : 'text-textMuted'}`} size={16} />
                    
                    <div className="flex-1 relative">
                        {/* Hidden Input for Form Submission/Accessibility */}
                        <input
                            ref={inputRef}
                            id={id}
                            type="text"
                            autoComplete="off"
                            className="w-full bg-transparent border-none outline-none text-sm text-text placeholder:text-textMuted"
                            placeholder={selectedOption ? "" : placeholder}
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                if (!isOpen) setIsOpen(true);
                                setActiveIndex(0);
                            }}
                            onKeyDown={handleKeyDown}
                            disabled={disabled}
                            role="combobox"
                            aria-autocomplete="list"
                            aria-expanded={isOpen}
                            aria-haspopup="listbox"
                            aria-controls={`${id}-listbox`}
                            aria-activedescendant={activeIndex >= 0 ? `${id}-opt-${filteredOptions[activeIndex]?.id}` : undefined}
                            aria-required={required}
                        />
                        
                        {/* Selected Option Display (when not typing) */}
                        {!searchTerm && selectedOption && (
                            <div className="absolute inset-0 pointer-events-none flex items-center">
                                <span className="text-sm font-medium text-text truncate">
                                    {selectedOption.name}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 ml-2">
                        {value && !disabled && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="p-1 text-textMuted hover:text-text transition-colors rounded-md"
                                aria-label="Clear selection"
                            >
                                <X size={14} />
                            </button>
                        )}
                        <ChevronDown 
                            className={`text-textMuted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                            size={16} 
                        />
                    </div>
                </div>
            </div>

            {error && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1"><Check className="rotate-180" size={12} /> {error}</p>}

            {/* Listbox */}
            {isOpen && !disabled && (
                <ul
                    ref={listboxRef}
                    id={`${id}-listbox`}
                    role="listbox"
                    className="absolute z-[100] w-full mt-2 py-1.5 bg-surface border border-outline rounded-xl shadow-xl max-h-[280px] overflow-y-auto outline-none animate-in fade-in slide-in-from-top-2 duration-200"
                >
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((opt, index) => {
                            const isSelected = value.toString() === opt.id.toString();
                            const isActive = index === activeIndex;
                            
                            return (
                                <li
                                    key={opt.id}
                                    id={`${id}-opt-${opt.id}`}
                                    role="option"
                                    aria-selected={isSelected}
                                    onClick={() => selectOption(opt)}
                                    onMouseEnter={() => setActiveIndex(index)}
                                    className={`px-3 py-2.5 cursor-pointer flex items-center justify-between transition-colors ${
                                        isActive ? 'bg-primary/10 text-primary' : 'text-text hover:bg-surfaceLow'
                                    } ${isSelected ? 'font-semibold' : 'font-normal'}`}
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm truncate">{opt.name}</p>
                                        {opt.description && (
                                            <p className={`text-[11px] truncate mt-0.5 ${isActive ? 'text-primary/70' : 'text-textMuted'}`}>
                                                {opt.description}
                                            </p>
                                        )}
                                    </div>
                                    {isSelected && <Check className="ml-2 text-primary" size={14} strokeWidth={3} />}
                                </li>
                            );
                        })
                    ) : (
                        <li className="px-4 py-8 text-center text-textMuted flex flex-col items-center gap-2">
                            <Search size={20} className="opacity-20" />
                            <p className="text-xs italic">No matching results found</p>
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
};
