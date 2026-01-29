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

type PathEntry = {
  builder: PathBuilder;
  path: SVGPathElement;
  lastD: string;
  lastClass: string;
};

export class GeometryGroupInternal implements GeometryGroup {
  private g: SVGGElement;
  private paths: PathEntry[] = [];

  // tracks current write position during record cycle
  private activeIndex = 0;
  private translateX = 0;
  private translateY = 0;
  private lastTransform = "";

  constructor(parent: SVGGElement) {
    this.g = document.createElementNS(SVG_NS, "g");
    this.g.style.contain = "strict";
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
   * Updates path data only when changed, removes unused elements.
   */
  commit() {
    for (let i = 0; i < this.activeIndex; i++) {
      const entry = this.paths[i];
      const d = entry.builder.toString();
      if (d !== entry.lastD) {
        entry.path.setAttribute("d", d);
        entry.lastD = d;
      }
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
    const className = options?.className ?? "";

    if (i < this.paths.length) {
      const entry = this.paths[i];
      entry.builder.reset();

      if (className !== entry.lastClass) {
        if (className) entry.path.setAttribute("class", className);
        else entry.path.removeAttribute("class");
        entry.lastClass = className;
      }

      return entry.builder;
    }

    const builder = new PathBuilder();
    const path = document.createElementNS(SVG_NS, "path");

    if (className) path.setAttribute("class", className);

    this.g.appendChild(path);
    this.paths.push({ builder, path, lastD: "", lastClass: className });
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
    const t = `translate(${this.translateX}, ${this.translateY})`;
    if (t !== this.lastTransform) {
      this.g.setAttribute("transform", t);
      this.lastTransform = t;
    }
  }
}
