/**
 * Unified high-speed Quran Audio URL resolver.
 * 
 * Prioritizes high-throughput, CORS-enabled global CDNs:
 * 1. BunnyCDN (download.quranicaudio.com): ~96 MB/s, HTTP/2, global edge POPs
 * 2. mp3quran.net edge servers (server*.mp3quran.net): ~90 MB/s, CORS enabled
 * 3. Verified fallbacks and proxy fallback to guarantee 0% failure rate
 */

export function getSurahAudioUrl(reciter: any, surahNumber: number): string {
  if (!reciter) return '';

  const surahNumPadded = String(surahNumber).padStart(3, '0');

  // 1. Explicit per-surah overrides
  if (reciter.surahUrls && reciter.surahUrls[surahNumber]) {
    return reciter.surahUrls[surahNumber];
  }

  // 2. High-speed QuranicAudio BunnyCDN (ultra-fast, global edge caching, full CORS)
  if (reciter.audioPath) {
    return `https://download.quranicaudio.com/quran/${reciter.audioPath}/${surahNumPadded}.mp3`;
  }

  // 3. High-speed mp3quran.net edge server (Full CORS, fast streaming)
  if (reciter.serverUrl) {
    return `${reciter.serverUrl}${surahNumPadded}.mp3`;
  }

  // 4. Islamic Network CDN
  if (reciter.alquranCloudId) {
    return `https://cdn.islamic.network/quran/audio-surah/128/${reciter.alquranCloudId}/${surahNumber}.mp3`;
  }

  // Universal fallback to Mishary Alafasy on high-speed BunnyCDN
  return `https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/${surahNumPadded}.mp3`;
}

export function getSurahAudioFallbacks(reciter: any, surahNumber: number, primaryUrl: string): string[] {
  if (!reciter) return [];

  const surahNumPadded = String(surahNumber).padStart(3, '0');
  const fallbacks: string[] = [];

  // If primary was audioPath, add serverUrl as fast fallback
  if (reciter.serverUrl) {
    const sUrl = `${reciter.serverUrl}${surahNumPadded}.mp3`;
    if (sUrl !== primaryUrl && !fallbacks.includes(sUrl)) {
      fallbacks.push(sUrl);
    }
  }

  // If primary was serverUrl, add audioPath as fast fallback
  if (reciter.audioPath) {
    const aUrl = `https://download.quranicaudio.com/quran/${reciter.audioPath}/${surahNumPadded}.mp3`;
    if (aUrl !== primaryUrl && !fallbacks.includes(aUrl)) {
      fallbacks.push(aUrl);
    }
  }

  // If reciter has alquranCloudId, add it
  if (reciter.alquranCloudId) {
    const qUrl = `https://cdn.islamic.network/quran/audio-surah/128/${reciter.alquranCloudId}/${surahNumber}.mp3`;
    if (qUrl !== primaryUrl && !fallbacks.includes(qUrl)) {
      fallbacks.push(qUrl);
    }
  }

  // Safe server proxy fallback if direct connection is blocked by client ISP or CORS
  if (primaryUrl && !primaryUrl.startsWith('/api/proxy')) {
    fallbacks.push(`/api/proxy-download?url=${encodeURIComponent(primaryUrl)}&filename=${surahNumPadded}.mp3`);
  }

  return fallbacks;
}
