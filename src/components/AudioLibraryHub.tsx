import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {  BookOpen, Mic2, CloudDownload, Star, 
  Radio, Podcast, SlidersHorizontal, PlayCircle, X, 
  FastForward, SkipForward, Timer,  Info, Search, Sparkles,
  ChevronLeft, ChevronRight, Music,  FolderHeart, Loader2,  ListMusic, FileCode, Smartphone, HardDrive,
  ChevronDown, ChevronUp,  Pause, HelpCircle, RefreshCw, Volume2,  BookOpenCheck, ScrollText, HeartPulse, Disc3 , Trash2, ShieldCheck, Play, CheckCircle2 } from 'lucide-react';
import JSZip from 'jszip';
import { cn } from '../lib/utils';
import { useAppContext } from '../AppContext';
import { useTranslation } from '../i18n';
import { BackButton } from './ui/BackButton';
import { EmptyStatePlaceholder } from './EmptyStatePlaceholder';
import { SCHOLARS } from '../data/lectures';
import { RECITERS } from '../reciters';
import { TAFSIR_SCHOLARS } from '../data/tafsir';
import { SURAH_NAMES } from '../utils/quranUtils';
import { lectureCacheService } from '../services/lectureCacheService';
import { audioCacheService } from '../services/audioCacheService';
import { useGlobalAudio } from '../context/GlobalAudioContext';
import { smartScholarMatch, smartReciterMatch, smartLectureMatch } from '../lib/arabicSearch';
import { AudioSearchAutocomplete } from './AudioSearchAutocomplete';
let isAudioSubRoutesPreloaded = false;
function preloadAudioSubRoutes() {
  if (isAudioSubRoutesPreloaded || typeof window === 'undefined') return;
  isAudioSubRoutesPreloaded = true;

  const triggerPreload = () => {
    import('./QuranAudioHub').catch(() => {});
    import('./QuranAudioReciter').catch(() => {});
    import('./QuranAudioDownloadsHub').catch(() => {});
    import('./LecturesAudioHub').catch(() => {});
    import('./TafsirAudioHub').catch(() => {});
    import('./RuqyahAudioHub').catch(() => {});
    import('./FavoriteRecitersPage').catch(() => {});
    import('./FavoriteScholarsPage').catch(() => {});
  };

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(triggerPreload, { timeout: 2500 });
  } else {
    setTimeout(triggerPreload, 200);
  }
}

// Generates an interactive offline-capable index player HTML
function generateHTMLOfflineIndex(quranMeta: any[], lectureMeta: any[]) {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>فهرس حقيبة أذكار المؤمن الصوتية</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&display=swap');
    body {
      font-family: 'Cairo', system-ui, -apple-system, sans-serif;
      background-color: #0f172a;
      color: #f1f5f9;
      margin: 0;
      padding: 0;
      direction: rtl;
    }
    header {
      background: linear-gradient(135deg, #0f766e, #115e59);
      padding: 3rem 1rem;
      text-align: center;
      border-bottom: 4px solid #14b8a6;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    }
    header h1 {
      font-size: 2rem;
      margin: 0 0 0.5rem 0;
      font-weight: 900;
      color: #ffffff;
      text-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    header p {
      font-size: 0.95rem;
      margin: 0;
      color: #ccfbf1;
    }
    .container {
      max-width: 800px;
      margin: 2rem auto;
      padding: 0 1rem;
    }
    .search-box {
      width: 100%;
      padding: 1rem 1.5rem;
      border-radius: 20px;
      border: 1px solid #334155;
      background-color: #1e293b;
      color: #fff;
      font-size: 1.1rem;
      box-sizing: border-box;
      margin-bottom: 2rem;
      outline: none;
      transition: all 0.3s;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.2);
    }
    .search-box:focus {
      border-color: #14b8a6;
      box-shadow: 0 0 10px rgba(20,184,166,0.3);
    }
    .stats {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      flex: 1;
      background-color: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      padding: 1rem;
      text-align: center;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
    }
    .stat-number {
      font-size: 1.5rem;
      font-weight: 900;
      color: #14b8a6;
    }
    .stat-label {
      font-size: 0.85rem;
      color: #94a3b8;
      margin-top: 0.25rem;
    }
    .section-title {
      font-size: 1.4rem;
      font-weight: 900;
      border-bottom: 2px solid #334155;
      padding-bottom: 0.5rem;
      margin-bottom: 1.2rem;
      color: #14b8a6;
    }
    .item-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 3rem;
    }
    .item-card {
      background-color: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      padding: 1rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      transition: transform 0.2s, border-color 0.2s;
    }
    .item-card:hover {
      transform: translateY(-2px);
      border-color: #14b8a6;
    }
    .item-info {
      flex-grow: 1;
      padding-left: 1rem;
    }
    .item-title {
      font-size: 1.05rem;
      font-weight: bold;
      margin: 0 0 0.25rem 0;
      color: #fff;
    }
    .item-meta {
      font-size: 0.85rem;
      color: #94a3b8;
    }
    .player-btn {
      background-color: #14b8a6;
      color: white;
      border: none;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      box-shadow: 0 4px 10px rgba(20,184,166,0.3);
      font-size: 1.1rem;
    }
    .player-btn:hover {
      background-color: #0d9488;
      transform: scale(1.05);
    }
    .audio-player {
      width: 100%;
      margin-top: 1rem;
      outline: none;
    }
    #playingContainer {
      display: none; 
      background: #1e293b; 
      border-radius: 20px; 
      padding: 1.5rem; 
      margin-bottom: 2rem; 
      border-right: 5px solid #14b8a6;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
    }
    footer {
      text-align: center;
      padding: 3rem 1rem;
      color: #64748b;
      font-size: 0.85rem;
      border-top: 1px solid #334155;
      background-color: #0b0f19;
    }
  </style>
</head>
<body>
  <header>
    <h1>حقيبة أذكار المؤمن الصوتية</h1>
    <p>جميع مستنداتك الصوتية المحملة مرتبة ومؤرشفة وتعمل بالكامل من ذاكرة الهاتف دون إنترنت</p>
  </header>
  
  <div class="container">
    <input type="text" id="searchInput" class="search-box" placeholder="ابحث في محتويات الحقيبة..." oninput="filterItems()">
    
    <div class="stats">
      <div class="stat-card">
        <div class="stat-number" id="quranCount">${quranMeta.length}</div>
        <div class="stat-label">أصوات قرآن كريم</div>
      </div>
      <div class="stat-card">
        <div class="stat-number" id="lecturesCount">${lectureMeta.length}</div>
        <div class="stat-label">محاضرات ودروس وتفسير</div>
      </div>
    </div>

    <!-- Active Player Region -->
    <div id="playingContainer">
      <h3 style="margin: 0 0 0.5rem 0;" id="nowPlayingTitle">جاري التشغيل...</h3>
      <p style="margin: 0 0 1rem 0; font-size: 0.9rem; color: #94a3b8;" id="nowPlayingMeta"></p>
      <audio id="globalAudio" controls class="audio-player"></audio>
    </div>

    ${quranMeta.length > 0 ? `
    <h2 class="section-title">📖 القرآن الكريم</h2>
    <div class="item-list" id="quranList">
      ${quranMeta.map((item) => `
        <div class="item-card" onclick="playTrack('القرآن الكريم/سورة ${item.surahName} - الشيخ ${item.reciterName}.mp3', 'سورة ${item.surahName}', 'الشيخ ${item.reciterName}')" data-search="سورة ${item.surahName} ${item.reciterName}">
          <div class="item-info">
            <h4 class="item-title">سورة ${item.surahName}</h4>
            <div class="item-meta">تلاوة الشيخ ${item.reciterName}</div>
          </div>
          <button class="player-btn">▶</button>
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${lectureMeta.length > 0 ? `
    <h2 class="section-title">🎙️ المحاضرات والدروس والتفسير</h2>
    <div class="item-list" id="lectureList">
      ${lectureMeta.map((item) => `
        <div class="item-card" onclick="playTrack('المحاضرات والدروس والتفسير/${item.title} - ${item.speaker}.mp3', '${item.title}', '${item.speaker}')" data-search="${item.title} ${item.speaker}">
          <div class="item-info">
            <h4 class="item-title">${item.title}</h4>
            <div class="item-meta">${item.speaker}</div>
          </div>
          <button class="player-btn">▶</button>
        </div>
      `).join('')}
    </div>
    ` : ''}

  </div>

  <footer>
    <p>تم تصدير وترتيب هذه الحقيبة الصوتية بواسطة تطبيق أذكار المؤمن</p>
    <p>استمع وتدبر أينما ذهبت دون انقطاع</p>
  </footer>

  <script>
    const globalAudio = document.getElementById('globalAudio');
    const playingContainer = document.getElementById('playingContainer');
    const nowPlayingTitle = document.getElementById('nowPlayingTitle');
    const nowPlayingMeta = document.getElementById('nowPlayingMeta');
    let currentPlayingIndex = -1;

    function playTrack(path, title, subtitle) {
      const cards = Array.from(document.querySelectorAll('.item-card'));
      currentPlayingIndex = cards.findIndex(card => card.getAttribute('data-search').includes(title));
      globalAudio.src = encodeURI(path);
      nowPlayingTitle.textContent = title;
      nowPlayingMeta.textContent = subtitle;
      playingContainer.style.display = 'block';
      globalAudio.play().catch(e => {
        alert("تنبيه: الرجاء التأكد من فك ضغط الملف بالكامل (Unzip) في ذاكرة هاتفك ثم فتح الفهرس لتتمكن من تشغيل الأصوات دون انترنت.");
      });
      
      // Scroll smoothly
      playingContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    globalAudio.addEventListener('ended', function() {
      const cards = Array.from(document.querySelectorAll('.item-card'));
      if (cards.length > 0 && currentPlayingIndex >= 0) {
        const nextIndex = (currentPlayingIndex + 1) % cards.length;
        const nextCard = cards[nextIndex];
        if (nextCard) {
          nextCard.click();
        }
      }
    });

    function filterItems() {
      const query = document.getElementById('searchInput').value.toLowerCase().trim();
      const cards = document.querySelectorAll('.item-card');
      
      cards.forEach(card => {
        const text = card.getAttribute('data-search').toLowerCase();
        if (text.includes(query)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    }
  </script>
</body>
</html>`;
}







export function AudioLibraryHub() {
  const navigate = useNavigate();
  const { settings, progress, updateSettings } = useAppContext();
  const { t, isRtl } = useTranslation(settings.appLanguage);
  const isDarkTheme = settings.theme === 'dark';
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [totalCacheSize, setTotalCacheSize] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Sate for custom export formats
  const [isExportingM3U, setIsExportingM3U] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [zipProgress, setZipProgress] = useState({ current: 0, total: 0, text: '' });
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  // Stats
  const { currentTrack, isPlaying, playTrack } = useGlobalAudio();
  const [quranMeta, setQuranMeta] = useState<any[]>([]);
  const [lectureMeta, setLectureMeta] = useState<any[]>([]);
  const [isListExpanded, setIsListExpanded] = useState(false);
  const [isHelpExpanded, setIsHelpExpanded] = useState(false);

  useEffect(() => {
    setQuranMeta(audioCacheService.getMetadataList());
    setLectureMeta(lectureCacheService.getMetadataList());
    preloadAudioSubRoutes();
  }, []);

  const refreshBagData = () => {
    setQuranMeta(audioCacheService.getMetadataList());
    setLectureMeta(lectureCacheService.getMetadataList());
  };

  const formatBagBytesSize = (bytes: number) => {
    if (!bytes || isNaN(bytes) || bytes <= 0) return '0 ميجابايت';
    const mb = bytes / (1024 * 1024);
    if (mb < 0.1) return 'أقل من 0.1 م.ب';
    return `${mb.toFixed(1)} م.ب`;
  };

  const handlePlayOfflineItem = (item: any, isQuran: boolean) => {
    if (isQuran) {
      playTrack({
        id: `quran-offline-${item.surahNumber}-${item.reciterId}`,
        title: `سورة ${item.surahName}`,
        subtitle: `الشيخ ${item.reciterName}`,
        audioUrl: item.url,
        type: 'quran',
        reciterId: item.reciterId,
        surahNumber: item.surahNumber
      });
    } else {
      playTrack({
        id: `lecture-offline-${item.lectureId}`,
        title: item.title,
        subtitle: item.speaker,
        audioUrl: item.url,
        type: 'lecture'
      });
    }
  };

  const handleDeleteOfflineItem = async (item: any, isQuran: boolean) => {
    const itemName = isQuran ? `سورة ${item.surahName}` : item.title;
    if (window.confirm(`هل أنت متأكد من حذف "${itemName}" من الحقيبة وهاتفك؟`)) {
      if (isQuran) {
        await audioCacheService.removeCachedAudio(item.url);
      } else {
        await lectureCacheService.removeCachedAudio(item.url);
      }
      refreshBagData();
      
      // Recalculate total cache size as well
      const lectureSize = await lectureCacheService.getTotalCacheSize();
      const quranSize = audioCacheService.getMetadataList().reduce((acc, m) => acc + (m.size || 0), 0);
      setTotalCacheSize(lectureSize + quranSize);
    }
  };

  const totalBagBytes = quranMeta.reduce((acc, m) => acc + (m.size || 0), 0) + lectureMeta.reduce((acc, m) => acc + (m.size || 0), 0);

  // Search Results using Smart Arabic Search
  const filteredReciters = RECITERS.filter(r => 
    smartReciterMatch(r, searchQuery)
  ).slice(0, 8);

  const filteredScholars = SCHOLARS.filter(s => 
    smartScholarMatch(s, searchQuery)
  ).slice(0, 10);

  const filteredLectures = SCHOLARS.flatMap(s => 
    s.series.flatMap(sr => sr.lectures.map(l => ({ ...l, scholarName: s.name })))
  ).filter(l => 
    smartLectureMatch(l, searchQuery)
  ).slice(0, 15);

  const hasResults = filteredReciters.length > 0 || filteredScholars.length > 0 || filteredLectures.length > 0;

  // Dynamic Content Generation
  const greetingMsg = "مرحبا بك";

  // Feature Random Lectures occasionally
  const featuredReciter = RECITERS[Math.floor(Math.random() * RECITERS.length)];
  const favoriteReciterList = RECITERS.filter(r => (progress.favoriteReciters || []).includes(r.id));
  const randomScholar = SCHOLARS[Math.floor(Math.random() * SCHOLARS.length)];
  const randomLecture = randomScholar?.series[0]?.lectures[0];

  useEffect(() => {
    const calculateTotalCache = async () => {
      const lectureSize = await lectureCacheService.getTotalCacheSize();
      const quranSize = audioCacheService.getMetadataList().reduce((acc, m) => acc + (m.size || 0), 0);
      setTotalCacheSize(lectureSize + quranSize);
      refreshBagData();
    };
    calculateTotalCache();
  }, [isSettingsOpen]);

  const clearAllCache = async () => {
    const confirmed = window.confirm('هل أنت متأكد من حذف جميع الملفات الصوتية المحملة (القرآن والمحاضرات)؟');
    if (confirmed) {
      await lectureCacheService.clearAllCache();
      audioCacheService.clearAllCache();
      setTotalCacheSize(0);
      setQuranMeta([]);
      setLectureMeta([]);
    }
  };

  const handleExportM3U = () => {
    if (quranMeta.length === 0 && lectureMeta.length === 0) {
      alert("عذراً، لا توجد أي ملفات صوتية محملة للاستماع إليها وتصديرها حالياً.");
      return;
    }
    
    setIsExportingM3U(true);
    try {
      let content = "#EXTM3U\n";
      content += "#PLAYLIST:مكتبة أذكار المؤمن الصوتية\n\n";
      
      quranMeta.forEach(item => {
        content += `#EXTINF:-1,الشيخ ${item.reciterName} - سورة ${item.surahName}\n`;
        content += `${item.url}\n\n`;
      });
      
      lectureMeta.forEach(item => {
        content += `#EXTINF:-1,${item.speaker} - ${item.title}\n`;
        content += `${item.url}\n\n`;
      });
      
      const blob = new Blob([content], { type: 'audio/x-mpegurl;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = 'أذكار_المؤمن_قائمة_التشغيل.m3u';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      
      setExportSuccess('m3u');
      setTimeout(() => setExportSuccess(null), 3000);
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء تصدير قائمة التشغيل.');
    } finally {
      setIsExportingM3U(false);
    }
  };

  const handleExportZip = async () => {
    if (quranMeta.length === 0 && lectureMeta.length === 0) {
      alert("عذراً، لم تقم بتحميل أي سورة أو درس بعد لتصدير الحقيبة الصوتية.");
      return;
    }
    
    setIsExportingZip(true);
    setZipProgress({ current: 0, total: quranMeta.length + lectureMeta.length, text: 'جاري البدء في تهيئة الحقيبة الصوتية...' });
    
    try {
      const zip = new JSZip();
      const quranCache = await caches.open('quran-offline-audio-v1');
      const lectureCache = await caches.open('lectures-offline-audio-v1');
      
      const qurFolder = zip.folder("القرآن الكريم");
      const lecFolder = zip.folder("المحاضرات والدروس والتفسير");
      
      let processed = 0;
      
      // Pack Quran
      for (const item of quranMeta) {
        setZipProgress(prev => ({
          ...prev,
          current: processed + 1,
          text: `أرشفة: سورة ${item.surahName} للمقرئ ${item.reciterName}`
        }));
        
        try {
          const res = await quranCache.match(item.url);
          if (res) {
            const blob = await res.blob();
            qurFolder?.file(`سورة ${item.surahName} - الشيخ ${item.reciterName}.mp3`, blob);
          }
        } catch (err) {
          console.warn('Skipping quran zip item:', err);
        }
        processed++;
      }
      
      // Pack Lectures
      for (const item of lectureMeta) {
        setZipProgress(prev => ({
          ...prev,
          current: processed + 1,
          text: `أرشفة: ${item.title}`
        }));
        
        try {
          const res = await lectureCache.match(item.url);
          if (res) {
            const blob = await res.blob();
            lecFolder?.file(`${item.title} - ${item.speaker}.mp3`, blob);
          }
        } catch (err) {
          console.warn('Skipping lecture zip item:', err);
        }
        processed++;
      }
      
      // Add Playlist
      let m3uContent = "#EXTM3U\n";
      quranMeta.forEach(item => {
        m3uContent += `#EXTINF:-1,الشيخ ${item.reciterName} - سورة ${item.surahName}\n`;
        m3uContent += `القرآن الكريم/سورة ${item.surahName} - الشيخ ${item.reciterName}.mp3\n\n`;
      });
      lectureMeta.forEach(item => {
        m3uContent += `#EXTINF:-1,${item.speaker} - ${item.title}\n`;
        m3uContent += `المحاضرات والدروس والتفسير/${item.title} - ${item.speaker}.mp3\n\n`;
      });
      zip.file("قائمة تشغيل الحقيبة.m3u", m3uContent);
      
      // Add Offline Index HTML File
      const indexHtml = generateHTMLOfflineIndex(quranMeta, lectureMeta);
      zip.file("فهرس الحقيبة الصوتي.html", indexHtml);
      
      setZipProgress(prev => ({ ...prev, text: 'جاري تجميع وضغط الصوتيات MP3 في ملف واحد... يرجى الانتظار.' }));
      
      const zipBlob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
        const percent = Math.round(metadata.percent);
        setZipProgress(prev => ({
          ...prev,
          text: `جاري ضغط وترتيب الملف الرمزية... ${percent}%`
        }));
      });
      
      const blobUrl = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = 'حقيبة_أذكار_المؤمن_الصوتية.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      
      setExportSuccess('zip');
      setTimeout(() => setExportSuccess(null), 3500);
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء ضغط الصوتيات.');
    } finally {
      setIsExportingZip(false);
      setZipProgress({ current: 0, total: 0, text: '' });
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col h-full flex-1 overflow-y-auto pb-24 px-4 w-full max-w-lg mx-auto">
      {/* Settings Panel */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
        {isSettingsOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white dark:bg-slate-900 rounded-t-[32px] p-8 z-[70] shadow-2xl border-t border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-fuchsia-100 dark:bg-fuchsia-900/30 flex items-center justify-center text-fuchsia-600 dark:text-fuchsia-400">
                    <SlidersHorizontal size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">إعدادات المكتبة</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">تخصيص تجربة الاستماع</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1 pb-4 custom-scrollbar">
                {/* Playback Speed */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-black text-slate-700 dark:text-slate-200">
                    <FastForward size={18} className="text-fuchsia-500" />
                    <span>سرعة التشغيل</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[0.75, 1, 1.25, 1.5, 2].map((speed) => (
                      <button
                        key={speed}
                        onClick={() => updateSettings({ audioPlaybackSpeed: speed })}
                        className={cn(
"px-4 py-2.5 rounded-xl text-sm font-bold transition-all transform transition-all duration-75 active:scale-[0.95] active:opacity-80",
                          settings.audioPlaybackSpeed === speed
                            ? "bg-fuchsia-600 text-white shadow-lg shadow-fuchsia-500/30 font-black scale-105"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                        )}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Auto Play Next */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <SkipForward size={18} className="text-blue-500" />
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">التشغيل التلقائي</h4>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold pr-6">تشغيل الحلقة أو السورة التالية تلقائياً</p>
                  </div>
                  <button
                    onClick={() => updateSettings({ audioAutoAdvance: !settings.audioAutoAdvance })}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative shadow-inner",
                      settings.audioAutoAdvance ? "bg-fuchsia-600" : "bg-slate-300 dark:bg-slate-700"
                    )}
                  >
                    <motion.div
                      animate={{ x: settings.audioAutoAdvance ? 24 : 4 }}
                      className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </button>
                </div>

                {/* Sleep Timer */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-black text-slate-700 dark:text-slate-200">
                    <Timer size={18} className="text-orange-500" />
                    <span>مؤقت النوم</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[0, 15, 30, 45, 60].map((mins) => (
                      <button
                        key={mins}
                        onClick={() => updateSettings({ audioSleepTimerMinutes: mins })}
                        className={cn(
"px-4 py-2.5 rounded-xl text-sm font-bold transition-all transform transition-all duration-75 active:scale-[0.95] active:opacity-80",
                          settings.audioSleepTimerMinutes === mins
                            ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-105 font-black"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200"
                        )}
                      >
                        {mins === 0 ? "إيقاف" : `${mins} د`}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Storage Management */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-black text-slate-700 dark:text-slate-200">
                    <CloudDownload size={18} className="text-teal-500" />
                    <span>التنزيلات العائمة</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight mb-1">المساحة المستخدمة</p>
                      <p className="text-xl font-black text-slate-900 dark:text-white">{formatSize(totalCacheSize)}</p>
                    </div>
                    <button
                      onClick={clearAllCache}
                      disabled={totalCacheSize === 0}
                      className={cn(
"px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 transform transition-all duration-75 active:scale-[0.95] active:opacity-80",
                        totalCacheSize > 0 
                          ? "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-100" 
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                      )}
                    >
                      <Trash2 size={14} />
                      مسح
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
        </AnimatePresence>,
        document.body
      )}

      {/* Sticky Header & Search Container */}
      <div className="sticky top-0 z-40 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur-xl -mx-4 px-4 pt-3 pb-3 border-b border-black/5 dark:border-white/5 shadow-sm space-y-3">
        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BackButton forceFallback={true} fallbackPath="/" />
            <div className="flex flex-col">
              <h1 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                 استمع
              </h1>
              <p className="text-[10px] font-bold text-fuchsia-600 dark:text-fuchsia-400">{greetingMsg}، استمع لما ينفعك</p>
            </div>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSettingsOpen(true)}
            className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-600 dark:text-slate-400 border border-black/5 shadow-sm hover:text-fuchsia-500 transition-colors"
          >
            <SlidersHorizontal size={20} />
          </motion.button>
        </div>

        {/* Smart Instant Autocomplete Search Bar */}
        <div>
          <AudioSearchAutocomplete
            searchQuery={searchQuery}
            onSearchChange={(q) => setSearchQuery(q)}
            placeholder="ابحث بحرية عن أي شيخ، قارئ، أو محاضرة..."
            isDarkTheme={isDarkTheme}
            onSelectScholar={(scholarId) => navigate('/lectures-audio', { state: { scholarId } })}
            onSelectReciter={(reciterId) => navigate(`/quran-audio/${reciterId}`)}
            onSelectLecture={(lecture) => navigate('/lectures-audio', { state: { searchQuery: lecture.title } })}
            onSelectTafsir={(tafsirScholarId) => navigate('/tafsir-audio', { state: { scholarId: tafsirScholarId } })}
          />
        </div>
      </div>

      <div className="flex flex-col gap-6 mt-4">

        {/* Search Results Display */}
        <AnimatePresence>
          {searchQuery.trim() !== '' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6"
            >
              {/* Reciters Results */}
              {filteredReciters.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider px-2 flex items-center justify-between">
                    <span>القراء</span>
                    <span className="bg-slate-200 dark:bg-slate-700 text-[10px] px-2 py-0.5 rounded-full">{filteredReciters.length}</span>
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {filteredReciters.map((reciter) => (
                      <button
                        key={reciter.id}
                        onClick={() => navigate(`/quran-audio/${reciter.id}`)}
                        className="flex items-center gap-4 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 transition-all text-right hover:border-teal-400 dark:hover:border-teal-600 shadow-sm group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 shrink-0 group-hover:scale-110 transition-transform">
                          <BookOpen size={18} />
                        </div>
                        <div className="flex-grow">
                          <p className="text-sm font-black text-slate-800 dark:text-white">{reciter.name}</p>
                          <p className="text-[10px] text-slate-500 font-bold">رواية {reciter.style}</p>
                        </div>
                        <ChevronLeft size={16} className="text-slate-400 opacity-50 transition-transform group-hover:-translate-x-1" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Scholars Results */}
              {filteredScholars.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider px-2 flex items-center justify-between">
                    <span>المشايخ</span>
                    <span className="bg-slate-200 dark:bg-slate-700 text-[10px] px-2 py-0.5 rounded-full">{filteredScholars.length}</span>
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {filteredScholars.map((scholar) => (
                      <button
                        key={scholar.id}
                        onClick={() => navigate('/lectures-audio', { state: { scholarId: scholar.id } })}
                        className="flex items-center gap-4 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 transition-all text-right hover:border-fuchsia-400 dark:hover:border-fuchsia-600 shadow-sm group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-fuchsia-50 dark:bg-fuchsia-900/30 flex items-center justify-center text-fuchsia-600 shrink-0 group-hover:scale-110 transition-transform">
                          <Mic2 size={16} />
                        </div>
                        <div className="flex-grow">
                          <p className="text-sm font-black text-slate-800 dark:text-white">{scholar.name}</p>
                          <p className="text-[10px] text-slate-500 font-bold">{scholar.series.length} سلاسل صوتية</p>
                        </div>
                        <ChevronLeft size={16} className="text-slate-400 opacity-50 transition-transform group-hover:-translate-x-1" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Lectures Results */}
              {filteredLectures.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider px-2 flex items-center justify-between">
                    <span>المحاضرات</span>
                    <span className="bg-slate-200 dark:bg-slate-700 text-[10px] px-2 py-0.5 rounded-full">{filteredLectures.length}</span>
                  </h3>
                  <div className="grid grid-cols-1 gap-2">
                    {filteredLectures.map((lecture) => (
                      <button
                        key={lecture.id}
                        onClick={() => navigate('/lectures-audio', { state: { searchQuery: lecture.title } })}
                        className="flex items-center gap-4 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 transition-all text-right hover:border-amber-400 shadow-sm group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 shrink-0 group-hover:scale-110 transition-transform">
                          <PlayCircle size={18} />
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="text-sm font-black text-slate-800 dark:text-white truncate">{lecture.title}</p>
                          <p className="text-[10px] text-slate-500 font-bold truncate">{lecture.scholarName}</p>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 shrink-0 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">{lecture.duration}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!hasResults && (
                <EmptyStatePlaceholder
                  title={`لا توجد نتائج بحث لـ "${searchQuery}"`}
                  variant="search"
                  action={
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="text-fuchsia-600 dark:text-fuchsia-400 text-xs font-black mt-3 px-4 py-2 bg-fuchsia-50 dark:bg-fuchsia-900/20 rounded-xl transform transition-all duration-75 active:scale-[0.95] active:opacity-80"
                    >
                      عرض المكتبة
                    </button>
                  }
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {searchQuery === '' && (
          <motion.div className="space-y-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            


            {/* Main Sections */}
            <div className="space-y-4 px-1">
               <div className="flex items-center justify-between px-1 mb-1">
                 <div className="flex items-center gap-2">
                   <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                   <h2 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                     {t('main_sections_title')}
                   </h2>
                 </div>
                 <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-200/40 dark:border-slate-800">
                   4 أقسام صوتية
                 </span>
               </div>
               
               <div className="grid grid-cols-1 gap-3.5">
                 {[
                   { 
                     id: 'quran', 
                     title: t('audio_quran_title'), 
                     desc: 'تلاوات خاشعة ومصاحف كاملة بأصوات أشهر القراء في العالم الإسلامي مع تنزيل مباشر', 
                     badgeText: '40+ قارئاً • مصحف كامل',
                     icon: BookOpenCheck, 
                     path: '/quran-audio', 
                     colorFrom: 'from-emerald-950 via-emerald-900 to-teal-950', 
                     borderColor: 'border-emerald-500/30 dark:border-emerald-500/40',
                     iconBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
                     accentColor: 'text-emerald-400',
                     badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                   },
                   { 
                     id: 'lectures', 
                     title: t('lectures_lessons_title'), 
                     desc: 'سلاسل علمية ومواعظ إيمانية لكبار العلماء والمشايخ في التفسير والسيرة والرقائق', 
                     badgeText: `${(progress.favoriteScholars || []).length > 0 ? `${(progress.favoriteScholars || []).length} مفضل • ` : ''}15+ شيخاً • سلاسل متكاملة`,
                     icon: Mic2, 
                     path: '/lectures-audio', 
                     colorFrom: 'from-slate-950 via-indigo-950 to-blue-950', 
                     borderColor: 'border-indigo-500/30 dark:border-indigo-500/40',
                     iconBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-400/30',
                     accentColor: 'text-indigo-400',
                     badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                   },
                   { 
                     id: 'tafsir', 
                     title: t('audio_tafsir_title'), 
                     desc: 'شرح وتأملات خاشعة لآيات الذكر الحكيم وتفسير السور وغريب القرآن بأصوات العلماء', 
                     badgeText: 'تفسير وتدبر • شروح السور',
                     icon: ScrollText, 
                     path: '/tafsir-audio', 
                     colorFrom: 'from-stone-950 via-amber-950 to-rose-950', 
                     borderColor: 'border-amber-500/30 dark:border-amber-500/40',
                     iconBg: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
                     accentColor: 'text-amber-400',
                     badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                   },
                   { 
                     id: 'ruqyah', 
                     title: t('audio_ruqyah_title'), 
                     desc: 'رقية شرعية مطولة وشاملة للتحصين والعلاج وبث السكينة والطمأنينة في البيت والنفس', 
                     badgeText: 'تحصين شامل • تلاوات شافية',
                     icon: ShieldCheck, 
                     path: '/ruqyah-audio', 
                     colorFrom: 'from-slate-950 via-purple-950 to-violet-950', 
                     borderColor: 'border-purple-500/30 dark:border-purple-500/40',
                     iconBg: 'bg-purple-500/20 text-purple-300 border-purple-400/30',
                     accentColor: 'text-purple-400',
                     badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                   },
                 ].map((item) => (
                   <button
                     key={item.id}
                     onClick={() => navigate(item.path)}
                     className={cn(
                       "w-full relative overflow-hidden rounded-[26px] p-5.5 flex items-start gap-4 group shadow-xl border transition-all duration-300 hover:scale-[1.015] active:scale-[0.98] bg-gradient-to-r text-right",
                       item.colorFrom,
                       item.borderColor
                     )}
                   >
                     {/* Background Arabesque Pattern */}
                     <div className="absolute inset-0 opacity-15 mix-blend-overlay pointer-events-none" style={{ backgroundImage: "url('/images/arabesque.png')" }} />
                     <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-white/10 blur-3xl rounded-full pointer-events-none" />

                     {/* Main Section Icon Container */}
                     <div className="relative shrink-0">
                       <div className={cn(
                         "w-15 h-15 rounded-2xl flex items-center justify-center border shadow-lg backdrop-blur-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300",
                         item.iconBg
                       )}>
                         <item.icon size={28} className="drop-shadow-md" />
                       </div>
                     </div>
                     
                     {/* Content Info */}
                     <div className="flex-grow min-w-0 pr-1">
                       <div className="flex items-center justify-between mb-1.5 gap-2">
                         <h3 className="text-xl font-black text-white leading-tight drop-shadow-sm flex items-center gap-2">
                           {item.title}
                         </h3>
                         
                         <span className={cn("text-[9.5px] font-black px-2.5 py-0.5 rounded-full border shrink-0 backdrop-blur-sm", item.badgeBg)}>
                           {item.badgeText}
                         </span>
                       </div>

                       <p className="font-semibold text-xs leading-relaxed text-slate-300/90 line-clamp-2 mb-3">
                         {item.desc}
                       </p>

                       <div className="flex items-center gap-1.5 text-xs font-black text-white/90 group-hover:text-white transition-colors">
                         <span>دخول القسم</span>
                         <ChevronLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                       </div>
                     </div>
                   </button>
                 ))}
               </div>
            </div>

             {/* Smart Media Exporter / internal storage file package compiler */}
             <div className="mx-1 bg-gradient-to-br from-teal-500/[0.08] via-emerald-500/[0.03] to-cyan-500/[0.08] dark:from-teal-500/[0.12] dark:via-emerald-500/[0.04] dark:to-cyan-500/[0.12] rounded-[36px] p-6 border border-teal-500/20 dark:border-teal-500/30 relative overflow-hidden shadow-xl shadow-teal-950/5">
               <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-teal-500/[0.03] to-transparent pointer-events-none" />
               
               {/* Header info bar */}
               <div className="flex items-center justify-between mb-4">
                 <div className="flex items-center gap-3">
                   <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 relative">
                     <Smartphone size={22} className="relative z-10 animate-pulse" />
                     <span className="absolute inset-0 bg-white/20 rounded-2xl blur-sm" />
                   </div>
                   <div>
                     <span className="text-[9px] bg-teal-500/20 dark:bg-teal-500/30 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded-full font-black uppercase tracking-wider block w-max mb-1">
                       ميزة الجيل الذكي
                     </span>
                     <h3 className="text-base font-black text-slate-800 dark:text-white leading-tight">الحقيبة الصوتية الذكية للهاتف</h3>
                   </div>
                 </div>
                 
                 {/* Storage Size Indicator */}
                 <div className="bg-slate-200/50 dark:bg-slate-900/40 px-3 py-1.5 rounded-full border border-black/5 dark:border-white/5 flex items-center gap-1.5 shrink-0">
                   <HardDrive size={13} className="text-teal-500" />
                   <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 antialiased">{formatBagBytesSize(totalBagBytes)}</span>
                 </div>
               </div>

               <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold mb-4">
                 قم بتجميع وأرشفة كافة السور والدروس الصوتية المحملة حالياً في ملف واحد منظم ذكي (ZIP). الحقيبة تحتوي على مشغل متطور يعمل دون الحاجة لشبكة الإنترنت على الإطلاق، ويمكنك تصدير قائمة تشغيل متوافقة مع جميع مشغلات الهاتف!
               </p>

               {/* Subsections & Interactions */}
               <div className="space-y-3 mb-5">
                 {/* 1. Bag Contents Accordion */}
                 <div className="space-y-1.5">
                   <button
                     type="button"
                     onClick={() => setIsListExpanded(!isListExpanded)}
                     className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-slate-100/50 dark:bg-slate-900/40 border border-slate-200/30 dark:border-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-900/70 transition-all text-xs font-black text-slate-700 dark:text-slate-300 group cursor-pointer"
                   >
                     <div className="flex items-center gap-2">
                       <ListMusic size={15} className="text-teal-500 group-hover:rotate-12 transition-transform" />
                       <span>عرض محتويات الحقيبة الموسعة</span>
                       <span className="bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 font-extrabold text-[10px] px-2 py-0.5 rounded-full">
                         {quranMeta.length + lectureMeta.length} ملفات
                       </span>
                     </div>
                     {isListExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                   </button>

                   <AnimatePresence>
                     {isListExpanded && (
                       <motion.div
                         initial={{ opacity: 0, height: 0 }}
                         animate={{ opacity: 1, height: 'auto' }}
                         exit={{ opacity: 0, height: 0 }}
                         className="overflow-hidden"
                       >
                         <div className="bg-slate-100/40 dark:bg-slate-900/20 border border-slate-200/20 dark:border-slate-800/20 rounded-2xl p-3 pr-1 space-y-1.5 max-h-[220px] overflow-y-auto custom-scrollbar">
                           {quranMeta.length === 0 && lectureMeta.length === 0 ? (
                             <div className="text-center py-6 text-slate-400 dark:text-slate-500 flex flex-col items-center justify-center gap-2">
                               <HelpCircle size={22} className="text-slate-300 dark:text-slate-600 animate-pulse" />
                               <p className="text-xs font-bold">حقيبتك ممتلئة بالسكينة لكنها خالية من الملفات الصوتية</p>
                               <p className="text-[10px] text-slate-400 max-w-[240px] leading-relaxed mx-auto">قم بتنزيل سور من قسم القرآن الكريم أو محاضرات من قسم الدروس لتظهر وتصنف تلقائياً هنا!</p>
                             </div>
                           ) : (
                             <>
                               {/* Quran Files */}
                               {quranMeta.map((item, idx) => (
                                 <div key={`quran-item-${item.url}-${idx}`} className="flex items-center justify-between p-2 rounded-xl bg-white/60 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900/80 transition-colors border border-black/[0.02] dark:border-white/[0.02]">
                                   <div className="flex items-center gap-2 min-w-0 flex-1 ml-2">
                                     <div className="w-7 h-7 rounded-lg bg-emerald-500/[0.12] text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                                       <BookOpen size={13} />
                                     </div>
                                     <div className="text-right min-w-0">
                                        <span className="block text-xs font-black text-slate-800 dark:text-slate-200 truncate">سورة {item.surahName}</span>
                                        <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 truncate">الشيخ: {item.reciterName}</span>
                                     </div>
                                   </div>
                                   
                                   <div className="flex items-center gap-1.5 shrink-0">
                                     <span className="text-[10px] font-bold text-slate-400 dir-ltr font-mono">{formatBagBytesSize(item.size)}</span>
                                     
                                     {/* Quick Play offline */}
                                     <button
                                       type="button"
                                       onClick={() => handlePlayOfflineItem(item, true)}
                                       className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 flex items-center justify-center text-slate-600 dark:text-slate-300 cursor-pointer transition-all active:scale-95"
                                       title="استماع فوري متصل للبطاقة"
                                     >
                                       <Play size={11} className="fill-current text-slate-500 dark:text-slate-400" />
                                     </button>

                                     {/* Delete Item */}
                                     <button
                                       type="button"
                                       onClick={() => handleDeleteOfflineItem(item, true)}
                                       className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 flex items-center justify-center text-rose-500 cursor-pointer transition-all active:scale-95"
                                       title="حذف من الحقيبة"
                                     >
                                       <Trash2 size={11} />
                                     </button>
                                   </div>
                                 </div>
                               ))}

                               {/* Lecture Files */}
                               {lectureMeta.map((item, idx) => (
                                 <div key={`lecture-item-${item.url}-${idx}`} className="flex items-center justify-between p-2 rounded-xl bg-white/60 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-900/80 transition-colors border border-black/[0.02] dark:border-white/[0.02]">
                                   <div className="flex items-center gap-2 min-w-0 flex-1 ml-2">
                                     <div className="w-7 h-7 rounded-lg bg-violet-500/[0.12] text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
                                       <Mic2 size={13} />
                                     </div>
                                     <div className="text-right min-w-0">
                                       <span className="block text-xs font-black text-slate-800 dark:text-slate-200 truncate">{item.title}</span>
                                       <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 truncate">{item.speaker}</span>
                                     </div>
                                   </div>
                                   
                                   <div className="flex items-center gap-1.5 shrink-0">
                                     <span className="text-[10px] font-bold text-slate-400 dir-ltr font-mono">{formatBagBytesSize(item.size)}</span>
                                     
                                     {/* Quick Play offline */}
                                     <button
                                       type="button"
                                       onClick={() => handlePlayOfflineItem(item, false)}
                                       className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 flex items-center justify-center text-slate-600 dark:text-slate-300 cursor-pointer transition-all active:scale-95"
                                       title="استماع فوري متصل للبطاقة"
                                     >
                                       <Play size={11} className="fill-current text-slate-500 dark:text-slate-400" />
                                     </button>

                                     {/* Delete Item */}
                                     <button
                                       type="button"
                                       onClick={() => handleDeleteOfflineItem(item, false)}
                                       className="w-7 h-7 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 flex items-center justify-center text-rose-500 cursor-pointer transition-all active:scale-95"
                                       title="حذف من الحقيبة"
                                     >
                                       <Trash2 size={11} />
                                     </button>
                                   </div>
                                 </div>
                               ))}
                             </>
                           )}
                         </div>
                       </motion.div>
                     )}
                   </AnimatePresence>
                 </div>

                 {/* 2. Help FAQ Accordion */}
                 <div className="space-y-1.5">
                   <button
                     type="button"
                     onClick={() => setIsHelpExpanded(!isHelpExpanded)}
                     className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-teal-500/[0.04] dark:bg-teal-500/[0.02] border border-teal-500/10 hover:bg-teal-500/10 dark:hover:bg-teal-500/[0.05] transition-all text-xs font-black text-teal-700 dark:text-teal-300 group cursor-pointer"
                   >
                     <div className="flex items-center gap-2">
                       <HelpCircle size={15} className="text-teal-500 group-hover:rotate-[360deg] transition-all duration-500" />
                       <span>أين وكيف أستخدم الحقيبة بعد تصديرها؟</span>
                     </div>
                     {isHelpExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                   </button>

                   <AnimatePresence>
                     {isHelpExpanded && (
                       <motion.div
                         initial={{ opacity: 0, height: 0 }}
                         animate={{ opacity: 1, height: 'auto' }}
                         exit={{ opacity: 0, height: 0 }}
                         className="overflow-hidden"
                       >
                         <div className="bg-teal-500/[0.01] dark:bg-white/[0.01] border border-teal-500/[0.08] rounded-2xl p-4 pr-5 space-y-3.5 text-xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed relative">
                           <div className="flex gap-2.5 items-start">
                             <span className="w-5 h-5 shrink-0 bg-teal-500/20 text-teal-600 dark:text-teal-400 rounded-lg flex items-center justify-center font-black text-[10px]">١</span>
                             <p>ستجد ملفاً مضغوطاً في مجلد التنزيلات بهاتفك باسم <span className="font-extrabold text-teal-600 dark:text-teal-400">أذكار_المؤمن_حقيبة_صوتية.zip</span>.</p>
                           </div>
                           <div className="flex gap-2.5 items-start">
                             <span className="w-5 h-5 shrink-0 bg-teal-500/20 text-teal-600 dark:text-teal-400 rounded-lg flex items-center justify-center font-black text-[10px]">٢</span>
                             <p>قم بفك الضغط عنه لتجد المجلدات المنظمة لـ <span className="font-black">سور القرآن</span> و <span className="font-black">المحاضرات</span> ومساراً كاملاً للتشغيل المباشر.</p>
                           </div>
                           <div className="flex gap-2.5 items-start">
                             <span className="w-5 h-5 shrink-0 bg-teal-500/20 text-teal-600 dark:text-teal-400 rounded-lg flex items-center justify-center font-black text-[10px]">٣</span>
                             <p>افتح ملف الفهرس <span className="font-extrabold text-teal-600 dark:text-teal-400">فهرس الحقيبة الصوتي.html</span> المرفق للاستماع عبر واجهة مشغل متكاملة بالمتصفح ودون نت، أو شغل <span className="font-black">M3U</span> عبر مشغلات الصوت مثل VLC.</p>
                           </div>
                         </div>
                       </motion.div>
                     )}
                   </AnimatePresence>
                 </div>
               </div>

               {/* Export Action Buttons */}
               <div className="flex flex-col gap-2 relative z-10">
                 {/* 1. ZIP Pack Exporter */}
                 <button
                   onClick={handleExportZip}
                   disabled={isExportingZip || (quranMeta.length === 0 && lectureMeta.length === 0)}
                   className={cn(
                     "w-full h-12 rounded-xl flex items-center justify-center gap-3 font-black text-xs transition-all border cursor-pointer",
                     (quranMeta.length === 0 && lectureMeta.length === 0)
                       ? "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed"
                       : isExportingZip
                         ? "bg-slate-50 dark:bg-slate-800 border-slate-200 text-teal-600 cursor-wait"
                         : exportSuccess === 'zip'
                           ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                           : "bg-teal-600 text-white border-teal-600 hover:bg-teal-700 shadow-md shadow-teal-600/10 active:scale-[0.99]"
                   )}
                 >
                   {isExportingZip ? (
                     <>
                       <Loader2 size={16} className="animate-spin" />
                       <span className="truncate">جاري تصنيف وضغط الملفات... {zipProgress.current}/{zipProgress.total}</span>
                     </>
                   ) : exportSuccess === 'zip' ? (
                     <>
                       <CheckCircle2 size={16} />
                       <span>تم حفظ الحقيبة بنجاح بمجلد التنزيلات!</span>
                     </>
                   ) : (
                     <>
                       <HardDrive size={16} />
                       <span>تصدير الحقيبة الصوتية المنظمة (ZIP)</span>
                     </>
                   )}
                 </button>

                 {/* 2. M3U Playlist Exporter */}
                 <button
                   onClick={handleExportM3U}
                   disabled={isExportingM3U || (quranMeta.length === 0 && lectureMeta.length === 0)}
                   className={cn(
                     "w-full h-12 rounded-xl flex items-center justify-center gap-3 font-black text-xs transition-all border cursor-pointer",
                     (quranMeta.length === 0 && lectureMeta.length === 0)
                       ? "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-400 cursor-not-allowed"
                       : isExportingM3U
                         ? "bg-slate-50 dark:bg-slate-800 border-slate-200 text-teal-600 cursor-wait"
                         : exportSuccess === 'm3u'
                           ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                           : "bg-transparent text-teal-600 dark:text-teal-400 border-teal-500/30 hover:bg-teal-500/15 active:scale-[0.99]"
                   )}
                 >
                   {isExportingM3U ? (
                     <Loader2 size={16} className="animate-spin" />
                   ) : exportSuccess === 'm3u' ? (
                     <CheckCircle2 size={16} />
                   ) : (
                     <ListMusic size={16} />
                   )}
                   <span>{exportSuccess === 'm3u' ? 'تم تنزيل قائمة التشغيل بنجاح!' : 'تصدير قائمة تشغيل هاتف ذكية (M3U)'}</span>
                 </button>
               </div>

               {/* Zip Processing Message */}
               <AnimatePresence>
                 {isExportingZip && zipProgress.text && (
                   <motion.div
                     initial={{ opacity: 0, height: 0 }}
                     animate={{ opacity: 1, height: 'auto' }}
                     exit={{ opacity: 0, height: 0 }}
                     className="mt-4 pt-4 border-t border-teal-500/20"
                   >
                     <p className="text-[10px] font-bold text-teal-600 dark:text-teal-400 text-center animate-pulse">
                       {zipProgress.text}
                     </p>
                     
                     <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2 border border-black/5">
                       <div 
                         className="h-full bg-teal-500 rounded-full transition-all duration-300"
                         style={{ width: `${zipProgress.total > 0 ? (zipProgress.current / zipProgress.total) * 100 : 0}%` }}
                       />
                     </div>
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>

            {/* User Library Actions */}
            <div className="space-y-3 px-1">
               <div className="flex items-center justify-between px-1">
                 <h2 className="text-sm font-black text-slate-800 dark:text-slate-200">مكتبتي الخاصة</h2>
               </div>
               <div className="grid grid-cols-2 gap-3">
                 <button
                   onClick={() => navigate('/quran-audio/downloads')}
                   className="flex items-center gap-3 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-black/5 shadow-sm hover:shadow-md transition-all group"
                 >
                   <div className="w-12 h-12 rounded-[1.2rem] flex items-center justify-center bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:-translate-y-1 transition-transform">
                     <CloudDownload size={22} />
                   </div>
                   <div className="text-right">
                     <span className="block text-[13px] font-black text-slate-800 dark:text-slate-100">التنزيلات</span>
                     <span className="text-[10px] font-bold text-slate-500">حفظ دون إنترنت</span>
                   </div>
                 </button>
                 
                 <button
                   onClick={() => navigate('/lectures-audio')}
                   className="flex items-center gap-3 p-4 rounded-3xl bg-white dark:bg-slate-900 border border-black/5 shadow-sm hover:shadow-md transition-all group"
                 >
                   <div className="w-12 h-12 rounded-[1.2rem] flex items-center justify-center bg-amber-50 dark:bg-amber-900/30 text-amber-500 group-hover:-translate-y-1 transition-transform">
                     <Star size={18} className="fill-current" />
                   </div>
                   <div className="text-right">
                     <span className="block text-[13px] font-black text-slate-800 dark:text-slate-100">المفضلة</span>
                     <span className="text-[10px] font-bold text-slate-500">محاضرات ومفضلين</span>
                   </div>
                 </button>
               </div>
            </div>

            {/* Removed Soon Features block */}
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default AudioLibraryHub;
