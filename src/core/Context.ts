import type { DefsRegistry } from './defs/DefsRegistry';
import type { Camera } from './Camera';

export type CameraState = {
  readonly panX: number;
  readonly panY: number;
  readonly scale: number;
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
  private resizeObserver: ResizeObserver;

  constructor(
    svg: SVGSVGElement,
    defs: DefsRegistry,
    cameraRef: Camera | null
  ) {
    this.svg = svg;
    this.defs = defs;
    this.cameraRef = cameraRef;

    this.resizeObserver = new ResizeObserver(() => {
      this.cachedViewport = null;
    });
    this.resizeObserver.observe(svg);
  }

  dispose(): void {
    this.resizeObserver.disconnect();
  }

  viewport = (): Viewport => {
    if (this.cachedViewport) return this.cachedViewport;

    const vb = this.svg.viewBox?.baseVal;
    if (vb && vb.width && vb.height) {
      this.cachedViewport = { x: vb.x, y: vb.y, width: vb.width, height: vb.height };
      return this.cachedViewport;
    }

    const wAttr = Number(this.svg.getAttribute('width')) || 0;
    const hAttr = Number(this.svg.getAttribute('height')) || 0;
    if (wAttr && hAttr) {
      this.cachedViewport = { x: 0, y: 0, width: wAttr, height: hAttr };
      return this.cachedViewport;
    }

    const rect = this.svg.getBoundingClientRect();
    this.cachedViewport = { x: 0, y: 0, width: rect.width, height: rect.height };
    return this.cachedViewport;
  };

  camera = (): CameraState | null => {
    return this.cameraRef?.state() ?? null;
  };
}
