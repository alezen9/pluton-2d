import { PathBuilder } from "./PathBuilder";
import { SVG_NS } from "../constants";

export type GeometryGroup = {
  translate: (x: number, y: number) => void;
  path: (options?: { className?: string }) => PathBuilder;
  clear: VoidFunction;
};

export class GeometryGroupInternal implements GeometryGroup {
  private g: SVGGElement;
  private paths: { builder: PathBuilder; path: SVGPathElement }[] = [];

  // cursor tracks current write position during record cycle
  private activeCursor = 0;
  private tx = 0;
  private ty = 0;

  constructor(parent: SVGGElement) {
    this.g = document.createElementNS(SVG_NS, "g");
    parent.appendChild(this.g);
  }

  beginRecord() {
    this.activeCursor = 0;
  }

  commit() {
    for (let i = 0; i < this.activeCursor; i++) {
      const { builder, path } = this.paths[i];
      path.setAttribute("d", builder.toString());
    }

    if (this.paths.length > this.activeCursor) {
      for (let i = this.paths.length - 1; i >= this.activeCursor; i--) {
        this.paths[i].path.remove();
        this.paths.pop();
      }
    }
  }

  translate(x: number, y: number) {
    this.tx = x;
    this.ty = y;
    this.applyTransform();
  }

  path(options?: { className?: string }) {
    const i = this.activeCursor++;

    if (i < this.paths.length) {
      const entry = this.paths[i];
      entry.builder.reset();

      if (options?.className)
        entry.path.setAttribute("class", options.className);
      else entry.path.removeAttribute("class");

      return entry.builder;
    }

    const builder = new PathBuilder();
    const path = document.createElementNS(SVG_NS, "path");

    if (options?.className) path.setAttribute("class", options.className);

    this.g.appendChild(path);
    this.paths.push({ builder, path });
    return builder;
  }

  clear() {
    this.paths.length = 0;
    this.activeCursor = 0;
    this.g.replaceChildren();

    this.tx = 0;
    this.ty = 0;
    this.applyTransform();
  }

  private applyTransform() {
    this.g.setAttribute("transform", `translate(${this.tx}, ${this.ty})`);
  }
}
