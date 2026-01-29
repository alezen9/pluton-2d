import { SVG_NS } from './constants';
import type { Context } from './Context';

export class Background {
  readonly root: SVGGElement;

  constructor(parent: SVGGElement, context: Context) {
    this.root = document.createElementNS(SVG_NS, 'g');
    this.root.classList.add('pluton-background');
    parent.appendChild(this.root);

    const viewport = context.viewport();
    const extent = Math.sqrt(viewport.width ** 2 + viewport.height ** 2) * 3;

    const patternRect = document.createElementNS(SVG_NS, 'rect');
    patternRect.classList.add('pluton-graph-paper');
    patternRect.setAttribute('fill', `url(#${context.defs.graphPaperPatternId})`);
    patternRect.setAttribute('x', String(-extent / 2));
    patternRect.setAttribute('y', String(-extent / 2));
    patternRect.setAttribute('width', String(extent));
    patternRect.setAttribute('height', String(extent));
    this.root.appendChild(patternRect);

    this.createAxes(extent);
  }

  private createAxes(extent: number): void {
    const axes = document.createElementNS(SVG_NS, 'g');
    axes.classList.add('pluton-axes');

    const xAxis = document.createElementNS(SVG_NS, 'line');
    xAxis.classList.add('pluton-axis', 'pluton-axis-x');
    xAxis.setAttribute('x1', String(-extent));
    xAxis.setAttribute('x2', String(extent));
    xAxis.setAttribute('y1', '0');
    xAxis.setAttribute('y2', '0');

    const yAxis = document.createElementNS(SVG_NS, 'line');
    yAxis.classList.add('pluton-axis', 'pluton-axis-y');
    yAxis.setAttribute('x1', '0');
    yAxis.setAttribute('x2', '0');
    yAxis.setAttribute('y1', String(-extent));
    yAxis.setAttribute('y2', String(extent));

    axes.append(xAxis, yAxis);
    this.root.appendChild(axes);
  }
}
