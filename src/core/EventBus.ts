import type { CameraState } from './Context';

export type EventMap = {
  'render:scheduled': void;
  'camera:changed': CameraState;
  'layer:record-start': void;
  'layer:record-end': void;
};

export class EventBus {
  private listeners = new Map<keyof EventMap, Set<(data: any) => void>>();

  on<K extends keyof EventMap>(event: K, handler: (data: EventMap[K]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  off<K extends keyof EventMap>(event: K, handler: (data: EventMap[K]) => void): void {
    this.listeners.get(event)?.delete(handler);
  }

  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    this.listeners.get(event)?.forEach(fn => fn(data));
  }

  clear(): void {
    this.listeners.clear();
  }
}
