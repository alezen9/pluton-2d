import type { EventBus } from './EventBus';
import type { CameraState } from './Context';

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
  private lastX = 0;
  private lastY = 0;
  private listeners: Array<{ target: EventTarget; type: string; handler: EventListener }> = [];

  constructor(svg: SVGSVGElement, events: EventBus) {
    this.svg = svg;
    this.events = events;

    events.on('layer:record-end', () => {
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

  private interpolateToTarget(): void {
    const epsilon = 0.01;
    const oldX = this.panX;
    const oldY = this.panY;
    const oldScale = this.scale;

    // exponential smoothing with damping for smoother motion
    const smoothStep = (current: number, target: number) => {
      const delta = target - current;
      return current + delta * this.dampingFactor;
    };

    this.panX = smoothStep(this.panX, this.targetPanX);
    this.panY = smoothStep(this.panY, this.targetPanY);
    this.scale = smoothStep(this.scale, this.targetScale);

    if (Math.abs(this.targetPanX - this.panX) < epsilon) this.panX = this.targetPanX;
    if (Math.abs(this.targetPanY - this.panY) < epsilon) this.panY = this.targetPanY;
    if (Math.abs(this.targetScale - this.scale) < epsilon) this.scale = this.targetScale;

    const changed = oldX !== this.panX || oldY !== this.panY || oldScale !== this.scale;

    if (changed) {
      this.events.emit('camera:changed', this.state());
    }
  }

  private addListeners() {
    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
        e.preventDefault();
        this.isPanning = true;
        this.lastX = e.clientX;
        this.lastY = e.clientY;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!this.isPanning) return;
      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;
      this.targetPanX += dx;
      this.targetPanY += dy;

      // scale limits by zoom level - more pan range when zoomed in
      const rect = this.svg.getBoundingClientRect();
      const maxPanX = rect.width * 0.5 * this.targetScale;
      const maxPanY = rect.height * 0.5 * this.targetScale;
      this.targetPanX = Math.max(-maxPanX, Math.min(maxPanX, this.targetPanX));
      this.targetPanY = Math.max(-maxPanY, Math.min(maxPanY, this.targetPanY));

      this.lastX = e.clientX;
      this.lastY = e.clientY;
      this.events.emit('camera:changed', this.state());
    };

    const onMouseUp = (e: MouseEvent) => {
      if (e.button === 1 || e.button === 0) {
        this.isPanning = false;
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = this.svg.getBoundingClientRect();
      const originX = e.clientX - rect.left - rect.width * 0.5;
      const originY = e.clientY - rect.top - rect.height * 0.5;

      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      const newScale = Math.max(this.minScale, Math.min(this.maxScale, this.targetScale * factor));
      const scaleRatio = newScale / this.targetScale;

      this.targetPanX = originX + (this.targetPanX - originX) * scaleRatio;
      this.targetPanY = originY + (this.targetPanY - originY) * scaleRatio;
      this.targetScale = newScale;

      this.events.emit('camera:changed', this.state());
    };

    this.svg.addEventListener('mousedown', onMouseDown as EventListener);
    window.addEventListener('mousemove', onMouseMove as EventListener);
    window.addEventListener('mouseup', onMouseUp as EventListener);
    this.svg.addEventListener('wheel', onWheel as EventListener);

    this.listeners = [
      { target: this.svg, type: 'mousedown', handler: onMouseDown as EventListener },
      { target: window, type: 'mousemove', handler: onMouseMove as EventListener },
      { target: window, type: 'mouseup', handler: onMouseUp as EventListener },
      { target: this.svg, type: 'wheel', handler: onWheel as EventListener },
    ];
  }

  private removeListeners() {
    for (const { target, type, handler } of this.listeners) {
      target.removeEventListener(type, handler);
    }
    this.listeners = [];
  }
}
