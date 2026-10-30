import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { useSmartNavigation } from '../../lib/navigation';
import { cn } from '../../lib/utils';
import { useAppContext } from '../../AppContext';
import { useTranslation } from '../../i18n';

interface BackButtonProps {
  onClick?: () => void;
  fallbackPath?: string;
  forceFallback?: boolean;
  className?: string;
}

export function BackButton({ onClick, fallbackPath = '/', forceFallback = false, className }: BackButtonProps) {
  const { goBack, navigate } = useSmartNavigation();
  const { settings } = useAppContext();
  const { t } = useTranslation(settings.appLanguage);

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
      type="button"
      whileTap={{ scale: 0.92 }}
      onClick={handleClick}
      aria-label={t('back', 'رجوع')}
      title={t('back', 'رجوع')}
      className={cn(
        // A 38px capsule outlined in the app's royal green, with a soft halo,
        // so the way back is easy to spot on every page.
        "relative shrink-0 w-[38px] h-[38px] rounded-full flex items-center justify-center",
        "bg-white dark:bg-slate-900",
        "border-2 border-[#006A4E] dark:border-emerald-400",
        "ring-4 ring-[#006A4E]/15 dark:ring-emerald-400/20",
        "shadow-sm hover:shadow-md transition-shadow z-10",
        className
      )}
    >
      <ChevronRight
        size={20}
        strokeWidth={3.85}
        aria-hidden="true"
        className="text-[#006A4E] dark:text-emerald-400 rtl:rotate-0 ltr:rotate-180"
      />
    </motion.button>
  );
}
