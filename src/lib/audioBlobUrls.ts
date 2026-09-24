/**
 * Blob URLs for offline audio.
 *
 * The audio caches hand back `URL.createObjectURL(blob)` for a whole downloaded
 * surah or lecture. Each one pins that file in memory until it is revoked, and
 * nothing used to revoke them, so a long offline listening session (auto-play
 * next, or tapping through surahs) kept every file alive until Android killed
 * the WebView. Every place that swaps an <audio> source goes through
 * `setAudioSource`, which frees the blob it replaces.
 *
 * Only URLs registered here are ever revoked, so a blob URL that came from
 * somewhere else (a user-picked file, for instance) is left alone.
 */
const ownedBlobUrls = new Set<string>();

/** Creates a blob URL for cached audio that `setAudioSource` may later free. */
export const createAudioBlobUrl = (blob: Blob): string => {
  const url = URL.createObjectURL(blob);
  ownedBlobUrls.add(url);
  return url;
};

/** Frees a cached-audio blob URL. Safe to call with any string. */
export const releaseAudioBlobUrl = (url: string | null | undefined) => {
  if (!url || !ownedBlobUrls.has(url)) return;
  ownedBlobUrls.delete(url);
  URL.revokeObjectURL(url);
};

/** Points an audio element at `url`, freeing the cached blob it replaces. */
export const setAudioSource = (audio: HTMLAudioElement, url: string) => {
  const previous = audio.src;
  audio.src = url;
  if (previous && previous !== url) releaseAudioBlobUrl(previous);
};
