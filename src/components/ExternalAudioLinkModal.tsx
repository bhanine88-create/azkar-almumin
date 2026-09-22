import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ExternalLink, Copy, Check, Headphones, Download, X, Globe, Radio } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface ExternalAudioLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  sourceLabel: string;
  url: string;
  type: 'listen' | 'download';
}

export const ExternalAudioLinkModal: React.FC<ExternalAudioLinkModalProps> = ({
  isOpen,
  onClose,
  title,
  sourceLabel,
  url,
  type,
}) => {
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  const handleCopy = useCallback(async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = url;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  }, [url]);

  const handleGoToAudioHub = useCallback(() => {
    onClose();
    navigate('/audio');
  }, [navigate, onClose]);

  if (!isOpen) return null;

  // Domain display helper
  let domain = 'موقع إسلامي موثوق';
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('binbaz.org.sa')) {
      domain = 'الموقع الرسمي لسماحة الشيخ ابن باز (binbaz.org.sa)';
    } else if (parsed.hostname.includes('islamway.net')) {
      domain = 'شبكة طريق الإسلام (islamway.net)';
    } else if (parsed.hostname.includes('ibnothaimeen.net')) {
      domain = 'الموقع الرسمي للشيخ ابن عثيمين (ibnothaimeen.net)';
    } else {
      domain = parsed.hostname;
    }
  } catch (e) {
    domain = url;
  }

  return (
    <AnimatePresence>
      <div 
        id="external-audio-modal-overlay" 
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          id="external-audio-modal-content"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg rounded-3xl bg-gradient-to-b from-[#063b28] via-[#04281b] to-[#021810] border-2 border-[#feb10b]/60 p-6 sm:p-7 shadow-2xl text-white overflow-hidden text-right"
          dir="rtl"
        >
          {/* Subtle Arabesque Pattern Glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#feb10b]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-5 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-black/50 border border-[#feb10b]/50 flex items-center justify-center text-[#feb10b] shadow-inner">
                {type === 'listen' ? (
                  <Headphones className="w-6 h-6" />
                ) : (
                  <Download className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-[#feb10b]">
                  {type === 'listen' ? 'رابط الاستماع للشرح الصوتي' : 'رابط تحميل الشرح الصوتي'}
                </h3>
                <p className="text-xs text-emerald-200/80 font-medium mt-0.5">
                  فتح المصدر الصوتي المعتمد مباشرة
                </p>
              </div>
            </div>

            <button
              id="close-external-audio-modal-btn"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Details Card */}
          <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/30 mb-5 space-y-2 relative z-10">
            <div className="text-sm font-black text-white leading-snug">
              {title}
            </div>
            <div className="text-xs text-[#feb10b] font-bold">
              {sourceLabel}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-300/80 pt-1 border-t border-emerald-500/20">
              <Globe className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
              <span className="truncate">{domain}</span>
            </div>
          </div>

          {/* Guidance note */}
          <p className="text-xs text-slate-300 leading-relaxed mb-6 relative z-10 bg-emerald-950/40 p-3 rounded-xl border border-emerald-500/20">
            💡 إذا لم يفتح الرابط تلقائياً بسبب حماية المتصفح أو قيود النوافذ المنبثقة، يمكنك الضغط مباشرة على زر <strong>"فتح الموقع الآن"</strong> أو <strong>"نسخ الرابط"</strong> ولصقه في المتصفح.
          </p>

          {/* Actions */}
          <div className="space-y-3 relative z-10">
            {/* Direct Open Link */}
            <a
              id="open-external-site-direct-btn"
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#feb10b] hover:bg-[#fec84b] active:scale-[0.98] text-[#042418] font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#feb10b]/20 transition-all cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>فتح الموقع الآن في المتصفح</span>
            </a>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Copy Link Button */}
              <button
                id="copy-external-url-btn"
                onClick={handleCopy}
                className="py-3 px-3 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-[0.98] border border-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-300">تم النسخ بنجاح!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-[#feb10b]" />
                    <span>نسخ رابط المصدر</span>
                  </>
                )}
              </button>

              {/* In-app Audio Library Alternative */}
              <button
                id="go-to-audio-library-btn"
                onClick={handleGoToAudioHub}
                className="py-3 px-3 rounded-2xl bg-emerald-900/60 hover:bg-emerald-800/80 active:scale-[0.98] border border-emerald-500/40 text-[#feb10b] font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <Radio className="w-4 h-4 text-[#feb10b]" />
                <span>مكتبة الصوتيات بالتطبيق</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
