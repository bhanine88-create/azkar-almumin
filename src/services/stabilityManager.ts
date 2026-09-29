/**
 * Believer Application Centralized Stability & Resource Governor
 * (دالة ونظام إدارة الاستقرار المركزي وتدوير الموارد)
 *
 * Provides central scheduling for periodic and on-demand memory cleanups,
 * resource recycling (Media, Blob URLs, Canvases, Buffers, Caches),
 * high-pressure throttle protection, and seamless integration with
 * React.useEffect across all major application components.
 */

import React, { useEffect, useRef } from 'react';
import { memoryManager } from './memoryManager';
import { mushafService } from './mushafService';

export type StabilityPriority = 'idle' | 'urgent' | 'background';

export interface ComponentStabilityOptions {
  componentName: string;
  autoRecycleOnUnmount?: boolean;
  onCustomRecycle?: () => void;
  trackMedia?: boolean;
  throttleIntervalMs?: number;
}

export interface SystemStabilityMetrics {
  registeredComponents: number;
  activeBlobsCount: number;
  lastRecycleTimestamp: number;
  isHighPressure: boolean;
  heapUsageMB?: number;
  heapLimitMB?: number;
}

class StabilityManager {
  private activeComponents = new Map<string, { count: number; customRecycle?: () => void }>();
  private scheduledTaskId: any = null;
  private isRecycling = false;
  private lastRecycleTime = 0;
  private minIntervalBetweenRecyclesMs = 3000; // prevent thrashing under extreme load
  private backgroundIntervalId: any = null;
  private highPressureMode = false;
  private burstActivityCounter = 0;
  private burstDecayTimer: any = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // 1. Hook into document visibility to recycle resources when app enters background
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
          this.scheduleCleanup('urgent');
        } else if (document.visibilityState === 'visible') {
          this.checkSystemHealth();
        }
      });

      // 2. Setup periodic background stability pass (gentle 45-second cycle when idle)
      this.backgroundIntervalId = setInterval(() => {
        this.runBackgroundStabilityCycle();
      }, 45000);

      // 3. Listen to window unload & memory pressure events
      window.addEventListener('beforeunload', () => this.executeEmergencyRecycle());
      window.addEventListener('pagehide', () => this.executeEmergencyRecycle());
    }
  }

  /**
   * Schedules a memory cleanup and resource recycling cycle.
   * Uses requestIdleCallback where supported to guarantee zero frame drops during animations.
   */
  public scheduleCleanup(priority: StabilityPriority = 'idle', force: boolean = false): void {
    if (typeof window === 'undefined') return;

    const now = Date.now();
    if (!force && now - this.lastRecycleTime < this.minIntervalBetweenRecyclesMs) {
      return;
    }

    if (this.scheduledTaskId) {
      if (priority !== 'urgent') return;
      // If urgent, cancel pending idle task and run immediately
      this.cancelPendingTask();
    }

    const runTask = () => {
      this.scheduledTaskId = null;
      this.executeRecycleCycle(priority);
    };

    if (priority === 'urgent') {
      // Immediate execution via microtask/short timeout
      setTimeout(runTask, 0);
    } else if ('requestIdleCallback' in window) {
      this.scheduledTaskId = (window as any).requestIdleCallback(runTask, { timeout: 4000 });
    } else {
      this.scheduledTaskId = setTimeout(runTask, 800);
    }
  }

  /**
   * Central resource recycling engine
   */
  public executeRecycleCycle(priority: StabilityPriority = 'idle'): void {
    if (this.isRecycling) return;
    this.isRecycling = true;

    try {
      this.lastRecycleTime = Date.now();

      // 1. Inspect memory pressure if Performance API is supported
      this.checkSystemHealth();

      // 2. Delegate low-level blob & media purge to memoryManager
      if (this.highPressureMode || priority === 'urgent') {
        memoryManager.pruneOldestBlobs(25);
        mushafService.pruneMemoryCache(6);
      } else {
        memoryManager.pruneOldestBlobs(10);
        mushafService.pruneMemoryCache(12);
      }

      // 3. Detach any lingering detached media elements marked as transient
      if (typeof document !== 'undefined') {
        try {
          const orphans = document.querySelectorAll('audio[data-transient="true"], video[data-transient="true"]');
          orphans.forEach((el) => {
            memoryManager.detachMediaElement(el as HTMLMediaElement);
            el.remove();
          });
        } catch (e) {
          // ignore selector errors
        }
      }

      // 4. Trigger active component custom recycling handlers
      this.activeComponents.forEach((item, name) => {
        if (item.customRecycle) {
          try {
            item.customRecycle();
          } catch (err) {
            console.warn(`[StabilityManager] Custom recycle failed for ${name}:`, err);
          }
        }
      });

      // 5. Suggest browser Garbage Collection if available in execution environment
      if (typeof window !== 'undefined' && 'gc' in window && typeof (window as any).gc === 'function') {
        try {
          (window as any).gc();
        } catch (e) {}
      }

      // 6. Broadcast stability cycle event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('app_stability_cycled', {
          detail: { priority, timestamp: this.lastRecycleTime, highPressure: this.highPressureMode }
        }));
      }
    } finally {
      this.isRecycling = false;
    }
  }

  /**
   * Registers a component into the central stability tracker.
   * Returns a cleanup unregister function to be called in useEffect return.
   */
  public registerComponent(
    componentName: string,
    options?: { onCustomRecycle?: () => void; autoRecycleOnUnmount?: boolean }
  ): () => void {
    const existing = this.activeComponents.get(componentName);
    if (existing) {
      existing.count += 1;
      if (options?.onCustomRecycle) existing.customRecycle = options.onCustomRecycle;
    } else {
      this.activeComponents.set(componentName, {
        count: 1,
        customRecycle: options?.onCustomRecycle
      });
    }

    return () => {
      this.unregisterComponent(componentName, options?.autoRecycleOnUnmount ?? true);
    };
  }

  /**
   * Unregisters a component and optionally triggers an auto-recycle pass.
   */
  public unregisterComponent(componentName: string, autoRecycle: boolean = true): void {
    const existing = this.activeComponents.get(componentName);
    if (existing) {
      existing.count -= 1;
      if (existing.count <= 0) {
        this.activeComponents.delete(componentName);
        // Execute component-scoped cleanup in memoryManager
        memoryManager.cleanupComponent(componentName);
      }
    }

    if (autoRecycle) {
      // Schedule gentle post-unmount recycling
      this.scheduleCleanup('idle');
    }
  }

  /**
   * Reports user burst activity (e.g. rapid taps in Tasbih, rapid page swipes in Quran).
   * Defers garbage collection/heavy cleanups until the user pauses to prevent micro-stutters.
   */
  public reportBurstActivity(intensity: number = 1): void {
    this.burstActivityCounter += intensity;

    if (this.burstDecayTimer) {
      clearTimeout(this.burstDecayTimer);
    }

    // When the user stops clicking/swiping for 1200ms, run a scheduled cleanup cycle
    this.burstDecayTimer = setTimeout(() => {
      this.burstActivityCounter = 0;
      this.scheduleCleanup('idle');
    }, 1200);
  }

  /**
   * Background stability checker
   */
  private runBackgroundStabilityCycle(): void {
    if (this.burstActivityCounter > 0) return; // Do not interrupt active burst interactions

    const memoryStats = memoryManager.getMemoryStats();
    if (memoryStats && memoryStats.limitMB && memoryStats.usedMB) {
      const usageRatio = memoryStats.usedMB / memoryStats.limitMB;
      if (usageRatio > 0.65) {
        this.highPressureMode = true;
        this.scheduleCleanup('urgent', true);
        return;
      } else {
        this.highPressureMode = false;
      }
    }

    // Regular background maintenance
    this.scheduleCleanup('background');
  }

  /**
   * Checks heap and environmental pressure
   */
  public checkSystemHealth(): boolean {
    const memoryStats = memoryManager.getMemoryStats();
    if (memoryStats && memoryStats.limitMB && memoryStats.usedMB) {
      this.highPressureMode = (memoryStats.usedMB / memoryStats.limitMB) > 0.60;
    }
    return this.highPressureMode;
  }

  /**
   * Cancels pending scheduled idle/timeout task
   */
  private cancelPendingTask(): void {
    if (!this.scheduledTaskId) return;

    if (typeof window !== 'undefined') {
      if ('cancelIdleCallback' in window) {
        try {
          (window as any).cancelIdleCallback(this.scheduledTaskId);
        } catch (e) {}
      }
      clearTimeout(this.scheduledTaskId);
    }
    this.scheduledTaskId = null;
  }

  /**
   * Emergency recycle for pagehide or unload
   */
  public executeEmergencyRecycle(): void {
    this.cancelPendingTask();
    memoryManager.performEmergencyCleanup();
    mushafService.clearMemoryCache();
  }

  /**
   * Snapshot metrics for monitoring and diagnostics
   */
  public getMetrics(): SystemStabilityMetrics {
    const stats = memoryManager.getMemoryStats();
    return {
      registeredComponents: this.activeComponents.size,
      activeBlobsCount: (memoryManager as any).blobRegistry?.size || 0,
      lastRecycleTimestamp: this.lastRecycleTime,
      isHighPressure: this.highPressureMode,
      heapUsageMB: stats?.usedMB,
      heapLimitMB: stats?.limitMB
    };
  }

  /**
   * Destroys background intervals if app unloads completely
   */
  public destroy(): void {
    if (this.backgroundIntervalId) {
      clearInterval(this.backgroundIntervalId);
      this.backgroundIntervalId = null;
    }
    this.cancelPendingTask();
  }
}

export const stabilityManager = new StabilityManager();

/**
 * React hook to bind any component into the Central Stability Manager.
 * Guarantees automated registration, memory tracking, resource recycling,
 * and leak prevention upon unmount or route shifts.
 */
export function useAppStability(options: ComponentStabilityOptions) {
  const {
    componentName,
    autoRecycleOnUnmount = true,
    onCustomRecycle
  } = options;

  const onCustomRecycleRef = useRef(onCustomRecycle);
  onCustomRecycleRef.current = onCustomRecycle;

  useEffect(() => {
    // Register component into central stability manager
    const unregister = stabilityManager.registerComponent(componentName, {
      onCustomRecycle: () => {
        if (onCustomRecycleRef.current) {
          try {
            onCustomRecycleRef.current();
          } catch (e) {
            console.warn(`[useAppStability] Custom recycle failed in ${componentName}:`, e);
          }
        }
      },
      autoRecycleOnUnmount
    });

    return () => {
      unregister();
    };
  }, [componentName, autoRecycleOnUnmount]);

  return {
    scheduleCleanup: (priority?: StabilityPriority) => stabilityManager.scheduleCleanup(priority),
    recycleResources: () => stabilityManager.executeRecycleCycle('urgent'),
    reportActivity: (intensity?: number) => stabilityManager.reportBurstActivity(intensity),
    isHighPressure: () => stabilityManager.checkSystemHealth()
  };
}
