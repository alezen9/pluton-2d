import type { EventBus } from './EventBus';

export class Engine<P extends Record<string, unknown>> {
  private drawCallbacks: ((params: P) => void)[] = [];
  private paramsState: P;
  private isRenderScheduled = false;
  private autoRenderEnabled = false;
  private events: EventBus;

  private readonly frameBudget = 1000 / 60; // 60 FPS cap (~16.67ms)
  private lastFrameTime = 0;

  constructor(events: EventBus, initialParams: P) {
    this.events = events;
    this.paramsState = new Proxy(initialParams, {
      set: (target, prop, value) => {
        target[prop as keyof P] = value;
        if (this.autoRenderEnabled) this.scheduleRender();
        return true;
      },
    });
  }

  getParams(): P {
    return this.paramsState;
  }

  draw(callback: (params: P) => void) {
    this.drawCallbacks.push(callback);
    if (!this.autoRenderEnabled) {
      this.autoRenderEnabled = true;
      this.scheduleRender();
    }
  }

  dispose(): void {
    this.drawCallbacks.length = 0;
    this.autoRenderEnabled = false;
  }

  scheduleRender() {
    if (this.isRenderScheduled) return;
    this.isRenderScheduled = true;

    requestAnimationFrame((now) => {
      const elapsed = now - this.lastFrameTime;

      if (elapsed >= this.frameBudget) {
        // Account for drift by aligning to frame grid
        this.lastFrameTime = now - (elapsed % this.frameBudget);
        this.isRenderScheduled = false;
        this.commit();
      } else {
        // Re-schedule, not enough time has passed
        this.isRenderScheduled = false;
        this.scheduleRender();
      }
    });
  }

  private commit() {
    this.events.emit('layer:record-start', undefined);

    for (const cb of this.drawCallbacks) {
      cb(this.paramsState);
    }

    this.events.emit('layer:record-end', undefined);
  }
}
