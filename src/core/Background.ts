import type { SvgNode } from "./SvgNode";
import type { Context } from './Context';

export class Background {
  readonly root: SvgNode;
  private patternRect: SvgNode;
  private axesGroup: SvgNode;
  private xAxis: SvgNode;
  private yAxis: SvgNode;

  constructor(parent: SvgNode, context: Context) {
    this.root = parent.create('g');
    this.root.addClass('pluton-background');
    parent.append(this.root);

    const viewport = context.viewport();
    const extent = this.computeExtent(viewport);

    this.patternRect = this.root.create('rect');
    this.patternRect.addClass('pluton-graph-paper');
    this.patternRect.setAttribute('fill', `url(#${context.defs.graphPaperPatternId})`);
    this.root.append(this.patternRect);
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
    this.patternRect.setStyle("display", enabled ? "" : "none");
  }

  enableAxes(enabled: boolean): void {
    this.axesGroup.setStyle("display", enabled ? "" : "none");
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
    axes: SvgNode;
    xAxis: SvgNode;
    yAxis: SvgNode;
  } {
    const axes = this.root.create('g');
    axes.addClass('pluton-axes');

    const xAxis = this.root.create('line');
    xAxis.addClass('pluton-axis', 'pluton-axis-x');

    const yAxis = this.root.create('line');
    yAxis.addClass('pluton-axis', 'pluton-axis-y');

    axes.append(xAxis, yAxis);
    this.root.append(axes);
    return { axes, xAxis, yAxis };
  }
}
