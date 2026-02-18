import { PathBuilder } from "./PathBuilder";
import { SVG_NS } from "../constants";
import type { BaseGroup } from "../Layer";
import type { Prettify } from "../types";

type PathOptions = {
  className?: string;
  /**
   * CSS fill value
   * @example
   * fill: "#0f766e"
   *
   * const fillId = scene.addHatchFill("red");
   * fill: fillId
   */
  fill?: string;
  /** CSS stroke value */
  stroke?: string;
  /** Fill rule for paths with holes (default: "evenodd") */
  fillRule?: "nonzero" | "evenodd";
};

const DEFAULT_FILL_RULE = "evenodd";

export type GeometryGroup = Prettify<
  BaseGroup & {
    /**
     * Scale the entire group
     * @param x - horizontal scale factor
     * @param y - vertical scale factor
     */
    scale: (x: number, y: number) => void;
    /**
     * Create or reuse a path builder. To be called within a draw call
     * @param options - optional configuration
     * @returns path builder for chaining commands
     */
    path: (options?: PathOptions) => PathBuilder;
  }
>;

type PathEntry = {
  builder: PathBuilder;
  path: SVGPathElement;
  lastD: string;
  lastClass: string;
  lastFill: string;
  lastStroke: string;
  lastFillRule: string;
};

export class GeometryGroupInternal implements GeometryGroup {
  private g: SVGGElement;
  private paths: PathEntry[] = [];

  private activeIndex = 0;
  private translateX = 0;
  private translateY = 0;
  private scaleX = 1;
  private scaleY = 1;
  private lastTransform = "";
  private drawUsage: "static" | "dynamic" = "dynamic";
  private hasCommitted = false;

  constructor(parent: SVGGElement) {
    this.g = document.createElementNS(SVG_NS, "g");
    this.g.setAttribute("class", "pluton-geometry-group");
    parent.appendChild(this.g);
  }

  beginRecord() {
    this.activeIndex = 0;
  }

  commit() {
    if (this.drawUsage === "static" && this.hasCommitted) return;
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

    if (this.drawUsage === "static") this.hasCommitted = true;
  }

  translate(x: number, y: number) {
    this.translateX = x;
    this.translateY = y;
    this.applyTransform();
  }

  scale(x: number, y: number) {
    this.scaleX = x;
    this.scaleY = y;
    this.applyTransform();
  }

  setDrawUsage(usage: "static" | "dynamic") {
    this.drawUsage = usage;
    if (usage === "dynamic") this.hasCommitted = false;
  }

  visible(visible: boolean) {
    if (visible) this.g.removeAttribute("display");
    else this.g.setAttribute("display", "none");
  }

  path(options?: PathOptions) {
    const i = this.activeIndex++;
    const className = options?.className ?? "";
    const fill = options?.fill ?? "";
    const stroke = options?.stroke ?? "";
    const fillRule = options?.fillRule ?? DEFAULT_FILL_RULE;

    if (i < this.paths.length) {
      const entry = this.paths[i];
      entry.builder.reset();

      if (className !== entry.lastClass) {
        entry.path.setAttribute(
          "class",
          className ? `pluton-geometry-path ${className}` : "pluton-geometry-path",
        );
        entry.lastClass = className;
      }

      if (fill !== entry.lastFill) {
        if (fill) entry.path.style.setProperty("--hatch-fill-value", fill);
        else entry.path.style.removeProperty("--hatch-fill-value");
        entry.lastFill = fill;
      }

      if (stroke !== entry.lastStroke) {
        if (stroke) entry.path.style.setProperty("--stroke-value", stroke);
        else entry.path.style.removeProperty("--stroke-value");
        entry.lastStroke = stroke;
      }

      if (fillRule !== entry.lastFillRule) {
        if (fillRule) entry.path.setAttribute("fill-rule", fillRule);
        else entry.path.removeAttribute("fill-rule");
        entry.lastFillRule = fillRule;
      }

      return entry.builder;
    }

    const builder = new PathBuilder();
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute(
      "class",
      className ? `pluton-geometry-path ${className}` : "pluton-geometry-path",
    );
    if (fill) path.style.setProperty("--hatch-fill-value", fill);
    if (stroke) path.style.setProperty("--stroke-value", stroke);
    if (fillRule) path.setAttribute("fill-rule", fillRule);

    this.g.appendChild(path);
    this.paths.push({
      builder,
      path,
      lastD: "",
      lastClass: className,
      lastFill: fill,
      lastStroke: stroke,
      lastFillRule: fillRule,
    });
    return builder;
  }

  clear() {
    this.paths.length = 0;
    this.activeIndex = 0;
    this.g.replaceChildren();
    this.hasCommitted = false;

    this.translateX = 0;
    this.translateY = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.applyTransform();
  }

  private applyTransform() {
    const t = `translate(${this.translateX}, ${this.translateY}) scale(${this.scaleX}, ${this.scaleY})`;
    if (t !== this.lastTransform) {
      this.g.setAttribute("transform", t);
      this.lastTransform = t;
    }
  }
}
