import { SVG_NS } from "../constants";
import { DimensionsBuilder } from "./DimensionsBuilder";

type DimensionOptions = {
  className?: string;
};

type DimensionEntry = {
  root: SVGGElement;
  path: SVGPathElement;
  builder: DimensionsBuilder;

  texts: SVGTextElement[];
  textWriteIndex: number;
};

export type DimensionsGroup = {
  translate: (x: number, y: number) => void;
  dimension: (options?: DimensionOptions) => DimensionsBuilder;
  clear: VoidFunction;
};

export class DimensionsGroupInternal {
  private g: SVGGElement;

  private entries: DimensionEntry[] = [];
  private writeIndex = 0;

  private tx = 0;
  private ty = 0;

  constructor(parent: SVGGElement) {
    this.g = document.createElementNS(SVG_NS, "g");
    parent.appendChild(this.g);
  }

  beginRecord() {
    this.writeIndex = 0;
    // reset text cursors per entry during record start
    for (const e of this.entries) e.textWriteIndex = 0;
  }

  commit() {
    // commit only used entries
    for (let i = 0; i < this.writeIndex; i++) {
      const e = this.entries[i];

      const d = e.builder.toPathData();
      if (d) e.path.setAttribute("d", d);

      const texts = e.builder.consumeTexts();
      for (const t of texts) {
        const idx = e.textWriteIndex++;
        const textEl = idx < e.texts.length ? e.texts[idx] : this.createText(e);

        textEl.setAttribute("x", String(t.x));
        textEl.setAttribute("y", String(t.y));
        textEl.setAttribute("text-anchor", t.align);

        // keep labels upright in a Y-up scene (layer root is scale(1,-1))
        textEl.setAttribute(
          "transform",
          `translate(${t.x} ${t.y}) scale(1,-1)`,
        );
        textEl.setAttribute("x", "0");
        textEl.setAttribute("y", "0");
        textEl.setAttribute("dominant-baseline", "middle");

        textEl.textContent = t.text;
      }

      // remove leftover texts
      while (e.texts.length > e.textWriteIndex) {
        const n = e.texts.pop();
        n?.remove();
      }
    }

    // trim leftover entries (dimensions) from previous frame
    if (this.entries.length > this.writeIndex) {
      for (let i = this.entries.length - 1; i >= this.writeIndex; i--) {
        this.entries[i].root.remove();
        this.entries.pop();
      }
    }
  }

  clear() {
    this.entries.length = 0;
    this.writeIndex = 0;
    this.g.replaceChildren();

    this.tx = 0;
    this.ty = 0;
    this.applyTransform();
  }

  translate(x: number, y: number) {
    this.tx = x;
    this.ty = y;
    this.applyTransform();
  }

  dimension(options?: DimensionOptions) {
    const i = this.writeIndex++;

    if (i < this.entries.length) {
      const e = this.entries[i];
      e.builder.reset();

      if (options?.className) e.path.setAttribute("class", options.className);
      else e.path.removeAttribute("class");

      return e.builder;
    }

    const root = document.createElementNS(SVG_NS, "g");
    this.g.appendChild(root);

    const path = document.createElementNS(SVG_NS, "path");
    if (options?.className) path.setAttribute("class", options.className);
    root.appendChild(path);

    const builder = new DimensionsBuilder();
    const entry: DimensionEntry = {
      root,
      path,
      builder,
      texts: [],
      textWriteIndex: 0,
    };
    this.entries.push(entry);

    return builder;
  }

  private applyTransform() {
    this.g.setAttribute("transform", `translate(${this.tx}, ${this.ty})`);
  }

  private createText(entry: DimensionEntry) {
    const t = document.createElementNS(SVG_NS, "text");
    entry.root.appendChild(t);
    entry.texts.push(t);
    return t;
  }
}
