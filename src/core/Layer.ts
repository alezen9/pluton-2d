import { SVG_NS } from "./constants";
import { applyCenteredYUpTransform, getSvgViewport } from "./viewport";

type RecordableGroup = {
  beginRecord: VoidFunction;
  commit: VoidFunction;
};

export abstract class Layer<G extends RecordableGroup> {
  readonly root: SVGGElement;
  private groups: G[] = [];

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
    const group = this.createGroup(this.root);
    this.groups.push(group);
    return group;
  }

  beginRecord() {
    for (const g of this.groups) g.beginRecord();
  }

  commit() {
    for (const g of this.groups) g.commit();
  }

  protected abstract createGroup(parent: SVGGElement): G;
}
