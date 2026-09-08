import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Moon, Star, Library, AlertCircle, Loader2 } from 'lucide-react';

export type EmptyStateVariant = 'loading' | 'error' | 'empty' | 'search';

interface EmptyStatePlaceholderProps {
  title: string;
  description?: string;
  variant?: EmptyStateVariant;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyStatePlaceholder({
  title,
  description,
  variant = 'empty',
  icon,
  action,
  className = ''
}: EmptyStatePlaceholderProps) {
  // Select default icon based on variant if not provided
  const renderIcon = () => {
    if (icon) return icon;

    switch (variant) {
      case 'loading':
        return <Loader2 className="w-12 h-12 text-teal-600 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-12 h-12 text-rose-500" />;
      case 'search':
        return <Library className="w-12 h-12 text-slate-400" />;
      case 'empty':
      default:
        // A subtle Islamic-style combination using BookOpen/Moon
        return (
          <div className="relative flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-teal-600/70" />
            <Star className="w-4 h-4 text-amber-500 absolute -top-1 -right-1" />
            <Moon className="w-4 h-4 text-teal-500 absolute -bottom-1 -left-1" />
          </div>
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`flex flex-col items-center justify-center p-8 text-center min-h-[40vh] ${className}`}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
        className="mb-6 p-4 bg-slate-100 dark:bg-slate-800/50 rounded-full shadow-inner"
      >
        {renderIcon()}
      </motion.div>
      
      <motion.h3 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 font-qadasi"
      >
        {title}
      </motion.h3>
      
      {description && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-slate-500 dark:text-slate-400 max-w-md text-sm leading-relaxed"
        >
          {description}
        </motion.p>
      )}

      {action && (
        <motion.div 
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          {action}
        </motion.div>
      )}
    </motion.div>
  );
}
