/**
 * Global Single-Instance Audio Controller
 * Ensures that only ONE audio instance (Adhan preview, notification sound, chime) plays at a time.
 * Playing a new sound immediately stops and cleans up any currently playing audio.
 */

class GlobalAudioPlayer {
  private activeAudio: HTMLAudioElement | null = null;
  private currentAudioId: string | null = null;
  private listeners: Set<(id: string | null) => void> = new Set();

  /**
   * Stop any currently playing audio immediately.
   */
  public stopAll(): void {
    if (this.activeAudio) {
      try {
        this.activeAudio.pause();
        this.activeAudio.currentTime = 0;
        this.activeAudio.onended = null;
        this.activeAudio.onerror = null;
        this.activeAudio.src = '';
      } catch (err) {
        console.warn('Error pausing active audio:', err);
      }
      this.activeAudio = null;
    }
    this.currentAudioId = null;
    this.notifyListeners();
  }

  /**
   * Play an audio URL or sound ID.
   * Stops any currently playing audio before starting new playback.
   */
  public play(url: string, soundId?: string, onEnd?: () => void, onError?: () => void): HTMLAudioElement {
    // 1. Stop all current audio playback
    this.stopAll();

    const id = soundId || url;

    // 2. Instantiate new Audio object
    try {
      const audio = new Audio(url);
      this.activeAudio = audio;
      this.currentAudioId = id;
      this.notifyListeners();

      const cleanup = () => {
        if (this.activeAudio === audio) {
          this.activeAudio = null;
          this.currentAudioId = null;
          this.notifyListeners();
        }
      };

      audio.onended = () => {
        cleanup();
        if (onEnd) onEnd();
      };

      audio.onerror = (e) => {
        console.warn('GlobalAudioPlayer audio error:', e, url);
        cleanup();
        if (onError) onError();
      };

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn('GlobalAudioPlayer play blocked or error:', err);
          cleanup();
          if (onError) onError();
        });
      }

      return audio;
    } catch (err) {
      console.warn('GlobalAudioPlayer initialization failed:', err);
      this.stopAll();
      if (onError) onError();
      return new Audio();
    }
  }

  public getCurrentId(): string | null {
    return this.currentAudioId;
  }

  public isPlaying(id?: string): boolean {
    if (!this.activeAudio) return false;
    if (!id) return true;
    return this.currentAudioId === id;
  }

  public subscribe(listener: (id: string | null) => void): () => void {
    this.listeners.add(listener);
    listener(this.currentAudioId);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentAudioId);
      } catch (err) {
        console.warn('Error in global audio player subscriber:', err);
      }
    });
  }
}

export const globalAudioPlayer = new GlobalAudioPlayer();
