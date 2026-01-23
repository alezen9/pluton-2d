import { Layer } from "./Layer";
import { SVG_NS } from "./constants";
import { getSvgViewport } from "./viewport";

export class BackgroundLayer extends Layer {
  private axisGroup: SVGGElement;

  constructor(svg: SVGSVGElement) {
    super(svg, "pluton-background");

    this.axisGroup = document.createElementNS(SVG_NS, "g");
    this.axisGroup.classList.add("pluton-axes");
    this.root.appendChild(this.axisGroup);

    const vp = getSvgViewport(svg);
    const halfW = vp.width / 2;
    const halfH = vp.height / 2;

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

    this.axisGroup.appendChild(xAxis);
    this.axisGroup.appendChild(yAxis);
  }
}
