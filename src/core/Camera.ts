import type { EventBus } from "./EventBus";
import type { CameraState } from "./Context";

export class Camera {
  private svg: SVGSVGElement;
  private events: EventBus;
  private requestFrame: () => void;

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
  private panEnabled = false;
  private zoomEnabled = false;
  private panListeners: Array<{
    target: EventTarget;
    type: string;
    handler: EventListener;
  }> = [];
  private zoomListeners: Array<{
    target: EventTarget;
    type: string;
    handler: EventListener;
  }> = [];

  constructor(svg: SVGSVGElement, events: EventBus, requestFrame: () => void) {
    this.svg = svg;
    this.events = events;
    this.requestFrame = requestFrame;
  }

  dispose() {
    this.enablePan(false);
    this.enableZoom(false);
  }

  state(): CameraState {
    return { panX: this.panX, panY: this.panY, scale: this.scale };
  }

  reset() {
    if (this.isResetting) return;

    this.isResetting = true;
    this.targetPanX = 0;
    this.targetPanY = 0;
    this.targetScale = 1;
    this.requestFrame();
  }

  /**
   * Interpolate current values toward targets.
   * Called every frame by Engine's loop. Returns true if still animating.
   */
  tick(): boolean {
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

    if (changed) this.events.emit("camera:changed", this.state());

    return !allWithinEpsilon;
  }

  private smoothStep(current: number, target: number): number {
    return current + (target - current) * this.dampingFactor;
  }

  private updateCachedRect(): void {
    this.cachedRect = this.svg.getBoundingClientRect();
  }

  private getRect(): DOMRect {
    if (!this.cachedRect) this.updateCachedRect();
    return this.cachedRect!;
  }

  enablePan(enabled: boolean) {
    if (enabled === this.panEnabled) return;
    this.panEnabled = enabled;
    if (enabled) this.addPanListeners();
    else this.removePanListeners();
  }

  enableZoom(enabled: boolean) {
    if (enabled === this.zoomEnabled) return;
    this.zoomEnabled = enabled;
    if (enabled) this.addZoomListeners();
    else this.removeZoomListeners();
  }

  private addPanListeners() {
    if (this.panListeners.length > 0) return;
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
      this.requestFrame();
    };

    const onMouseUp = (e: MouseEvent) => {
      if (e.button === 1 || e.button === 0) {
        this.isPanning = false;
        this.cachedRect = null;
      }
    };

    this.svg.addEventListener("mousedown", onMouseDown as EventListener);
    window.addEventListener("mousemove", onMouseMove as EventListener);
    window.addEventListener("mouseup", onMouseUp as EventListener);

    this.panListeners = [
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
    ];
  }

  private addZoomListeners() {
    if (this.zoomListeners.length > 0) return;
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

      this.requestFrame();
    };

    this.svg.addEventListener("wheel", onWheel as EventListener, {
      passive: false,
    });

    this.zoomListeners = [
      { target: this.svg, type: "wheel", handler: onWheel as EventListener },
    ];
  }

  private removePanListeners() {
    for (const { target, type, handler } of this.panListeners) {
      target.removeEventListener(type, handler);
    }
    this.panListeners = [];
    this.isPanning = false;
    this.cachedRect = null;
  }

  private removeZoomListeners() {
    for (const { target, type, handler } of this.zoomListeners) {
      target.removeEventListener(type, handler);
    }
    this.zoomListeners = [];
  }
}
