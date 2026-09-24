import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../i18n';
import { useAppContext } from '../AppContext';

interface Props {
  children: ReactNode;
  pathname?: string;
  t?: (key: string, fallback?: string) => string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  /** The route this boundary last rendered; a new route clears the error. */
  lastPathname: string | null;
}

export class SectionErrorBoundaryInner extends React.Component<Props & { navigate: any }, State> {
  public state: State = {
    hasError: false,
    error: null,
    lastPathname: this.props.pathname ?? null
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }
  
  public static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    // Clear the error only when the user actually moves to another route.
    // (Comparing against a value set later in componentDidCatch cleared it in
    // the very render that should show the fallback, so the page threw again
    // and the whole app shell fell through to the root boundary.)
    const pathname = props.pathname ?? null;
    if (pathname !== state.lastPathname) {
      return { lastPathname: pathname, hasError: false, error: null };
    }
    return null;
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Section Error caught:', error, errorInfo);
  }

  public render() {
    const t = this.props.t || ((_k: string, fb?: string) => fb || '');

    if (this.state.hasError) {
      return (
        <div className="w-full min-h-[50vh] bg-transparent flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-slate-50 dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-800">
            <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/20 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-6">
              <AlertTriangle size={32} />
            </div>
            
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3" style={{ fontFamily: "'Tajawal', sans-serif" }}>
              {t('section_error_title', 'عذراً، حدث خطأ في هذا القسم')}
            </h2>
            
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 leading-relaxed">
              {t('section_error_desc', 'تعذر تحميل بعض المحتويات. يمكنك محاولة إعادة التحميل أو العودة للرئيسية.')}
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                }}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <RefreshCw size={18} />
                {t('retry', 'إعادة المحاولة')}
              </button>
              
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  this.props.navigate('/');
                }}
                className="w-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Home size={18} />
                {t('back_home', 'العودة للرئيسية')}
              </button>
            </div>
            
            {((import.meta as any).env?.DEV) && (
              <div className="mt-6 p-3 bg-black/5 dark:bg-black/20 rounded-xl text-left overflow-auto max-h-32">
                <p className="text-[10px] font-mono text-rose-500 break-all text-left" dir="ltr">
                  {this.state.error?.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function SectionErrorBoundary({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useAppContext();
  const { t } = useTranslation(settings?.appLanguage);
  return (
    <SectionErrorBoundaryInner navigate={navigate} pathname={location.pathname} t={t}>
      {children}
    </SectionErrorBoundaryInner>
  );
}
