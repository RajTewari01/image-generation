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
    <div className="absolute top-6 right-6 z-50 flex flex-col items-end" ref={containerRef}>
      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-black/40 backdrop-blur-3xl border border-white/20 shadow-2xl hover:bg-black/60 transition-all duration-300 group"
      >
        <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-500/80 to-purple-500/80 flex items-center justify-center">
          <Palette className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="flex flex-col items-start leading-none group">
          <span className="text-sm font-semibold text-neutral-100 group-hover:text-white transition-colors">{value}</span>
        </div>
        <ChevronDown className={'w-4 h-4 text-neutral-400 transition-transform duration-500 ' + (isOpen ? 'rotate-180' : '')} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10, filter: 'blur(10px)' }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.9, y: 10, filter: 'blur(10px)' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="mt-3 w-64 rounded-3xl bg-black/60 backdrop-blur-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden p-2"
          >
            <div className="px-3 py-2 border-b border-white/5 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Visual Pattern Engine</span>
            </div>
            {(Object.keys(THEMES) as Array<ThemeName>).map(theme => (
              <motion.button
                key={theme}
                whileHover={{ x: 4, backgroundColor: 'rgba(255,255,255,0.05)' }}
                onClick={() => {
                  onChange(theme);
                  setIsOpen(false);
                }}
                className="w-full flex items-center justify-between px-4 py-3.5 text-sm font-medium text-neutral-300 rounded-xl transition-all"
              >
                <div className="flex flex-col items-start">
                  <span>{theme} Mode</span>
                  <span className="text-[9px] text-neutral-500">
                    {theme === 'Monterey' ? 'Liquid Fluidics' : 
                     theme === 'Sonoma' ? 'Sunset Distance Field' : 
                     theme === 'Catalina' ? 'Deep Ocean Swimming Fish' :
                     theme === 'BigSur' ? 'Voronoi Cellular Life' : 
                     'Monochrome Digital Grid'}
                  </span>
                </div>
                {value === theme && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                    <Check className="w-4 h-4 text-indigo-400" />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
