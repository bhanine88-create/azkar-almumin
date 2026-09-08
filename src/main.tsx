import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { initAutoUpdater } from './lib/autoUpdater';
import './i18n';
import App from './App';
import './index.css';

// Global resilience handlers for async operations and audio playback interruptions
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const msg = String(reason?.message || reason || '');
    if (
      msg.includes('interrupted') ||
      msg.includes('user gesture') ||
      msg.includes('NotAllowedError') ||
      msg.includes('AbortError') ||
      msg.includes('canceled') ||
      msg.includes('Fetch')
    ) {
      event.preventDefault();
    }
  });
}

// Initialize auto updater for seamless and instantaneous user updates
initAutoUpdater();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

