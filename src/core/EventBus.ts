import type { CameraState } from './Context';

export type EventMap = {
  'camera:changed': CameraState;
  'engine:commit-start': void;
  'engine:commit-end': void;
};

export class EventBus {
  private listeners = new Map<keyof EventMap, Set<(data: any) => void>>();

  on<K extends keyof EventMap>(event: K, handler: (data: EventMap[K]) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    return () => this.off(event, handler);
  }

  off<K extends keyof EventMap>(event: K, handler: (data: EventMap[K]) => void): void {
    this.listeners.get(event)?.delete(handler);
  }

  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    this.listeners.get(event)?.forEach(fn => {
      try {
        fn(data);
      } catch (e) {
        console.error('EventBus listener error:', e);
      }
    });
  }

  clear(): void {
    this.listeners.clear();
  }
}
