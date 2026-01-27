import { SVG_NS } from './constants';
import type { Context, Viewport } from './Context';

export class Background {
  readonly root: SVGGElement;
  private xAxis!: SVGLineElement;
  private yAxis!: SVGLineElement;

  constructor(parent: SVGGElement, context: Context) {
    this.root = document.createElementNS(SVG_NS, 'g');
    this.root.classList.add('pluton-background');
    parent.appendChild(this.root);

    const viewport = context.viewport();

    const patternRect = document.createElementNS(SVG_NS, 'rect');
    patternRect.classList.add('pluton-graph-paper');
    patternRect.setAttribute('fill', `url(#${context.defs.graphPaperPatternId})`);

    const size = Math.sqrt(viewport.width ** 2 + viewport.height ** 2) * 3;
    patternRect.setAttribute('x', String(-size / 2));
    patternRect.setAttribute('y', String(-size / 2));
    patternRect.setAttribute('width', String(size));
    patternRect.setAttribute('height', String(size));
    this.root.appendChild(patternRect);

    this.createAxes();
  }

  private createAxes(): void {
    const axes = document.createElementNS(SVG_NS, 'g');
    axes.classList.add('pluton-axes');

    this.xAxis = document.createElementNS(SVG_NS, 'line');
    this.xAxis.classList.add('pluton-axis', 'pluton-axis-x');
    this.xAxis.setAttribute('y1', '0');
    this.xAxis.setAttribute('y2', '0');

    this.yAxis = document.createElementNS(SVG_NS, 'line');
    this.yAxis.classList.add('pluton-axis', 'pluton-axis-y');
    this.yAxis.setAttribute('x1', '0');
    this.yAxis.setAttribute('x2', '0');

    axes.append(this.xAxis, this.yAxis);
    this.root.appendChild(axes);
  }

  updateAxesExtent(viewport: Viewport): void {
    // fixed world-space extent: viewport + max pan range
    // max pan in world space = 0.5 * viewport (at any scale)
    // coverage needed = 1.0 * viewport (center view) + 0.5 * viewport (pan) = 1.5x
    const extentX = viewport.width * 1.5;
    const extentY = viewport.height * 1.5;

    this.xAxis.x1.baseVal.value = -extentX;
    this.xAxis.x2.baseVal.value = extentX;
    this.yAxis.y1.baseVal.value = -extentY;
    this.yAxis.y2.baseVal.value = extentY;
  }
}
