import { SVG_NS } from "./constants";
import { Layer } from "./Layer";
import { getSvgViewport } from "./viewport";
import type { Defs } from "./Defs";

export class BackgroundLayer extends Layer {
  constructor(svg: SVGSVGElement, className: string, defs: Defs) {
    super(svg, className);

    const viewport = getSvgViewport(svg);
    this.graphPaper(viewport, defs);
    this.axes(viewport);
  }

  private graphPaper(viewport: ReturnType<typeof getSvgViewport>, defs: Defs) {
    const halfW = viewport.width / 2;
    const halfH = viewport.height / 2;

    const pad = 100;

    const grid = document.createElementNS(SVG_NS, "rect");
    grid.classList.add("pluton-paper-background");
    grid.setAttribute("x", String(-halfW - pad));
    grid.setAttribute("y", String(-halfH - pad));
    grid.setAttribute("width", String(viewport.width + pad * 2));
    grid.setAttribute("height", String(viewport.height + pad * 2));

    grid.setAttribute("fill", `url(#${defs.graphPaperPatternId})`);
    grid.setAttribute("mask", `url(#${defs.graphPaperMaskId})`);

    this.root.appendChild(grid);
  }

  private axes(viewport: ReturnType<typeof getSvgViewport>) {
    const halfW = viewport.width / 2;
    const halfH = viewport.height / 2;

    const axes = document.createElementNS(SVG_NS, "g");
    axes.classList.add("pluton-axes");
    this.root.appendChild(axes);

    const xAxis = document.createElementNS(SVG_NS, "line");
    xAxis.classList.add("pluton-axis", "pluton-axis-x");
    xAxis.setAttribute("x1", String(-halfW));
    xAxis.setAttribute("y1", "0");
    xAxis.setAttribute("x2", String(halfW));
    xAxis.setAttribute("y2", "0");

    const yAxis = document.createElementNS(SVG_NS, "line");
    yAxis.classList.add("pluton-axis", "pluton-axis-y");
    yAxis.setAttribute("x1", "0");
    yAxis.setAttribute("y1", String(-halfH));
    yAxis.setAttribute("x2", "0");
    yAxis.setAttribute("y2", String(halfH));

    axes.append(xAxis, yAxis);
  }
}
