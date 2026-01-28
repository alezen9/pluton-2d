import type { EventBus } from "./EventBus";
import type { CameraState } from "./Context";

export class Camera {
  private svg: SVGSVGElement;
  private events: EventBus;

  private panX = 0;
  private panY = 0;
  private scale = 1;
  private targetPanX = 0;
  private targetPanY = 0;
  private targetScale = 1;

  private readonly minScale = 1;
  private readonly maxScale = 20;
  private readonly dampingFactor = 0.2;

  private isPanning = false;
  private isResetting = false;
  private lastX = 0;
  private lastY = 0;
  private cachedRect: DOMRect | null = null;
  private listeners: Array<{
    target: EventTarget;
    type: string;
    handler: EventListener;
  }> = [];

  private lastTouchDist = 0;
  private lastTouchCenterX = 0;
  private lastTouchCenterY = 0;

  constructor(svg: SVGSVGElement, events: EventBus) {
    this.svg = svg;
    this.events = events;

    events.on("layer:record-end", () => {
      this.interpolateToTarget();
    });
  }

  enable() {
    this.addListeners();
  }

  disable() {
    this.removeListeners();
  }

  dispose(): void {
    this.removeListeners();
  }

  state(): CameraState {
    return { panX: this.panX, panY: this.panY, scale: this.scale };
  }

  reset(): void {
    if (this.isResetting) return;

    this.isResetting = true;
    this.targetPanX = 0;
    this.targetPanY = 0;
    this.targetScale = 1;
    this.events.emit("camera:changed", this.state());
  }

  private smoothStep(current: number, target: number): number {
    return current + (target - current) * this.dampingFactor;
  }

  private interpolateToTarget(): void {
    const epsilon = 0.01;
    const oldX = this.panX;
    const oldY = this.panY;
    const oldScale = this.scale;

    this.panX = this.smoothStep(this.panX, this.targetPanX);
    this.panY = this.smoothStep(this.panY, this.targetPanY);
    this.scale = this.smoothStep(this.scale, this.targetScale);

    // atomic snapping: snap all values together to prevent glitches
    const allWithinEpsilon =
      Math.abs(this.targetPanX - this.panX) < epsilon &&
      Math.abs(this.targetPanY - this.panY) < epsilon &&
      Math.abs(this.targetScale - this.scale) < epsilon;

    if (allWithinEpsilon) {
      this.panX = this.targetPanX;
      this.panY = this.targetPanY;
      this.scale = this.targetScale;

      if (
        this.isResetting &&
        this.panX === 0 &&
        this.panY === 0 &&
        this.scale === 1
      ) {
        this.isResetting = false;
      }
    }

    const changed =
      oldX !== this.panX || oldY !== this.panY || oldScale !== this.scale;

    if (changed) {
      this.events.emit("camera:changed", this.state());
    }
  }

  private updateCachedRect(): void {
    this.cachedRect = this.svg.getBoundingClientRect();
  }

  private getRect(): DOMRect {
    if (!this.cachedRect) this.updateCachedRect();
    return this.cachedRect!;
  }

  private addListeners() {
    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
        e.preventDefault();
        this.isPanning = true;
        this.updateCachedRect();
        this.lastX = e.clientX;
        this.lastY = e.clientY;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!this.isPanning || this.isResetting) return;
      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;
      this.targetPanX += dx;
      this.targetPanY += dy;

      const rect = this.getRect();
      const maxPanX = rect.width * 0.5 * this.targetScale;
      const maxPanY = rect.height * 0.5 * this.targetScale;
      this.targetPanX = Math.max(-maxPanX, Math.min(maxPanX, this.targetPanX));
      this.targetPanY = Math.max(-maxPanY, Math.min(maxPanY, this.targetPanY));

      this.lastX = e.clientX;
      this.lastY = e.clientY;
      this.events.emit("camera:changed", this.state());
    };

    const onMouseUp = (e: MouseEvent) => {
      if (e.button === 1 || e.button === 0) {
        this.isPanning = false;
        this.cachedRect = null;
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (this.isResetting) return;
      e.preventDefault();
      this.updateCachedRect();
      const rect = this.cachedRect!;
      const originX = e.clientX - rect.left - rect.width * 0.5;
      const originY = e.clientY - rect.top - rect.height * 0.5;

      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      const newScale = Math.max(
        this.minScale,
        Math.min(this.maxScale, this.targetScale * factor),
      );
      const scaleRatio = newScale / this.targetScale;

      this.targetPanX = originX + (this.targetPanX - originX) * scaleRatio;
      this.targetPanY = originY + (this.targetPanY - originY) * scaleRatio;
      this.targetScale = newScale;

      this.events.emit("camera:changed", this.state());
    };

    const onTouchStart = (e: TouchEvent) => {
      if (this.isResetting) return;
      e.preventDefault();
      this.updateCachedRect();

      if (e.touches.length === 1) {
        this.isPanning = true;
        this.lastX = e.touches[0].clientX;
        this.lastY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        this.isPanning = false;
        const t0 = e.touches[0];
        const t1 = e.touches[1];
        this.lastTouchDist = Math.hypot(
          t1.clientX - t0.clientX,
          t1.clientY - t0.clientY,
        );
        this.lastTouchCenterX = (t0.clientX + t1.clientX) / 2;
        this.lastTouchCenterY = (t0.clientY + t1.clientY) / 2;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (this.isResetting) return;
      e.preventDefault();

      if (e.touches.length === 1 && this.isPanning) {
        const dx = e.touches[0].clientX - this.lastX;
        const dy = e.touches[0].clientY - this.lastY;
        this.targetPanX += dx;
        this.targetPanY += dy;

        const rect = this.getRect();
        const maxPanX = rect.width * 0.5 * this.targetScale;
        const maxPanY = rect.height * 0.5 * this.targetScale;
        this.targetPanX = Math.max(
          -maxPanX,
          Math.min(maxPanX, this.targetPanX),
        );
        this.targetPanY = Math.max(
          -maxPanY,
          Math.min(maxPanY, this.targetPanY),
        );

        this.lastX = e.touches[0].clientX;
        this.lastY = e.touches[0].clientY;
        this.events.emit("camera:changed", this.state());
      } else if (e.touches.length === 2) {
        const t0 = e.touches[0];
        const t1 = e.touches[1];
        const dist = Math.hypot(
          t1.clientX - t0.clientX,
          t1.clientY - t0.clientY,
        );
        const centerX = (t0.clientX + t1.clientX) / 2;
        const centerY = (t0.clientY + t1.clientY) / 2;

        if (this.lastTouchDist > 0) {
          const rect = this.getRect();
          const originX = centerX - rect.left - rect.width * 0.5;
          const originY = centerY - rect.top - rect.height * 0.5;

          const scaleFactor = dist / this.lastTouchDist;
          const newScale = Math.max(
            this.minScale,
            Math.min(this.maxScale, this.targetScale * scaleFactor),
          );
          const scaleRatio = newScale / this.targetScale;

          this.targetPanX = originX + (this.targetPanX - originX) * scaleRatio;
          this.targetPanY = originY + (this.targetPanY - originY) * scaleRatio;
          this.targetScale = newScale;

          // pan with two fingers
          const dcx = centerX - this.lastTouchCenterX;
          const dcy = centerY - this.lastTouchCenterY;
          this.targetPanX += dcx;
          this.targetPanY += dcy;

          this.events.emit("camera:changed", this.state());
        }

        this.lastTouchDist = dist;
        this.lastTouchCenterX = centerX;
        this.lastTouchCenterY = centerY;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        this.isPanning = false;
        this.lastTouchDist = 0;
        this.cachedRect = null;
      } else if (e.touches.length === 1) {
        this.isPanning = true;
        this.lastX = e.touches[0].clientX;
        this.lastY = e.touches[0].clientY;
        this.lastTouchDist = 0;
      }
    };

    this.svg.addEventListener("mousedown", onMouseDown as EventListener);
    window.addEventListener("mousemove", onMouseMove as EventListener);
    window.addEventListener("mouseup", onMouseUp as EventListener);
    this.svg.addEventListener("wheel", onWheel as EventListener, {
      passive: false,
    });
    this.svg.addEventListener("touchstart", onTouchStart as EventListener, {
      passive: false,
    });
    this.svg.addEventListener("touchmove", onTouchMove as EventListener, {
      passive: false,
    });
    this.svg.addEventListener("touchend", onTouchEnd as EventListener);

    this.listeners = [
      {
        target: this.svg,
        type: "mousedown",
        handler: onMouseDown as EventListener,
      },
      {
        target: window,
        type: "mousemove",
        handler: onMouseMove as EventListener,
      },
      { target: window, type: "mouseup", handler: onMouseUp as EventListener },
      { target: this.svg, type: "wheel", handler: onWheel as EventListener },
      {
        target: this.svg,
        type: "touchstart",
        handler: onTouchStart as EventListener,
      },
      {
        target: this.svg,
        type: "touchmove",
        handler: onTouchMove as EventListener,
      },
      {
        target: this.svg,
        type: "touchend",
        handler: onTouchEnd as EventListener,
      },
    ];
  }

  private removeListeners() {
    for (const { target, type, handler } of this.listeners) {
      target.removeEventListener(type, handler);
    }
    this.listeners = [];
  }
}
