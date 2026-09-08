import React from 'react';
import { Moon, BookOpen, Sparkles, Heart, Award, Sunrise } from 'lucide-react';
import { useAppContext } from '../../AppContext';
import { cn } from '../../lib/utils';

interface AppIconProps {
  className?: string;
  size?: number; // Outer dimension (default is 10/11)
  iconSize?: number; // Inside icon size
  isWatermark?: boolean; // Forced watermark state
}

export const AppIcon: React.FC<AppIconProps> = ({ className, size, iconSize = 24, isWatermark }) => {
  const { settings } = useAppContext();
  const customIcon = settings?.customAppIcon;

  // Detect if this functions as a watermark/emblem on shareable cards (typically size props <= 6)
  const isLogoWatermark = isWatermark !== undefined ? isWatermark : (size !== undefined && size <= 6);
  
  // Smart Autonomous Auto-Calibration Logic
  const getSmartScale = () => {
    // If user explicitly turned off auto scaling, use their custom values
    if (settings?.autoIconScale === false) {
      return isLogoWatermark
        ? ((settings?.watermarkLogoScale || 100) / 100)
        : ((settings?.appIconScale || 100) / 100);
    }

    // Otherwise, calculate the scientifically optimal scale adaptively
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 412;
    const isMobile = screenWidth < 480;
    const isTablet = screenWidth >= 480 && screenWidth < 768;

    if (isLogoWatermark) {
      // In card sharing watermarks, smaller screens need ultra-compact emblems to avoid spilling over margins
      if (isMobile) return 0.75;  // 75% scale on mobile
      if (isTablet) return 0.90;  // 90% scale on tablet
      return 1.10;                // 110% scale on high-res monitors / print exports
    } else {
      // General application icons
      const baseIconSize = size !== undefined ? size : 11;
      
      if (baseIconSize >= 24) {
        // Grand splash screens, welcome screens, onboarding - grand display
        if (isMobile) return 0.90;
        return 1.15;
      }
      if (baseIconSize >= 14 && baseIconSize < 24) {
        // Settings page preview, profile section
        if (isMobile) return 0.95;
        return 1.05;
      }
      // Standard small buttons, headers, navigation rows
      if (isMobile) return 0.90; // slightly sleek on small mobile
      return 1.0;
    }
  };

  const scale = getSmartScale();
  const activeIconSize = Math.round(iconSize * scale);

  // Convert the Tailwind multiplier 'size' to explicit pixel counts
  const baseSize = size !== undefined ? size : 11;
  const computedSize = Math.round(baseSize * 4 * scale);

  // Check if it's a full-bleed image/logo, which takes the full card area beautifully without padding
  const isImage = !customIcon || 
    customIcon.startsWith('preset:original') || 
    customIcon === 'original' || 
    customIcon === 'default' || 
    customIcon === 'preset:default' || 
    customIcon.startsWith('data:image/') ||
    customIcon.startsWith('/logo');

  // Render based on customIcon value
  const renderContent = () => {
    if (!customIcon || customIcon.startsWith('preset:original') || customIcon === 'original' || customIcon === 'default' || customIcon === 'preset:default') {
      const optimalLogoSrc = computedSize <= 128 ? "/logo-192.png" : "/logo-512.png";
      return (
        <img 
          src={optimalLogoSrc} 
          alt="أذكار المؤمن"
          className="w-full h-full object-cover select-none transition-transform duration-300 group-hover:scale-105"
          referrerPolicy="no-referrer"
          loading="eager"
          fetchPriority="high"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src.includes('logo-192.png') || target.src.includes('logo-512.png')) {
              target.src = '/logo.png';
            } else if (target.src.includes('logo.png')) {
              target.src = '/logo.svg';
            }
          }}
        />
      );
    }

    if (customIcon.startsWith('preset:quran')) {
      return (
        <BookOpen 
          className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" 
          size={activeIconSize} 
          strokeWidth={2.5} 
        />
      );
    }

    if (customIcon.startsWith('preset:stars')) {
      return (
        <Sparkles 
          className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" 
          size={activeIconSize} 
          strokeWidth={2.5} 
        />
      );
    }

    if (customIcon.startsWith('preset:heart')) {
      return (
        <Heart 
          className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] animate-pulse" 
          size={activeIconSize} 
          strokeWidth={2.5} 
        />
      );
    }

    if (customIcon.startsWith('preset:award')) {
      return (
        <Award 
          className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" 
          size={activeIconSize} 
          strokeWidth={2.5} 
        />
      );
    }

    if (customIcon.startsWith('preset:sunrise')) {
      return (
        <Sunrise 
          className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" 
          size={activeIconSize} 
          strokeWidth={2.5} 
        />
      );
    }

    if (customIcon.startsWith('emoji:')) {
      const emojiVal = customIcon.split('emoji:')[1] || '🌙';
      return (
        <span 
          style={{ fontSize: `${activeIconSize * 1.1}px` }} 
          className="select-none filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)] animate-fade-in"
        >
          {emojiVal}
        </span>
      );
    }

    // Otherwise, assume it is a base64 image data string
    if (customIcon.startsWith('data:image/')) {
      return (
        <img 
          src={customIcon} 
          alt="Custom App Icon" 
          className="w-full h-full object-cover rounded-lg sm:rounded-xl shadow-inner"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
      );
    }

    // Fallback block if unhandled
    return (
      <Moon 
        className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" 
        size={activeIconSize} 
        strokeWidth={2.5} 
      />
    );
  };

  // Use pixel size class fallback only if size is undefined
  const dimensionsClass = "w-10 h-10 sm:w-11 sm:h-11";
  const hasExplicitDimensionClass = className && /(^|\s)(w-|h-)/.test(className);

  return (
    <div 
      className={cn(
        "rounded-lg sm:rounded-xl flex items-center justify-center shadow-md relative overflow-hidden shrink-0 transition-all duration-300",
        size === undefined && !hasExplicitDimensionClass ? dimensionsClass : "",
        className
      )}
      style={hasExplicitDimensionClass ? undefined : {
        width: `${computedSize}px`,
        height: `${computedSize}px`
      }}
    >
      {/* If it's NOT a base64 image, render the styled background gradient */}
      {!isImage && (
        <>
          <div 
            className="absolute inset-0 transition-all duration-500"
            style={{ background: settings?.primaryColor || '#0f766e' }}
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent opacity-60 pointer-events-none" />
        </>
      )}
      
      <div className={cn(
        "relative z-10 flex items-center justify-center",
        isImage ? "w-full h-full" : ""
      )}>
        {renderContent()}
      </div>
    </div>
  );
};
