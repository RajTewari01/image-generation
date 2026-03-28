'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Check, ChevronDown } from 'lucide-react';
import { THEMES, ThemeName } from './FluidBackground';

interface Props {
  value: ThemeName;
  onChange: (theme: ThemeName) => void;
}

export default function ThemeDropdown({ value, onChange }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="absolute top-6 right-6 z-50" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-neutral-900/40 backdrop-blur-2xl border border-white/10 shadow-xl hover:bg-neutral-800/60 transition-colors"
      >
        <Palette className="w-4 h-4 text-indigo-400" />
        <span className="text-sm font-semibold tracking-wide text-neutral-100">{value}</span>
        <ChevronDown className={'w-4 h-4 text-neutral-400 transition-transform duration-300 ' + (isOpen ? 'rotate-180' : '')} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-neutral-950/80 backdrop-blur-3xl border border-white/10 shadow-2xl overflow-hidden py-1"
          >
            {(Object.keys(THEMES) as Array<ThemeName>).map(theme => (
              <button
                key={theme}
                onClick={() => {
                  onChange(theme);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-neutral-300 hover:bg-white/10 transition-colors"
              >
                <span>{theme} Theme</span>
                {value === theme && <Check className="w-4 h-4 text-indigo-400" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
