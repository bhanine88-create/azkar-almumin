import React from 'react';
import { cn } from '../../lib/utils';

interface WatermarkProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
}

export const Watermark: React.FC<WatermarkProps> = ({ className, size = 'md' }) => {
  const sizeClasses = {
    xs: 'w-5 h-5',
    sm: 'w-7 h-7',
    md: 'w-10 h-10',
    lg: 'w-14 h-14'
  };

  return (
    <div className={cn(
      "select-none transition-all duration-300 hover:scale-110",
      className
    )}>
      <div className={cn(
        "rounded-full overflow-hidden border border-white/20 shadow-lg bg-emerald-950 flex items-center justify-center",
        sizeClasses[size]
      )}>
        <img 
          src="/images/watermark_official.png" 
          alt="Athkar Believer" 
          className="w-full h-full object-contain" 
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
};
