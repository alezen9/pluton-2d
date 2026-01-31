import { SVG_NS } from './constants';
import type { Context } from './Context';

export class Background {
  readonly root: SVGGElement;
  private patternRect: SVGRectElement;
  private axesGroup: SVGGElement;
  private xAxis: SVGLineElement;
  private yAxis: SVGLineElement;

  constructor(parent: SVGGElement, context: Context) {
    this.root = document.createElementNS(SVG_NS, 'g');
    this.root.classList.add('pluton-background');
    parent.appendChild(this.root);

    const viewport = context.viewport();
    const extent = this.computeExtent(viewport);

    this.patternRect = document.createElementNS(SVG_NS, 'rect');
    this.patternRect.classList.add('pluton-graph-paper');
    this.patternRect.setAttribute('fill', `url(#${context.defs.graphPaperPatternId})`);
    this.root.appendChild(this.patternRect);
    this.updatePatternRect(extent);

    const { axes, xAxis, yAxis } = this.createAxes();
    this.axesGroup = axes;
    this.xAxis = xAxis;
    this.yAxis = yAxis;
    this.updateAxes(extent);
  }

  updateForViewport(viewport: { width: number; height: number }): void {
    const extent = this.computeExtent(viewport);
    this.updatePatternRect(extent);
    this.updateAxes(extent);
  }

  enableGrid(enabled: boolean): void {
    this.patternRect.style.display = enabled ? "" : "none";
  }

  enableAxes(enabled: boolean): void {
    this.axesGroup.style.display = enabled ? "" : "none";
  }

  private computeExtent(viewport: { width: number; height: number }): number {
    return Math.sqrt(viewport.width ** 2 + viewport.height ** 2) * 3;
  }

  private updatePatternRect(extent: number): void {
    this.patternRect.setAttribute('x', String(-extent / 2));
    this.patternRect.setAttribute('y', String(-extent / 2));
    this.patternRect.setAttribute('width', String(extent));
    this.patternRect.setAttribute('height', String(extent));
  }

  private updateAxes(extent: number): void {
    this.xAxis.setAttribute('x1', String(-extent));
    this.xAxis.setAttribute('x2', String(extent));
    this.xAxis.setAttribute('y1', '0');
    this.xAxis.setAttribute('y2', '0');

    this.yAxis.setAttribute('x1', '0');
    this.yAxis.setAttribute('x2', '0');
    this.yAxis.setAttribute('y1', String(-extent));
    this.yAxis.setAttribute('y2', String(extent));
  }

  private createAxes(): {
    axes: SVGGElement;
    xAxis: SVGLineElement;
    yAxis: SVGLineElement;
  } {
    const axes = document.createElementNS(SVG_NS, 'g');
    axes.classList.add('pluton-axes');

    const xAxis = document.createElementNS(SVG_NS, 'line');
    xAxis.classList.add('pluton-axis', 'pluton-axis-x');

    const yAxis = document.createElementNS(SVG_NS, 'line');
    yAxis.classList.add('pluton-axis', 'pluton-axis-y');

    axes.append(xAxis, yAxis);
    this.root.appendChild(axes);
    return { axes, xAxis, yAxis };
  }
}
