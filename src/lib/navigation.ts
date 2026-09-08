import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback } from 'react';
import { triggerHaptic } from './utils';

export const useSmartNavigation = () => {
  const routerNavigate = useNavigate();
  const location = useLocation();

  // Helper wrapper that plays haptic feedback on navigation
  const navigate = useCallback((to: any, options?: any) => {
    triggerHaptic('light');
    routerNavigate(to, options);
  }, [routerNavigate]);

  // Logical hierarchy mapping: path -> parent path
  const hierarchyMap: Record<string, string> = {
    '/names': '/library',
    '/tasbih': '/',
    '/qibla': '/library',
    '/compass': '/library',
    '/challenges': '/library',
    '/worship-tracker': '/library',
    '/scholar-sayings': '/library',
    '/hisn-al-muslim': '/library',
    '/prophet': '/library',
    '/prophets-stories': '/library',
    '/stories': '/library',
    '/independent-hadith': '/library',
    '/sunnah-hadith': '/library',
    '/quran-audio': '/audio-library',
    '/quran-tracker': '/library',
    '/audio-library': '/',
    '/lectures-audio': '/audio-library',
    '/quran-audio/downloads': '/quran-audio',
    '/inspiration': '/library',
    '/insights': '/library',
    '/khatma': '/library',
    '/user-card': '/library',
    '/hadith-supplications': '/library',
    '/zakat-calculator': '/library',
    '/prayer-times': '/',
    '/fasting-tracker': '/library',
    '/settings': '/',
    '/adhkar': '/',
    '/quran': '/',
    '/library': '/',
    '/adhkar/morning': '/',
    '/adhkar/evening': '/',
    '/adhkar/sleeping': '/',
    '/adhkar/waking': '/',
  };

  const goBack = useCallback((fallbackPath = '/') => {
    triggerHaptic('light');
    const currentPath = location.pathname;
    
    // Explicit dynamic sub-route handling
    if (currentPath.startsWith('/quran/')) return navigate('/quran', { replace: true });
    if (currentPath.startsWith('/stories/')) return navigate('/stories', { replace: true });
    if (currentPath.startsWith('/quran-audio/')) {
       if (currentPath === '/quran-audio/downloads') return navigate('/quran-audio', { replace: true });
       return navigate('/quran-audio', { replace: true });
    }
    if (currentPath.startsWith('/prophets-stories/')) return navigate('/prophets-stories', { replace: true });
    if (currentPath.startsWith('/prophet/')) return navigate('/prophet', { replace: true });
    if (currentPath.startsWith('/sunnah-')) return navigate('/library', { replace: true });

    // Determine the logical parent from map or use fallback
    const logicalParent = hierarchyMap[currentPath] || hierarchyMap[`/${currentPath.split('/')[1]}`] || fallbackPath;

    // If we have history and the previous entry is likely the logical parent, use navigate(-1)
    if (window.history.state && window.history.state.idx > 0 && location.key !== 'default') {
      navigate(-1);
      
      // Iframe bug workaround
      setTimeout(() => {
        const isHashRouter = window.location.hash.length > 0;
        const currentRef = isHashRouter ? window.location.hash.replace('#', '') : window.location.pathname;
        
        if (currentRef === currentPath) {
          navigate(logicalParent, { replace: true });
        }
      }, 200);
    } else {
      // No history or logical jump needed
      navigate(logicalParent, { replace: true });
    }
  }, [location.pathname, location.key, navigate]);

  return { goBack, navigate };
};
