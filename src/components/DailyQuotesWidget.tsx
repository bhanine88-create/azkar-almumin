import React, { useRef, useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import download from 'downloadjs';
import { Share2, Download, Quote, ChevronRight, ChevronLeft, Image as ImageIcon, Type } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { safeLocalStorageGetItem, safeLocalStorageSetItem, safeLocalStorageRemoveItem } from "../utils/storage";


export interface DailyQuote {
  id: string;
  text: string;
  source: string;
  type: 'quran' | 'sunnah' | 'scholar';
}

const QUOTES: DailyQuote[] = [
  {
    id: '1',
    text: 'وَمَا تَفْعَلُوا مِنْ خَيْرٍ فَإِنَّ اللَّهَ بِهِ عَلِيمٌ',
    source: 'سورة البقرة: 215',
    type: 'quran',
  },
  {
    id: '2',
    text: 'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا، سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ.',
    source: 'رواه مسلم',
    type: 'sunnah',
  },
  {
    id: '3',
    text: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا * إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    source: 'سورة الشرح: 5-6',
    type: 'quran',
  },
  {
    id: '4',
    text: 'كَلِمَتَانِ خَفِيفَتَانِ عَلَى اللِّسَانِ، ثَقِيلَتَانِ فِي الْمِيزَانِ، حَبِيبَتَانِ إِلَى الرَّحْمَنِ: سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ.',
    source: 'متفق عليه',
    type: 'sunnah',
  },
  {
    id: '5',
    text: 'إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ ۚ يَا أَيُّهَا الَّذِينَ آمَنُوا صَلُّوا عَلَيْهِ وَسَلِّمُوا تَسْلِيمًا',
    source: 'سورة الأحزاب: 56',
    type: 'quran',
  },
  {
    id: '6',
    text: 'لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا',
    source: 'سورة التوبة: 40',
    type: 'quran',
  },
  {
    id: '7',
    text: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    source: 'متفق عليه',
    type: 'sunnah',
  },
  {
    id: '8',
    text: 'وَتَوَكَّلْ عَلَى الْحَيِّ الَّذِي لَا يَمُوتُ وَسَبِّحْ بِحَمْدِهِ ۚ وَكَفَىٰ بِهِ بِذُنُوبِ عِبَادِهِ خَبِيرًا',
    source: 'سورة الفرقان: 58',
    type: 'quran',
  },
  {
    id: '9',
    text: 'عَجَبًا لأَمْرِ المُؤْمِنِ إِنَّ أَمْرَهُ كُلَّهُ خَيْرٌ، وَلَيْسَ ذَاكَ لأَحَدٍ إِلاَّ لِلْمُؤْمِنِ، إِنْ أَصَابَتْهُ سَرَّاءُ شَكَرَ فَكَانَ خَيْرًا لَهُ، وَإِنْ أَصَابَتْهُ ضَرَّاءُ صَبَرَ فَكَانَ خَيْرًا لَهُ.',
    source: 'رواه مسلم',
    type: 'sunnah',
  },
  {
    id: '10',
    text: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    source: 'سورة الرعد: 28',
    type: 'quran',
  },
  {
    id: '11',
    text: 'احْفَظِ اللَّهَ يَحْفَظْكَ، احْفَظِ اللَّهَ تَجِدْهُ تُجَاهَكَ، إِذَا سَأَلْتَ فَاسْأَلِ اللَّهَ، وَإِذَا اسْتَعَنْتَ فَاسْتَعِنْ بِاللَّهِ.',
    source: 'رواه الترمذي',
    type: 'sunnah',
  },
  {
    id: '12',
    text: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ ۖ أُجِيبُ دَعْوَةَ الدَّاعِ إِذَا دَعَانِ ۖ فَلْيَسْتَجِيبُوا لِي وَلْيُؤْمِنُوا بِي لَعَلَّهُمْ يَرْشُدُونَ',
    source: 'سورة البقرة: 186',
    type: 'quran',
  },
  {
    id: '13',
    text: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا * وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ',
    source: 'سورة الطلاق: 2-3',
    type: 'quran',
  },
  {
    id: '14',
    text: 'اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ، وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا، وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ.',
    source: 'رواه الترمذي',
    type: 'sunnah',
  },
  {
    id: '15',
    text: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً ۚ إِنَّكَ أَنتَ الْوَهَّابُ',
    source: 'سورة آل عمران: 8',
    type: 'quran',
  },
  {
    id: '16',
    text: 'الْمُؤْمِنُ الْقَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اللَّهِ مِنَ الْمُؤْمِنِ الضَّعِيفِ، وَفِي كُلٍّ خَيْرٌ، احْرِصْ عَلَى مَا يَنْفَعُكَ، وَاسْتَعِنْ بِاللَّهِ وَلَا تَعْجِزْ.',
    source: 'رواه مسلم',
    type: 'sunnah',
  },
  {
    id: '17',
    text: 'الْقَلْبُ يَمْرَضُ كَمَا يَمْرَضُ الْبَدَنُ، وَشِفَاؤُهُ فِي التَّوْبَةِ وَالْحِمْيَةِ، وَيَصْدَأُ كَمَا تَصْدَأُ الْمِرْآةُ، وَجَلَاؤُهُ بِالذِّكْرِ.',
    source: 'ابن القيم رحمه الله',
    type: 'scholar',
  },
  {
    id: '18',
    text: 'وَقُل رَّبِّ زِدْنِي عِلْمًا',
    source: 'سورة طه: 114',
    type: 'quran',
  },
  {
    id: '19',
    text: 'مَنْ صَلَّى عَلَيَّ صَلَاةً وَاحِدَةً صَلَّى اللَّهُ عَلَيْهِ بِهَا عَشْرًا.',
    source: 'رواه مسلم',
    type: 'sunnah',
  },
  {
    id: '20',
    text: 'لَوْ عُرِضَتِ الْأَقْدَارُ عَلَى الْإِنْسَانِ، لَاخْتَارَ الْقَدَرَ الَّذِي اخْتَارَهُ اللَّهُ لَهُ.',
    source: 'عمر بن الخطاب رضي الله عنه',
    type: 'scholar',
  },
  {
    id: '21',
    text: 'فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ',
    source: 'سورة البقرة: 152',
    type: 'quran',
  },
  {
    id: '22',
    text: 'يَسِّرُوا وَلَا تُعَسِّرُوا، وَبَشِّرُوا وَلَا تُنَفِّرُوا.',
    source: 'متفق عليه',
    type: 'sunnah',
  },
  {
    id: '23',
    text: 'إِنَّ النَّفْسَ لَتَظْلَمُ وَتَجْزَعُ، حَتَّىٰ إِذَا رَضِيَتْ بِاللَّهِ وَبِقَضَائِهِ اطْمَأَنَّتْ وَسَكَنَتْ.',
    source: 'الحسن البصري رحمه الله',
    type: 'scholar',
  },
  {
    id: '24',
    text: 'وَاصْبِرْ لِحُكْمِ رَبِّكَ فَإِنَّكَ بِأَعْيُنِنَا ۖ وَسَبِّحْ بِحَمْدِ رَبِّكَ حِينَ تَقُومُ',
    source: 'سورة الطور: 48',
    type: 'quran',
  },
  {
    id: '25',
    text: 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ.',
    source: 'متفق عليه',
    type: 'sunnah',
  },
  {
    id: '26',
    text: 'مَنْ أَصْلَحَ سَرِيرَتَهُ أَصْلَحَ اللَّهُ عَلَانِيَتَهُ، وَمَنْ أَصْلَحَ مَا بَيْنَهُ وَبَيْنَ اللَّهِ أَصْلَحَ اللَّهُ مَا بَيْنَهُ وَبَيْنَ النَّاسِ.',
    source: 'سوفيان الثوري رحمه الله',
    type: 'scholar',
  },
  {
    id: '27',
    text: 'وَمَا كَانَ اللَّهُ لِيُعَذِّبَهُمْ وَأَنتَ فِيهِمْ ۚ وَمَا كَانَ اللَّهُ مُعَذِّبَهُمْ وَهُمْ يَسْتَغْفِرُونَ',
    source: 'سورة الأنفال: 33',
    type: 'quran',
  },
  {
    id: '28',
    text: 'الدَّالُّ عَلَى الْخَيْرِ كَفَاعِلِهِ.',
    source: 'رواه الترمذي',
    type: 'sunnah',
  },
  {
    id: '29',
    text: 'تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ.',
    source: 'رواه الترمذي',
    type: 'sunnah',
  },
  {
    id: '30',
    text: 'أَقْرَبُ مَا يَكُونُ الْعَبْدُ مِنْ رَبِّهِ وَهُوَ سَاجِدٌ، فَأَكْثِرُوا الدُّعَاءَ.',
    source: 'رواه مسلم',
    type: 'sunnah',
  }
];

export const FONTS_LIST = [
  { id: 'Amiri', name: 'خط أميري المشرّف', family: "'Amiri', serif" },
  { id: 'Cairo', name: 'خط القاهرة العصري', family: "'Cairo', sans-serif" },
  { id: 'Tajawal', name: 'خط تاجاول الناعم', family: "'Tajawal', sans-serif" },
  { id: 'Reem Kufi', name: 'الخط الكوفي الهندسي', family: "'Reem Kufi', sans-serif" },
  { id: 'El Messiri', name: 'خط المسيري الفني', family: "'El Messiri', sans-serif" },
  { id: 'Zain', name: 'خط زين المعاصر', family: "'Zain', sans-serif" },
  { id: 'Aref Ruqaa', name: 'خط الرقعة التراثي', family: "'Aref Ruqaa', serif" },
  { id: 'Almarai', name: 'خط المراعي المبسّط', family: "'Almarai', sans-serif" },
  { id: 'Beiruti', name: 'خط بيروتي الأنيق', family: "'Beiruti', sans-serif" },
  { id: 'Harmattan', name: 'خط حرمل القراءي', family: "'Harmattan', sans-serif" },
  { id: 'IBM Plex Sans Arabic', name: 'خط آي بي إم المتميز', family: "'IBM Plex Sans Arabic', sans-serif" },
  { id: 'Alexandria', name: 'خط الإسكندرية الفريد', family: "'Alexandria', sans-serif" },
  { id: 'Noto Naskh Arabic', name: 'خط النسخ الكلاسيكي', family: "'Noto Naskh Arabic', serif" },
  { id: 'Lemonada', name: 'خط ليمونادة الإبداعي', family: "'Lemonada', sans-serif" },
];

const dataURLtoFile = (dataurl: string, filename: string): File => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

export interface DailyQuotesWidgetProps {
  localTheme?: 'default' | 'emerald' | 'night' | 'ocean' | 'sunset' | 'rose' | 'midnight' | 'crimson';
  themeMode?: 'light' | 'dark';
  selectedFont?: string;
  setSelectedFont?: (font: string) => void;
  fontSize?: number;
  setFontSize?: (size: number) => void;
  onOpenSettings?: () => void;
}

export const DailyQuotesWidget: React.FC<DailyQuotesWidgetProps> = ({ 
  localTheme = 'default', 
  themeMode = 'light',
  selectedFont: propSelectedFont,
  setSelectedFont: propSetSelectedFont,
  fontSize: propFontSize,
  setFontSize: propSetFontSize,
  onOpenSettings
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSharing, setIsSharing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [cachedDataUrl, setCachedDataUrl] = useState<string | null>(null);
  
  const [internalSelectedFont, setInternalSelectedFont] = useState(() => {
    return safeLocalStorageGetItem('believer_quote_font') || 'Amiri';
  });
  const [internalFontSize, setInternalFontSize] = useState(() => {
    const saved = safeLocalStorageGetItem('believer_quote_font_size');
    return saved ? parseInt(saved, 10) : 24;
  });

  const selectedFont = propSelectedFont || internalSelectedFont;
  const setSelectedFont = (font: string) => {
    safeLocalStorageSetItem('believer_quote_font', font);
    if (propSetSelectedFont) {
      propSetSelectedFont(font);
    } else {
      setInternalSelectedFont(font);
    }
  };

  const fontSize = propFontSize || internalFontSize;
  const setFontSize = (sizeOrFn: number | ((prev: number) => number)) => {
    const nextSize = typeof sizeOrFn === 'function' ? sizeOrFn(fontSize) : sizeOrFn;
    safeLocalStorageSetItem('believer_quote_font_size', nextSize.toString());
    if (propSetFontSize) {
      propSetFontSize(nextSize);
    } else {
      setInternalFontSize(nextSize);
    }
  };

  const [showFontSettings, setShowFontSettings] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const quoteRef = useRef<HTMLDivElement>(null);

  const getCardThemeStyles = () => {
    const isDark = themeMode === 'dark';
    
    switch (localTheme) {
      case 'night':
        return {
          cardBg: isDark 
            ? "bg-gradient-to-br from-[#12102e] to-[#090817] border border-[#312e81]" 
            : "bg-gradient-to-br from-[#f5f6ff] to-[#ebedf5] border border-indigo-100",
          textColor: isDark ? "text-indigo-100" : "text-indigo-950",
          sourceColor: isDark ? "text-indigo-300" : "text-indigo-700/85",
          watermarkColor: isDark ? "text-indigo-400/80" : "text-indigo-800/80",
          quoteIconColor: isDark ? "text-indigo-500/20" : "text-indigo-300/30",
          patternClass: isDark ? "opacity-[0.04]" : "opacity-[0.025] invert"
        };
      case 'ocean':
        return {
          cardBg: isDark 
            ? "bg-gradient-to-br from-[#0c0c0c] to-[#010101] border border-[#0e7490]" 
            : "bg-[#012a3a] border border-amber-400/60 shadow-lg shadow-cyan-900/30",
          textColor: isDark ? "text-cyan-100" : "text-white",
          sourceColor: isDark ? "text-cyan-300" : "text-amber-300",
          watermarkColor: isDark ? "text-cyan-400/80" : "text-amber-400",
          quoteIconColor: isDark ? "text-cyan-500/20" : "text-cyan-300/15",
          patternClass: isDark ? "opacity-[0.04]" : "opacity-[0.05]"
        };
      case 'sunset':
        return {
          cardBg: isDark 
            ? "bg-gradient-to-br from-[#0a0a0a] to-[#010101] border border-[#7c2d12]" 
            : "bg-[#3a1a01] border border-cyan-400/60 shadow-lg shadow-orange-950/40",
          textColor: isDark ? "text-orange-100" : "text-white",
          sourceColor: isDark ? "text-orange-300" : "text-cyan-300",
          watermarkColor: isDark ? "text-orange-400/80" : "text-amber-400",
          quoteIconColor: isDark ? "text-orange-500/20" : "text-orange-300/15",
          patternClass: isDark ? "opacity-[0.04]" : "opacity-[0.05]"
        };
      case 'rose':
        return {
          cardBg: isDark 
            ? "bg-gradient-to-br from-[#0b0b0b] to-[#010101] border border-[#881337]" 
            : "bg-[#3a0115] border border-emerald-400/60 shadow-lg shadow-rose-950/40",
          textColor: isDark ? "text-rose-100" : "text-white",
          sourceColor: isDark ? "text-rose-300" : "text-emerald-300",
          watermarkColor: isDark ? "text-rose-400/80" : "text-amber-400",
          quoteIconColor: isDark ? "text-rose-500/20" : "text-rose-300/15",
          patternClass: isDark ? "opacity-[0.04]" : "opacity-[0.05]"
        };
      case 'midnight':
        return {
          cardBg: isDark 
            ? "bg-gradient-to-br from-[#090909] to-[#000000] border border-[#1e293b]" 
            : "bg-[#0f172a] border border-rose-400/60 shadow-lg shadow-slate-900/40",
          textColor: isDark ? "text-slate-100" : "text-white",
          sourceColor: isDark ? "text-slate-300" : "text-rose-300",
          watermarkColor: isDark ? "text-slate-400/80" : "text-amber-400",
          quoteIconColor: isDark ? "text-slate-500/20" : "text-slate-300/15",
          patternClass: isDark ? "opacity-[0.04]" : "opacity-[0.05]"
        };
      case 'emerald':
        return {
          cardBg: isDark 
            ? "bg-gradient-to-br from-[#070707] to-[#010101] border border-emerald-800" 
            : "bg-[#012a1a] border border-amber-400/60 shadow-lg shadow-emerald-950/40",
          textColor: isDark ? "text-emerald-50" : "text-white",
          sourceColor: isDark ? "text-emerald-300" : "text-amber-300",
          watermarkColor: isDark ? "text-emerald-400/80" : "text-amber-400",
          quoteIconColor: isDark ? "text-emerald-500/20" : "text-emerald-300/15",
          patternClass: isDark ? "opacity-[0.04]" : "opacity-[0.05]"
        };
      case 'default':
      default:
        return {
          cardBg: isDark 
            ? "bg-gradient-to-br from-[#060606] to-[#010101] border border-[#10402b]" 
            : "bg-[#052e16] border border-amber-400/60 shadow-lg shadow-emerald-950/40",
          textColor: isDark ? "text-emerald-100" : "text-white",
          sourceColor: isDark ? "text-emerald-300" : "text-amber-300",
          watermarkColor: isDark ? "text-emerald-400/80" : "text-amber-400",
          quoteIconColor: isDark ? "text-emerald-500/20" : "text-emerald-300/15",
          patternClass: isDark ? "opacity-[0.04]" : "opacity-[0.05]"
        };
    }
  };

  const themeStyles = getCardThemeStyles();

  // Auto-select a quote based on the day of the year
  useEffect(() => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    setCurrentIndex(dayOfYear % QUOTES.length);
  }, []);

  // Pre-generate the image to prevent async loss of user gesture in Web Share API
  useEffect(() => {
    setCachedDataUrl(null);
    const timer = setTimeout(async () => {
      if (!quoteRef.current) return;
      try {
        const dataUrl = await toPng(quoteRef.current, {
          quality: 0.95,
          pixelRatio: 2, // Lightweight but high resolution
          cacheBust: true,
          style: {
            transform: 'scale(1)',
          },
          filter: (node) => {
            if (node.nodeType === 1) {
              return !(node as Element).hasAttribute('data-html2canvas-ignore');
            }
            return true;
          }
        });
        setCachedDataUrl(dataUrl);
      } catch (err) {
        console.error('Error pre-generating image:', err);
      }
    }, 600); // 600ms allows the slide enter animation to complete fully

    return () => clearTimeout(timer);
  }, [currentIndex, selectedFont, fontSize, localTheme, themeMode]);

  const currentQuote = QUOTES[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % QUOTES.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + QUOTES.length) % QUOTES.length);
  };

  const generateImage = async () => {
    if (!quoteRef.current) return null;
    try {
      const dataUrl = await Promise.race([
        toPng(quoteRef.current, {
          quality: 0.95,
          pixelRatio: 2,
          cacheBust: true,
          style: {
            transform: 'scale(1)',
          },
          filter: (node) => {
            if (node.nodeType === 1) {
              return !(node as Element).hasAttribute('data-html2canvas-ignore');
            }
            return true;
          }
        }),
        new Promise<null>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
      ]);
      return dataUrl as string;
    } catch (err) {
      console.error('Error generating image:', err);
      return null;
    }
  };

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      let dataUrl = cachedDataUrl;
      if (!dataUrl) {
        dataUrl = await generateImage();
      }
      if (dataUrl) {
        download(dataUrl, `quote-${currentQuote.id}.png`);
        
        // Also copy text and show beautiful toast!
        try {
          await navigator.clipboard.writeText(`"${currentQuote.text}"\n— ${currentQuote.source}`);
        } catch (e) {
          console.error(e);
        }
        setToastMessage("تم نسخ النص وتحميل البطاقة بنجاح!");
        setTimeout(() => setToastMessage(null), 3000);
      }
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      let dataUrl = cachedDataUrl;
      if (!dataUrl) {
        // If clicked before cache is ready, generate it on demand
        dataUrl = await generateImage();
      }
      if (!dataUrl) return;

      // Fallback actions: copy text
      try {
        await navigator.clipboard.writeText(`"${currentQuote.text}"\n— ${currentQuote.source}`);
      } catch (e) {
        console.error(e);
      }
      
      // Show toast for feedback
      setToastMessage("تم تحضير البطاقة للمشاركة!");
      setTimeout(() => setToastMessage(null), 3000);

      try {
        // Check if Web Share API is supported and can share files
        if (navigator.share) {
          // Convert to file completely synchronously to preserve the user gesture
          const file = dataURLtoFile(dataUrl, `quote-${currentQuote.id}.png`);
          
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: 'بصائر المؤمن - اقتباس اليوم',
              text: currentQuote.text,
              files: [file],
            });
            return;
          }
        }
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Visual Canvas for Image Generation */}
      <div className="relative overflow-hidden rounded-2xl shadow-xl border border-slate-200/10 dark:border-slate-700/30">
        
        {/* Navigation & Formatting Controls Overlay (Not included in image) */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20 pointer-events-none">
          {/* Right side arrow */}
          <button 
            onClick={handlePrev} 
            className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 active:scale-90 transition-all border border-white/10 pointer-events-auto"
            title="السابق"
          >
            <ChevronRight size={16} />
          </button>

          {/* Left side arrow */}
          <button 
            onClick={handleNext} 
            className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/50 active:scale-90 transition-all border border-white/10 pointer-events-auto"
            title="التالي"
          >
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* Toast feedback notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: -20, x: "-50%" }}
              className="absolute top-6 left-1/2 -translate-x-1/2 z-[100] bg-teal-600 text-white px-5 py-2.5 rounded-2xl shadow-xl text-xs font-black flex items-center gap-2 border border-teal-500"
            >
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 
          This is the exact container that will be converted to an image.
          We use absolute sizing and positioning to ensure it looks perfect when exported.
        */}
        <div className="flex justify-center w-full">
          <div 
            ref={quoteRef}
            className={cn(
              "relative w-full aspect-auto min-h-[300px] flex flex-col items-center justify-center p-6 sm:p-10 md:p-14 overflow-hidden transition-all duration-300",
              themeStyles.cardBg
            )}
            style={{ direction: 'rtl' }}
          >
            {/* Background Pattern */}
            <div className={cn(
              "absolute inset-0 bg-[url('/images/arabesque.png')] transition-opacity duration-500",
              themeStyles.patternClass
            )} />
            
            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center h-full text-center space-y-5">
              <Quote size={38} className={cn("transition-colors duration-300 mb-1", themeStyles.quoteIconColor)} />
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuote.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5 flex flex-col items-center w-full"
                >
                  <p 
                    className={cn("font-medium leading-relaxed tracking-tight text-center transition-all duration-300", themeStyles.textColor)} 
                    style={{ 
                      lineHeight: '1.6',
                      fontFamily: FONTS_LIST.find(f => f.id === selectedFont)?.family || "'Amiri', serif",
                      fontSize: `${fontSize}px`
                    }}
                  >
                    {currentQuote.text}
                  </p>
                  
                  <div className="flex items-center gap-2 w-full justify-center">
                    <div className="h-[1px] w-8 bg-current opacity-30" />
                    <span className={cn("text-xs font-bold transition-all duration-300", themeStyles.sourceColor)}>
                      {currentQuote.source}
                    </span>
                    <div className="h-[1px] w-8 bg-current opacity-30" />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>


          </div>
        </div>
      </div>

      {/* Modern Collapsible Customization Tray */}
      <AnimatePresence>
        {!onOpenSettings && showFontSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 rounded-3xl p-5 space-y-4 shadow-sm">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-3">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                  <Type size={16} className="text-teal-500" />
                  <span className="text-xs font-black">تنسيق ونمط الخط للبطاقة</span>
                </div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  تخصيص البطاقة للمشاركة والتنزيل
                </span>
              </div>

              {/* Font Family List */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">نوع الخط:</span>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none snap-x">
                  {FONTS_LIST.map((font) => (
                    <button
                      key={font.id}
                      onClick={() => setSelectedFont(font.id)}
                      className={cn(
                        "px-3.5 py-2 rounded-xl border text-xs font-bold transition-all shrink-0 snap-center flex flex-col items-center gap-1 min-w-[100px]",
                        selectedFont === font.id
                          ? "bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-600/20"
                          : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-750 text-slate-700 dark:text-slate-300 hover:border-teal-500/30"
                      )}
                    >
                      <span className="text-[10px] opacity-60 font-sans">Aa</span>
                      <span style={{ fontFamily: font.family }} className="text-xs font-medium">{font.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font Size Adjuster */}
              <div className="flex items-center justify-between gap-4 pt-1">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">حجم الخط:</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">انقر للتكبير والتصغير</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={() => setFontSize(prev => Math.max(16, prev - 2))}
                    disabled={fontSize <= 16}
                    className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold hover:border-teal-500/30 active:scale-95 transition-all disabled:opacity-40 shadow-sm"
                    title="تصغير الخط"
                  >
                    أ-
                  </button>
                  <span className="text-xs font-black font-mono text-slate-800 dark:text-slate-200 min-w-[40px] text-center">
                    {fontSize}px
                  </span>
                  <button
                    onClick={() => setFontSize(prev => Math.min(36, prev + 2))}
                    disabled={fontSize >= 36}
                    className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold hover:border-teal-500/30 active:scale-95 transition-all disabled:opacity-40 shadow-sm"
                    title="تكبير الخط"
                  >
                    أ+
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action Buttons */}
      <div className="flex justify-center gap-2">
        <button 
          onClick={handleShare}
          disabled={isSharing || isDownloading}
          className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl py-2.5 px-6 font-bold text-sm transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 shadow-md shadow-teal-600/10"
        >
          {isSharing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Share2 size={16} />}
          مشاركة الصورة
        </button>
        <button 
          onClick={handleDownload}
          disabled={isSharing || isDownloading}
          className="bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl py-2.5 px-4 font-bold text-sm transition-all active:scale-95 flex items-center justify-center disabled:opacity-70"
        >
          {isDownloading ? <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-700 rounded-full animate-spin" /> : <Download size={18} />}
        </button>
      </div>
    </div>
  );
};
