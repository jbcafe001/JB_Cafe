import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
  placeholder?: string;
  id?: string;
  placement?: 'top' | 'bottom';
}

export const CustomSelect: React.FC<CustomSelectProps> = ({
  value,
  onChange,
  options,
  className = '',
  placeholder = 'Select\u2026',
  id,
  placement = 'bottom',
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = options.find((o) => o.value === value);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`} id={id}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between px-3 py-2 bg-stone-50 border rounded-xl text-xs font-medium text-stone-800 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-amber-500/60 ${
          open
            ? 'border-amber-500 ring-2 ring-amber-500/30 bg-white'
            : 'border-stone-200 hover:border-stone-300 hover:bg-white'
        }`}
      >
        <span className={selected ? 'text-stone-800' : 'text-stone-400'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-stone-400 flex-shrink-0 ml-2 transition-transform duration-200 ${
            open ? 'rotate-180 text-amber-600' : ''
          }`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div 
          className={`absolute z-[200] w-full bg-white border border-stone-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in duration-100 ${
            placement === 'top' 
              ? 'bottom-full mb-1.5 slide-in-from-bottom-1 origin-bottom' 
              : 'mt-1.5 slide-in-from-top-1 origin-top'
          }`}
        >
          <ul className="max-h-52 overflow-y-auto py-1 divide-y divide-stone-50">
            {options.map((opt) => {
              const isSelected = opt.value === value;
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs text-left transition-colors duration-100 ${
                      isSelected
                        ? 'bg-amber-50 text-amber-800 font-bold'
                        : 'text-stone-700 font-medium hover:bg-stone-50'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <Check className="w-3 h-3 text-amber-600 flex-shrink-0" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
