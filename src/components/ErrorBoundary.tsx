import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { safeLocalStorageGetItem, safeLocalStorageSetItem, safeLocalStorageRemoveItem, safeLocalStorageLength, safeLocalStorageKey, safeLocalStorageClear } from "../utils/storage";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    
    // Automatically reload the page if we encounter a Vite chunk loading error
    // This happens frequently during development when the dev server restarts
    if (
      error.message.includes('Failed to fetch dynamically imported module') || 
      error.message.includes('Importing a module script failed')
    ) {
      if (!sessionStorage.getItem('chunk_reload_attempted')) {
        sessionStorage.setItem('chunk_reload_attempted', 'true');
        window.location.reload();
        return;
      } else {
        sessionStorage.removeItem('chunk_reload_attempted');
      }
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-2xl border border-slate-100 dark:border-white/5">
            <div className="w-20 h-20 bg-rose-50 dark:bg-rose-900/20 rounded-full flex items-center justify-center text-rose-500 mx-auto mb-6">
              <AlertTriangle size={40} />
            </div>
            
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4" style={{ fontFamily: "'Tajawal', sans-serif" }}>
              عذراً، حدث خطأ ما
            </h1>
            
            <p className="text-slate-600 dark:text-slate-400 mb-2 leading-relaxed">
              نعتذر عن هذا الخلل التقني. يمكنك محاولة إعادة تحميل الصفحة أو العودة للرئيسية.
            </p>

            <pre className="text-left text-xs text-red-500 bg-red-50 dark:bg-black/20 p-2 rounded-lg mb-8 overflow-auto max-h-32">
              {this.state.error?.toString()}
            </pre>

            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-teal-600/20 duration-75 active:scale-[0.85] active:opacity-70"
              >
                <RefreshCw size={20} />
                إعادة تحميل الصفحة
              </button>
              
              <button
                onClick={() => {
                  const backup1 = safeLocalStorageGetItem('believer_backup_v23_1') || safeLocalStorageGetItem('believer_backup_v22_1') || safeLocalStorageGetItem('believer_backup_v21_1') || safeLocalStorageGetItem('believer_backup_v20_1') || safeLocalStorageGetItem('believer_backup_v5_1');
                  const backup2 = safeLocalStorageGetItem('believer_backup_v23_2') || safeLocalStorageGetItem('believer_backup_v22_2') || safeLocalStorageGetItem('believer_backup_v21_2') || safeLocalStorageGetItem('believer_backup_v20_2') || safeLocalStorageGetItem('believer_backup_v5_2');
                  const cloudBackup = safeLocalStorageGetItem('believer_last_cloud_backup');
                  
                  safeLocalStorageClear();
                  
                  if (backup1) safeLocalStorageSetItem('believer_backup_v23_1', backup1);
                  if (backup2) safeLocalStorageSetItem('believer_backup_v23_2', backup2);
                  if (cloudBackup) safeLocalStorageSetItem('believer_last_cloud_backup', cloudBackup);
                  
                  window.location.href = '/';
                }}
                className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all duration-75 active:scale-[0.85] active:opacity-70"
              >
                <Home size={20} />
                مسح البيانات والعودة للرئيسية
              </button>
            </div>

            {((import.meta as any).env?.DEV) && (
              <div className="mt-8 p-4 bg-slate-50 dark:bg-black/20 rounded-xl text-left overflow-auto max-h-40">
                <p className="text-[10px] font-mono text-rose-500 break-all">
                  {this.state.error?.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
