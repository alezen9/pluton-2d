import { SVG_NS } from '../constants';
import type { Viewport } from '../Context';
import { upsertDef } from './utils';

export class GradientDefs {
  readonly graphPaperGradientId = 'pluton-gradient-graph-paper';
  readonly graphPaperMaskId = 'pluton-mask-graph-paper';

  private defsEl: SVGDefsElement;

  constructor(defsEl: SVGDefsElement) {
    this.defsEl = defsEl;
  }

  syncForViewport(viewport: Viewport): void {
    upsertDef(this.defsEl, this.createGraphPaperFadeGradient(viewport));
    upsertDef(this.defsEl, this.createGraphPaperFadeMask(viewport));
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
