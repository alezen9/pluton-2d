import { SVG_NS } from '../constants';
import type { Viewport } from '../Context';
import { upsertDef } from './utils';

type Vec2 = [x: number, y: number];

export type LinearGradientStop = {
  at: Vec2;
  color: string;
  opacity?: number;
};

export type RadialGradientStop = {
  offset: number;
  color: string;
  opacity?: number;
};

type GradientUnits = 'userSpaceOnUse' | 'objectBoundingBox';
type GradientSpread = 'pad' | 'reflect' | 'repeat';

export type LinearGradientOptions = {
  units?: GradientUnits;
  spread?: GradientSpread;
};

export type RadialGradientOptions = {
  units?: GradientUnits;
  center?: Vec2;
  radius?: number;
  focal?: Vec2;
  spread?: GradientSpread;
};

export class GradientDefs {
  readonly graphPaperGradientId = 'pluton-gradient-graph-paper';
  readonly graphPaperMaskId = 'pluton-mask-graph-paper';

  private defsEl: SVGDefsElement;
  private linearCache = new Map<string, string>();
  private radialCache = new Map<string, string>();
  private linearCount = 0;
  private radialCount = 0;

  constructor(defsEl: SVGDefsElement) {
    this.defsEl = defsEl;
  }

  syncForViewport(viewport: Viewport): void {
    upsertDef(this.defsEl, this.createGraphPaperFadeGradient(viewport));
    upsertDef(this.defsEl, this.createGraphPaperFadeMask(viewport));
  }

  createLinearGradient(
    stops: ReadonlyArray<LinearGradientStop>,
    options: LinearGradientOptions = {},
  ): string {
    if (stops.length < 2) {
      throw new Error('pluton-2d: linear gradient needs at least 2 stops');
    }
    const units = options.units ?? 'objectBoundingBox';
    const spread = options.spread ?? 'pad';
    const from = stops[0].at;
    const to = stops[stops.length - 1].at;
    const dx = to[0] - from[0];
    const dy = to[1] - from[1];
    const lengthSq = dx * dx + dy * dy;
    if (lengthSq === 0) {
      throw new Error('pluton-2d: linear gradient first and last `at` cannot be the same point');
    }

    const cacheKey = `lin|${units}|${spread}|${serializeLinearStops(stops)}`;
    const cached = this.linearCache.get(cacheKey);
    if (cached) return cached;

    const id = `pluton-gradient-linear-${this.linearCount++}`;
    const grad = document.createElementNS(SVG_NS, 'linearGradient');
    grad.setAttribute('id', id);
    grad.setAttribute('gradientUnits', units);
    grad.setAttribute('x1', String(from[0]));
    grad.setAttribute('y1', String(from[1]));
    grad.setAttribute('x2', String(to[0]));
    grad.setAttribute('y2', String(to[1]));
    if (spread !== 'pad') grad.setAttribute('spreadMethod', spread);

    for (let i = 0; i < stops.length; i++) {
      const stop = stops[i];
      const offset =
        i === 0 ? 0 : i === stops.length - 1 ? 1 : projectOffset(stop.at, from, dx, dy, lengthSq);
      appendStop(grad, offset, stop.color, stop.opacity);
    }
    upsertDef(this.defsEl, grad);

    const fillValue = `url(#${id})`;
    this.linearCache.set(cacheKey, fillValue);
    return fillValue;
  }

  createRadialGradient(
    stops: ReadonlyArray<RadialGradientStop>,
    options: RadialGradientOptions = {},
  ): string {
    if (stops.length < 2) {
      throw new Error('pluton-2d: radial gradient needs at least 2 stops');
    }
    const units = options.units ?? 'objectBoundingBox';
    const center = options.center ?? [0.5, 0.5];
    const radius = options.radius ?? 0.5;
    const focal = options.focal ?? center;
    const spread = options.spread ?? 'pad';
    const cacheKey = `rad|${units}|${center[0]},${center[1]}|${radius}|${focal[0]},${focal[1]}|${spread}|${serializeRadialStops(stops)}`;

    const cached = this.radialCache.get(cacheKey);
    if (cached) return cached;

    const id = `pluton-gradient-radial-${this.radialCount++}`;
    const grad = document.createElementNS(SVG_NS, 'radialGradient');
    grad.setAttribute('id', id);
    grad.setAttribute('gradientUnits', units);
    grad.setAttribute('cx', String(center[0]));
    grad.setAttribute('cy', String(center[1]));
    grad.setAttribute('r', String(radius));
    grad.setAttribute('fx', String(focal[0]));
    grad.setAttribute('fy', String(focal[1]));
    if (spread !== 'pad') grad.setAttribute('spreadMethod', spread);

    for (const stop of stops) {
      appendStop(grad, stop.offset, stop.color, stop.opacity);
    }
    upsertDef(this.defsEl, grad);

    const fillValue = `url(#${id})`;
    this.radialCache.set(cacheKey, fillValue);
    return fillValue;
  }

  private createGraphPaperFadeGradient(viewport: Viewport): SVGRadialGradientElement {
    const fadeStartPct = 0.65;
    const fadeEndPct = 1.0;

    const halfW = viewport.width / 2;
    const halfH = viewport.height / 2;

    const halfDiag = Math.sqrt(halfW * halfW + halfH * halfH);

    const fadeStartRadius = halfDiag * fadeStartPct;
    const fadeEndRadius = halfDiag * fadeEndPct;

    const grad = document.createElementNS(SVG_NS, 'radialGradient');
    grad.setAttribute('id', this.graphPaperGradientId);
    grad.setAttribute('gradientUnits', 'userSpaceOnUse');
    grad.setAttribute('cx', String(halfW));
    grad.setAttribute('cy', String(halfH));
    grad.setAttribute('r', String(fadeEndRadius));

    const stop0 = document.createElementNS(SVG_NS, 'stop');
    stop0.setAttribute('offset', '0');
    stop0.setAttribute('stop-color', 'white');

    const stop1 = document.createElementNS(SVG_NS, 'stop');
    stop1.setAttribute(
      'offset',
      fadeEndRadius === 0 ? '0' : String(fadeStartRadius / fadeEndRadius)
    );
    stop1.setAttribute('stop-color', 'white');

    const stop2 = document.createElementNS(SVG_NS, 'stop');
    stop2.setAttribute('offset', '1');
    stop2.setAttribute('stop-color', 'black');

    grad.append(stop0, stop1, stop2);
    return grad;
  }

  private createGraphPaperFadeMask(viewport: Viewport): SVGMaskElement {
    const mask = document.createElementNS(SVG_NS, 'mask');
    mask.setAttribute('id', this.graphPaperMaskId);
    mask.setAttribute('maskUnits', 'userSpaceOnUse');
    mask.setAttribute('x', '0');
    mask.setAttribute('y', '0');
    mask.setAttribute('width', String(viewport.width));
    mask.setAttribute('height', String(viewport.height));

    const rect = document.createElementNS(SVG_NS, 'rect');
    rect.setAttribute('x', '0');
    rect.setAttribute('y', '0');
    rect.setAttribute('width', String(viewport.width));
    rect.setAttribute('height', String(viewport.height));
    rect.setAttribute('fill', `url(#${this.graphPaperGradientId})`);

    mask.appendChild(rect);
    return mask;
  }
}

function serializeLinearStops(stops: ReadonlyArray<LinearGradientStop>): string {
  let s = '';
  for (const stop of stops) {
    s += `${stop.at[0]},${stop.at[1]}:${stop.color}:${stop.opacity ?? 1};`;
  }
  return s;
}

function serializeRadialStops(stops: ReadonlyArray<RadialGradientStop>): string {
  let s = '';
  for (const stop of stops) {
    s += `${stop.offset}:${stop.color}:${stop.opacity ?? 1};`;
  }
  return s;
}

function projectOffset(at: Vec2, from: Vec2, dx: number, dy: number, lengthSq: number): number {
  const ax = at[0] - from[0];
  const ay = at[1] - from[1];
  return (ax * dx + ay * dy) / lengthSq;
}

function appendStop(
  grad: SVGLinearGradientElement | SVGRadialGradientElement,
  offset: number,
  color: string,
  opacity: number | undefined,
): void {
  const el = document.createElementNS(SVG_NS, 'stop');
  el.setAttribute('offset', String(offset));
  el.setAttribute('stop-color', color);
  if (opacity !== undefined) el.setAttribute('stop-opacity', String(opacity));
  grad.appendChild(el);
}
