import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { useSmartNavigation } from '../../lib/navigation';
import { cn } from '../../lib/utils';

interface BackButtonProps {
  onClick?: () => void;
  fallbackPath?: string;
  forceFallback?: boolean;
  className?: string;
}

export function BackButton({ onClick, fallbackPath = '/', forceFallback = false, className }: BackButtonProps) {
  const { goBack, navigate } = useSmartNavigation();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    } else if (forceFallback) {
      navigate(fallbackPath, { replace: true });
    } else {
      goBack(fallbackPath);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className={cn(
        "relative group p-2 shrink-0 flex items-center rounded-full",
        "bg-white dark:bg-slate-800",
        "border-2 border-b-[3px] border-slate-200 dark:border-slate-700",
        "shadow-sm hover:shadow-md",
        "transition-all z-10 overflow-hidden",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <ChevronRight 
        size={20} 
        strokeWidth={3.5}
        className="text-teal-600 dark:text-teal-400 drop-shadow-sm transition-transform duration-200 relative z-10 rtl:rotate-0 ltr:rotate-180 group-active:-translate-x-0.5" 
      />
    </motion.button>
  );
}
