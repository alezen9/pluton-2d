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

  constructor(
    svg: SVGSVGElement,
    defs: DefsRegistry,
    cameraRef: Camera | null
  ) {
    this.svg = svg;
    this.defs = defs;
    this.cameraRef = cameraRef;
  }

  viewport = (): Viewport => {
    const vb = this.svg.viewBox?.baseVal;
    if (vb && vb.width && vb.height) {
      return { x: vb.x, y: vb.y, width: vb.width, height: vb.height };
    }

    const wAttr = Number(this.svg.getAttribute('width')) || 0;
    const hAttr = Number(this.svg.getAttribute('height')) || 0;
    if (wAttr && hAttr) {
      return { x: 0, y: 0, width: wAttr, height: hAttr };
    }

    const rect = this.svg.getBoundingClientRect();
    return { x: 0, y: 0, width: rect.width, height: rect.height };
  };

  camera = (): CameraState | null => {
    return this.cameraRef?.state() ?? null;
  };
}
