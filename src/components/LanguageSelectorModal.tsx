import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Check, X, Search, Sparkles } from 'lucide-react';
import { SUPPORTED_LANGUAGES, LanguageMeta } from '../i18n/languages';
import { useAppContext } from '../AppContext';
import { useTranslation } from '../i18n';
import { cn } from '../lib/utils';

interface LanguageSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings } = useAppContext();
  const { t, isRtl } = useTranslation(settings.appLanguage);
  const [searchQuery, setSearchQuery] = useState('');

  const currentLang = settings.appLanguage || 'ar';

  const filteredLanguages = SUPPORTED_LANGUAGES.filter((lang) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      lang.nativeName.toLowerCase().includes(q) ||
      lang.name.toLowerCase().includes(q) ||
      lang.id.toLowerCase().includes(q) ||
      lang.region.toLowerCase().includes(q)
    );
  });

  const handleSelectLanguage = (langId: LanguageMeta['id']) => {
    updateSettings({ appLanguage: langId });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm cursor-pointer"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg bg-slate-900 border border-white/15 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]"
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className="p-5 border-b border-white/10 bg-slate-800/80 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 shadow-inner">
                  <Globe size={20} className="animate-spin-slow" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                    {t('language', 'لغة التطبيق')}
                  </h3>
                  <p className="text-xs font-bold text-white/60">
                    {t('choose_language', 'اختر اللغة المناسبة لتجربة مخصصة')}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
                title={t('close', 'إغلاق')}
              >
                <X size={16} />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4 border-b border-white/10 bg-black/20">
              <div className="relative">
                <Search size={16} className={cn("absolute top-1/2 -translate-y-1/2 text-white/40", isRtl ? "right-3.5" : "left-3.5")} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search_language', 'البحث عن لغة...')}
                  className={cn(
                    "w-full bg-white/5 border border-white/10 rounded-xl py-2.5 text-xs sm:text-sm font-black text-white placeholder:text-white/40 focus:outline-none focus:border-teal-400 focus:bg-white/10 transition-all",
                    isRtl ? "pr-10 pl-3.5" : "pl-10 pr-3.5"
                  )}
                />
              </div>
            </div>

            {/* Language List */}
            <div className="p-4 overflow-y-auto space-y-2.5 flex-1 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredLanguages.map((lang) => {
                  const isSelected = currentLang === lang.id;
                  return (
                    <button
                      key={lang.id}
                      onClick={() => handleSelectLanguage(lang.id)}
                      className={cn(
                        "p-3.5 rounded-2xl transition-all flex items-center justify-between border cursor-pointer active:scale-[0.98] text-left",
                        isSelected
                          ? "bg-gradient-to-r from-teal-500/25 to-emerald-500/25 border-teal-400 text-white shadow-lg shadow-teal-500/20 ring-1 ring-teal-400/50"
                          : "bg-white/5 border-white/10 text-white/85 hover:bg-white/10 hover:border-white/20"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl drop-shadow-sm">{lang.flag}</span>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-black text-sm text-white">
                              {lang.nativeName}
                            </span>
                            {lang.popular && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-black">
                                {t('popular', 'شائع')}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] font-bold text-white/50">
                            {lang.name} • {lang.dir.toUpperCase()}
                          </p>
                        </div>
                      </div>

                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center shadow-md">
                          <Check size={14} className="stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-white/20" />
                      )}
                    </button>
                  );
                })}
              </div>

              {filteredLanguages.length === 0 && (
                <div className="text-center py-8 text-white/50 font-bold text-xs">
                  {t('no_languages_found', 'لم يتم العثور على لغات مطابقة')}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/10 bg-slate-900/90 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-teal-400">
                <Sparkles size={14} />
                <span>{t('instant_language_switch', 'يتم تطبيق اللغة فوراً على كافة صفحات التطبيق')}</span>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-black text-xs transition-colors cursor-pointer"
              >
                {t('done', 'تم')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
