import fs from 'fs';

let content = fs.readFileSync('src/components/OfflineManager.tsx', 'utf-8');

// 1. Add reciter to useQuranSettings
content = content.replace(
  "const { tafsirType, recitation } = useQuranSettings();",
  "const { tafsirType, recitation, reciter } = useQuranSettings();"
);

// 2. Add state for Hadith download and Audio download
const stateAddition = `
  const [hadithDownloadStatus, setHadithDownloadStatus] = useState<{isDownloaded: boolean, progress: number, isDownloading: boolean}>({
    isDownloaded: localStorage.getItem('hadiths_offline') === 'true',
    progress: 0,
    isDownloading: false
  });
  const hadithAbortController = useRef<AbortController | null>(null);

  const [audioDownloadStatus, setAudioDownloadStatus] = useState<{isDownloaded: boolean, progress: number, isDownloading: boolean}>({
    isDownloaded: false,
    progress: 0,
    isDownloading: false
  });
  const audioAbortController = useRef<AbortController | null>(null);
`;

content = content.replace(
  "const textAbortController = useRef<AbortController | null>(null);",
  "const textAbortController = useRef<AbortController | null>(null);" + stateAddition
);

// 3. Update checkStorageStatus
const checkStorageAddition = `
    // Check Quran audio offline status
    let hasAllAudio = true;
    for (let s = 1; s <= 114; s++) {
      const hasAudio = await quranOfflineService.isSurahAudioDownloaded(s, reciter);
      if (!hasAudio) {
        hasAllAudio = false;
        break;
      }
    }
    setAudioDownloadStatus(prev => ({ ...prev, isDownloaded: hasAllAudio }));
`;

content = content.replace(
  "setTextDownloadStatus(prev => ({ ...prev, isDownloaded: hasAllText }));",
  checkStorageAddition + "\n    setTextDownloadStatus(prev => ({ ...prev, isDownloaded: hasAllText }));"
);

// 4. Add dependencies to useEffect
content = content.replace(
  "[tafsirType, recitation]",
  "[tafsirType, recitation, reciter]"
);

// 5. Add handlers for Hadith and Audio
const handlersAddition = `
  const handleDownloadAllHadiths = async () => {
    if (!isOnline) return;
    setHadithDownloadStatus({ isDownloaded: false, progress: 0, isDownloading: true });
    hadithAbortController.current = new AbortController();
    
    try {
      const { hadithService } = await import('../services/hadithService');
      await hadithService.downloadAllHadiths(
        (progress) => setHadithDownloadStatus(prev => ({ ...prev, progress })),
        hadithAbortController.current.signal
      );
      setHadithDownloadStatus({ isDownloaded: true, progress: 100, isDownloading: false });
      localStorage.setItem('hadiths_offline', 'true');
    } catch (e: any) {
      if (e.message !== 'تم إلغاء التحميل') {
        alert("حدث خطأ أثناء تحميل الأحاديث. يرجى المحاولة مرة أخرى.");
      }
      setHadithDownloadStatus(prev => ({ ...prev, isDownloading: false, progress: 0 }));
    }
  };

  const handleDownloadFullAudio = async () => {
    if (!isOnline) return;
    
    setAudioDownloadStatus({ isDownloaded: false, progress: 0, isDownloading: true });
    audioAbortController.current = new AbortController();
    
    try {
      await quranOfflineService.downloadFullQuranAudio(
        reciter,
        (progress) => setAudioDownloadStatus(prev => ({ ...prev, progress })),
        audioAbortController.current.signal
      );
      setAudioDownloadStatus({ isDownloaded: true, progress: 100, isDownloading: false });
    } catch (e: any) {
      if (e.message !== 'تم إلغاء التحميل') {
        alert("حدث خطأ أثناء تحميل التلاوة. قد تستغرق مساحة كبيرة.");
      }
      setAudioDownloadStatus(prev => ({ ...prev, isDownloading: false, progress: 0 }));
    }
  };

  const handleRemoveFullAudio = async () => {
    if (window.confirm('هل أنت متأكد من حذف جميع التلاوات الصوتية المحملة؟')) {
      await quranOfflineService.removeFullQuranAudio(reciter);
      setAudioDownloadStatus({ isDownloaded: false, progress: 0, isDownloading: false });
    }
  };
`;

content = content.replace(
  "const handleRemoveFullText = async () => {",
  handlersAddition + "\n  const handleRemoveFullText = async () => {"
);

// 6. Add UI sections for Hadith and Audio
const uiAddition = `
          {/* Audio Section */}
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center">
                  <Database size={20} />
                </div>
                <div>
                  <h5 className="text-sm font-black text-white">التلاوة الصوتية للقرآن</h5>
                  <p className="text-[10px] text-white/40 font-bold">للقارئ المحدد حالياً</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {audioDownloadStatus.isDownloaded ? (
                  <button 
                    onClick={handleRemoveFullAudio}
                    className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500/20 transition-all shadow-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      if (audioDownloadStatus.isDownloading) {
                         audioAbortController.current?.abort();
                         setAudioDownloadStatus(prev => ({ ...prev, isDownloading: false, progress: 0 }));
                      } else {
                         handleDownloadFullAudio();
                      }
                    }}
                    disabled={!isOnline && !audioDownloadStatus.isDownloading}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all",
                      !isOnline && !audioDownloadStatus.isDownloading
                        ? "bg-white/5 text-white/20 cursor-not-allowed"
                        : audioDownloadStatus.isDownloading
                          ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                          : "bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-600/20 active:scale-95"
                    )}
                  >
                    {audioDownloadStatus.isDownloading ? (
                      <>
                        <WifiOff size={14} />
                        إيقاف
                      </>
                    ) : (
                      <>
                        <Download size={14} />
                        تحميل
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            
            {audioDownloadStatus.isDownloading && (
              <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-indigo-500 transition-all duration-300"
                  style={{ width: \`\${audioDownloadStatus.progress}%\` }}
                />
              </div>
            )}
          </div>

          {/* Hadith Section */}
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
                  <Database size={20} />
                </div>
                <div>
                  <h5 className="text-sm font-black text-white">الأحاديث النبوية</h5>
                  <p className="text-[10px] text-white/40 font-bold">تحميل قاعدة الأحاديث الشريفة</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {hadithDownloadStatus.isDownloaded ? (
                  <button 
                    onClick={() => {
                      if(window.confirm("هل متأكد من حذف قاعدة الأحاديث؟")) {
                        localStorage.removeItem('hadiths_offline');
                        setHadithDownloadStatus({ isDownloaded: false, progress: 0, isDownloading: false });
                      }
                    }}
                    className="p-2.5 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-500/20 transition-all shadow-sm"
                  >
                    <Trash2 size={16} />
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      if (hadithDownloadStatus.isDownloading) {
                         hadithAbortController.current?.abort();
                         setHadithDownloadStatus(prev => ({ ...prev, isDownloading: false, progress: 0 }));
                      } else {
                         handleDownloadAllHadiths();
                      }
                    }}
                    disabled={!isOnline && !hadithDownloadStatus.isDownloading}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all",
                      !isOnline && !hadithDownloadStatus.isDownloading
                        ? "bg-white/5 text-white/20 cursor-not-allowed"
                        : hadithDownloadStatus.isDownloading
                          ? "bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                          : "bg-teal-600 text-white hover:bg-teal-700 shadow-lg shadow-teal-600/20 active:scale-95"
                    )}
                  >
                    {hadithDownloadStatus.isDownloading ? (
                      <>
                        <WifiOff size={14} />
                        إيقاف
                      </>
                    ) : (
                      <>
                        <Download size={14} />
                        تحميل
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
            
            {hadithDownloadStatus.isDownloading && (
              <div className="relative h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="absolute inset-y-0 left-0 bg-blue-500 transition-all duration-300"
                  style={{ width: \`\${hadithDownloadStatus.progress}%\` }}
                />
              </div>
            )}
          </div>
`;

content = content.replace(
  "{/* Full Quran Text Section */}",
  uiAddition + "\n          {/* Full Quran Text Section */}"
);

fs.writeFileSync('src/components/OfflineManager.tsx', content);
