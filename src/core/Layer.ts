import { SVG_NS } from "./constants";
import { applyCenteredYUpTransform, getSvgViewport } from "./viewport";
import { Group } from "./Group";

export type GeometryLayer = {
  group: () => Group;
};

export class Layer implements GeometryLayer {
  readonly root: SVGGElement;
  private groups: Group[] = [];

  constructor(svg: SVGSVGElement, className: string) {
    this.root = document.createElementNS(SVG_NS, "g");
    this.root.classList.add("pluton-layer", className);
    svg.appendChild(this.root);
  }

  setCoordinateSystemCenteredYUp(svg: SVGSVGElement) {
    const vp = getSvgViewport(svg);
    applyCenteredYUpTransform(this.root, vp);
  }

  group() {
    const group = new Group(this.root);
    this.groups.push(group);
    return group;
  }

  beginRecord() {
    for (const g of this.groups) g.beginRecord();
  }

  commit() {
    for (const g of this.groups) g.commit();
  }
}
