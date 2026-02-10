import type { DefsRegistry } from './defs/DefsRegistry';
import type { Camera } from './Camera';

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
  readonly svg: SVGSVGElement;
  readonly defs: DefsRegistry;
  viewport: () => Viewport;
  camera: () => CameraState | null;
}

export class ContextInternal implements Context {
  readonly svg: SVGSVGElement;
  readonly defs: DefsRegistry;
  private cameraRef: Camera | null;
  private cachedViewport: Viewport | null = null;
  private customViewBox?: { width: number; height: number };
  private resizeObserver: ResizeObserver;
  private onResize?: () => void;

  constructor(
    svg: SVGSVGElement,
    defs: DefsRegistry,
    cameraRef: Camera | null,
    onResize?: () => void,
    viewBox?: { width: number; height: number }
  ) {
    this.svg = svg;
    this.defs = defs;
    this.cameraRef = cameraRef;
    this.onResize = onResize;
    this.customViewBox = viewBox;

    this.resizeObserver = new ResizeObserver(() => {
      this.invalidateViewport();
      this.onResize?.();
    });
    this.resizeObserver.observe(svg);
  }

  dispose(): void {
    this.resizeObserver.disconnect();
  }

  invalidateViewport(): void {
    this.cachedViewport = null;
  }

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
        height: this.customViewBox.height
      };
      return this.cachedViewport;
    }

    // Priority 2: SVG viewBox attribute
    const vb = this.svg.viewBox?.baseVal;
    if (vb && vb.width && vb.height) {
      this.cachedViewport = { x: vb.x, y: vb.y, width: vb.width, height: vb.height };
      return this.cachedViewport;
    }

    // Priority 3: Pixel dimensions (for SVGs without explicit viewBox)
    const rect = this.svg.getBoundingClientRect();
    this.cachedViewport = { x: 0, y: 0, width: rect.width, height: rect.height };
    return this.cachedViewport;
  };

  camera = (): CameraState | null => {
    if (!this.cameraRef) return null;
    const state = this.cameraRef.state();
    return {
      ...state,
      multiplier: this.cameraRef.multiplier
    };
  };
}
