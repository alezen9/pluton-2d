import type { SvgNode } from "./SvgNode";
import type { DefsRegistry } from "./defs/DefsRegistry";
import type { Camera } from "./Camera";

const RESIZE_DEBOUNCE_MS = 120;

export type CameraState = {
  readonly panX: number;
  readonly panY: number;
  readonly scale: number;
  readonly multiplier: number;
};

export type Viewport = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export interface Context {
  readonly svg: SvgNode;
  readonly defs: DefsRegistry;
  viewport: () => Viewport;
  camera: () => CameraState | null;
}

export class ContextInternal implements Context {
  readonly svg: SvgNode;
  readonly defs: DefsRegistry;
  private cameraRef: Camera | null;
  private cachedViewport: Viewport | null = null;
  private customViewBox?: { width: number; height: number };
  private resizeObserver: ResizeObserver | null = null;
  private resizeTimer: ReturnType<typeof setTimeout> | null = null;
  private resizePending = false;
  private viewScale = 1;
  private element?: SVGSVGElement;
  private onResize?: () => void;

  constructor(
    svg: SvgNode,
    defs: DefsRegistry,
    cameraRef: Camera | null,
    onResize?: () => void,
    viewBox?: { width: number; height: number },
    element?: SVGSVGElement,
  ) {
    this.svg = svg;
    this.element = element;
    this.defs = defs;
    this.cameraRef = cameraRef;
    this.onResize = onResize;
    this.customViewBox = viewBox;

    if (!element) return;

    this.resizeObserver = new ResizeObserver(() => {
      if (this.resizeTimer === null) {
        this.syncViewport();
      } else {
        this.resizePending = true;
        clearTimeout(this.resizeTimer);
      }
      this.resizeTimer = setTimeout(() => {
        this.resizeTimer = null;
        if (!this.resizePending) return;
        this.resizePending = false;
        this.syncViewport();
      }, RESIZE_DEBOUNCE_MS);
    });
    this.resizeObserver.observe(element);
  }

  dispose(): void {
    if (this.resizeTimer !== null) clearTimeout(this.resizeTimer);
    this.resizeObserver?.disconnect();
  }

  invalidateViewport(): void {
    this.cachedViewport = null;
  }

  private syncViewport = (): void => {
    this.invalidateViewport();
    this.onResize?.();
  };

  /**
   * Returns the viewport (coordinate space) dimensions.
   *
   * Priority:
   * 1. Constructor viewBox parameter
   * 2. SVG viewBox attribute
   * 3. Pixel dimensions from getBoundingClientRect
   *
   * @returns Viewport with coordinate space bounds
   */
  viewport = (): Viewport => {
    if (this.cachedViewport) return this.cachedViewport;

    // Priority 1: Custom viewBox from constructor
    if (this.customViewBox) {
      this.cachedViewport = {
        x: 0,
        y: 0,
        width: this.customViewBox.width,
        height: this.customViewBox.height,
      };
      return this.cachedViewport;
    }

    // Priority 2: SVG viewBox attribute
    const vb = this.element?.viewBox?.baseVal;
    if (vb && vb.width && vb.height) {
      this.cachedViewport = {
        x: vb.x,
        y: vb.y,
        width: vb.width,
        height: vb.height,
      };
      return this.cachedViewport;
    }

    // Priority 3: Pixel dimensions (for SVGs without explicit viewBox)
    if (!this.element)
      throw new Error("Pluton2D server rendering requires a viewBox.");
    const rect = this.element.getBoundingClientRect();
    this.cachedViewport = {
      x: 0,
      y: 0,
      width: rect.width,
      height: rect.height,
    };
    return this.cachedViewport;
  };

  setViewScale(scale: number) {
    this.viewScale = Math.max(0.1, Math.min(10, scale));
  }

  camera = (): CameraState => {
    if (!this.cameraRef)
      return { panX: 0, panY: 0, scale: 1, multiplier: this.viewScale };
    const state = this.cameraRef.state();
    return {
      ...state,
      multiplier: this.cameraRef.multiplier,
    };
  };
}
