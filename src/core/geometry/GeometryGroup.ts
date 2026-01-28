import { PathBuilder } from "./PathBuilder";
import { SVG_NS } from "../constants";

/**
 * Geometry group for drawing shapes.
 */
export type GeometryGroup = {
  /**
   * Translate the entire group.
   * @param x - horizontal translation
   * @param y - vertical translation
   */
  translate: (x: number, y: number) => void;

  /**
   * Create or reuse a path builder for drawing a shape.
   * @param options - optional configuration object with className
   * @returns path builder for chaining drawing commands
   */
  path: (options?: { className?: string }) => PathBuilder;

  /**
   * Clear all paths in this group.
   */
  clear: VoidFunction;
};

export class GeometryGroupInternal implements GeometryGroup {
  private g: SVGGElement;
  private paths: { builder: PathBuilder; path: SVGPathElement }[] = [];

  // tracks current write position during record cycle
  private activeIndex = 0;
  private translateX = 0;
  private translateY = 0;

  constructor(parent: SVGGElement) {
    this.g = document.createElementNS(SVG_NS, "g");
    parent.appendChild(this.g);
  }

  /**
   * Begin recording phase - reset index to reuse existing paths.
   * Part of the record/commit lifecycle for efficient DOM updates.
   */
  beginRecord() {
    this.activeIndex = 0;
  }

  /**
   * Commit recorded paths to the DOM.
   * Updates path data and removes unused elements.
   */
  commit() {
    for (let i = 0; i < this.activeIndex; i++) {
      const { builder, path } = this.paths[i];
      path.setAttribute("d", builder.toString());
    }

    if (this.paths.length > this.activeIndex) {
      for (let i = this.paths.length - 1; i >= this.activeIndex; i--) {
        this.paths[i].path.remove();
        this.paths.pop();
      }
    }
  }

  translate(x: number, y: number) {
    this.translateX = x;
    this.translateY = y;
    this.applyTransform();
  }

  path(options?: { className?: string }) {
    const i = this.activeIndex++;

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
    this.activeIndex = 0;
    this.g.replaceChildren();

    this.translateX = 0;
    this.translateY = 0;
    this.applyTransform();
  }

  private applyTransform() {
    this.g.setAttribute("transform", `translate(${this.translateX}, ${this.translateY})`);
  }
}
