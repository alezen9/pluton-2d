import { SVG_NS } from "../constants";
import { DimensionsBuilder } from "./DimensionsBuilder";

type DimensionOptions = {
  className?: string;
};

type DimensionEntry = {
  root: SVGGElement;
  path: SVGPathElement;
  filledPath: SVGPathElement;
  builder: DimensionsBuilder;

  texts: SVGTextElement[];
  activeTextCursor: number;
};

/**
 * Dimensions group for drawing annotations and measurements.
 */
export type DimensionsGroup = {
  /**
   * Translate the entire group.
   * @param x - horizontal translation
   * @param y - vertical translation
   */
  translate: (x: number, y: number) => void;

  /**
   * Create or reuse a dimension builder for drawing annotations.
   * @param options - optional configuration object with className
   * @returns dimension builder for chaining drawing commands
   */
  dimension: (options?: DimensionOptions) => DimensionsBuilder;

  /**
   * Clear all dimensions in this group.
   */
  clear: VoidFunction;
};

export class DimensionsGroupInternal {
  private g: SVGGElement;

  private entries: DimensionEntry[] = [];
  // tracks current dimension write position during record cycle
  private activeIndex = 0;

  private translateX = 0;
  private translateY = 0;

  constructor(parent: SVGGElement) {
    this.g = document.createElementNS(SVG_NS, "g");
    parent.appendChild(this.g);
  }

  /**
   * Begin recording phase - reset index to reuse existing dimensions.
   * Part of the record/commit lifecycle for efficient DOM updates.
   */
  beginRecord() {
    this.activeIndex = 0;
    for (const e of this.entries) e.activeTextCursor = 0;
  }

  /**
   * Commit recorded dimensions to the DOM.
   * Updates path data and text content, removes unused elements.
   */
  commit() {
    for (let i = 0; i < this.activeIndex; i++) {
      const e = this.entries[i];

      const d = e.builder.toPathData();
      if (d) e.path.setAttribute("d", d);

      const fd = e.builder.toFilledPathData();
      if (fd) e.filledPath.setAttribute("d", fd);

      const texts = e.builder.getTexts();
      for (const t of texts) {
        const idx = e.activeTextCursor++;
        const textEl = idx < e.texts.length ? e.texts[idx] : this.createText(e);

        textEl.setAttribute("text-anchor", t.align);
        textEl.setAttribute("transform", `translate(${t.x} ${t.y}) scale(1,-1)`);
        textEl.setAttribute("x", "0");
        textEl.setAttribute("y", "0");
        textEl.setAttribute("dominant-baseline", "middle");
        textEl.textContent = t.text;
      }

      while (e.texts.length > e.activeTextCursor) {
        const n = e.texts.pop();
        n?.remove();
      }
    }

    if (this.entries.length > this.activeIndex) {
      for (let i = this.entries.length - 1; i >= this.activeIndex; i--) {
        this.entries[i].root.remove();
        this.entries.pop();
      }
    }
  }

  clear() {
    this.entries.length = 0;
    this.activeIndex = 0;
    this.g.replaceChildren();

    this.translateX = 0;
    this.translateY = 0;
    this.applyTransform();
  }

  translate(x: number, y: number) {
    this.translateX = x;
    this.translateY = y;
    this.applyTransform();
  }

  dimension(options?: DimensionOptions) {
    const { className = "" } = options ?? {};
    const i = this.activeIndex++;

    if (i < this.entries.length) {
      const e = this.entries[i];
      e.builder.reset();

      e.path.setAttribute("class", `pluton-dim-stroke ${className}`);
      e.filledPath.setAttribute("class", `pluton-dim-filled ${className}`);

      return e.builder;
    }

    const root = document.createElementNS(SVG_NS, "g");
    this.g.appendChild(root);

    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("class", `pluton-dim-stroke ${className}`);
    root.appendChild(path);

    const filledPath = document.createElementNS(SVG_NS, "path");
    filledPath.setAttribute("class", `pluton-dim-filled ${className}`);
    root.appendChild(filledPath);

    const builder = new DimensionsBuilder();
    const entry: DimensionEntry = {
      root,
      path,
      filledPath,
      builder,
      texts: [],
      activeTextCursor: 0,
    };
    this.entries.push(entry);

    return builder;
  }

  private applyTransform() {
    this.g.setAttribute("transform", `translate(${this.translateX}, ${this.translateY})`);
  }

  /**
   * Create a new text element and add it to the dimension entry.
   * @param entry - dimension entry to add text to
   * @returns newly created text element
   */
  private createText(entry: DimensionEntry) {
    const t = document.createElementNS(SVG_NS, "text");
    entry.root.appendChild(t);
    entry.texts.push(t);
    return t;
  }
}
