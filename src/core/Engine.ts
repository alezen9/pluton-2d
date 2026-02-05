import type { EventBus } from "./EventBus";

export class Engine<P extends Record<string, unknown>> {
  private drawCallbacks: ((params: P) => void)[] = [];
  private paramsState: P;
  private autoRenderEnabled = false;
  private events: EventBus;

  private readonly frameBudget = 1000 / 60; // 60 FPS cap (~16.67ms)
  private lastFrameTime = 0;

  private renderPending = false;
  private rafId: number | undefined;
  private tickFn: (() => boolean) | null = null;

  constructor(events: EventBus, initialParams: P) {
    this.events = events;

    for (const key of Object.keys(initialParams)) {
      const value = initialParams[key];
      if (value !== null && typeof value === "object") {
        throw new Error(
          `Pluton2D params must be flat. "${key}" is an object - nested mutations won't trigger redraws.`,
        );
      }
    }

    this.paramsState = new Proxy(initialParams, {
      set: (target, prop, value) => {
        if (value !== null && typeof value === "object") {
          throw new Error(
            `Pluton2D params must be flat. "${String(prop)}" cannot be an object.`,
          );
        }
        target[prop as keyof P] = value;
        if (this.autoRenderEnabled) this.scheduleRender();
        return true;
      },
    });
  }

  getParams(): P {
    return this.paramsState;
  }

  /**
   * Set a per-frame tick function (e.g. camera interpolation).
   * Called every loop iteration. Return true to keep the loop alive.
   */
  setTickFn(fn: (() => boolean) | null) {
    this.tickFn = fn;
  }

  draw(callback: (params: P) => void) {
    this.drawCallbacks.push(callback);
    if (!this.autoRenderEnabled) {
      this.autoRenderEnabled = true;
      this.scheduleRender();
    }
    return () => {
      const idx = this.drawCallbacks.indexOf(callback);
      if (idx >= 0) this.drawCallbacks.splice(idx, 1);
    };
  }

  dispose(): void {
    this.drawCallbacks.length = 0;
    this.autoRenderEnabled = false;
    this.renderPending = false;
    if (this.rafId !== undefined) {
      cancelAnimationFrame(this.rafId);
      this.rafId = undefined;
    }
  }

  /** Mark dirty + keep loop alive. Called on params mutation or resize. */
  scheduleRender() {
    this.renderPending = true;
    this.ensureLoop();
  }

  /** Keep loop alive without marking dirty. Called by camera when targets change. */
  requestFrame() {
    this.ensureLoop();
  }

  private ensureLoop() {
    if (this.rafId !== undefined) return;
    this.rafId = requestAnimationFrame((now) => this.loop(now));
  }

  private loop(now: number) {
    this.rafId = undefined;

    // tick external systems (camera smoothing) every iteration
    const tickAlive = this.tickFn?.() ?? false;
    let needsNextFrame = tickAlive;

    if (this.renderPending) {
      const elapsed = now - this.lastFrameTime;
      if (elapsed >= this.frameBudget) {
        // account for drift by aligning to frame grid
        this.lastFrameTime = now - (elapsed % this.frameBudget);
        this.renderPending = false;
        this.commit();
      } else {
        needsNextFrame = true;
      }
    }

    if (needsNextFrame) this.ensureLoop();
  }

  private commit() {
    this.events.emit("engine:commit-start", undefined);

    for (const cb of this.drawCallbacks) {
      cb(this.paramsState);
    }

    this.events.emit("engine:commit-end", undefined);
  }
}
