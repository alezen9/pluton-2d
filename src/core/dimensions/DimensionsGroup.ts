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

export type DimensionsGroup = {
  translate: (x: number, y: number) => void;
  dimension: (options?: DimensionOptions) => DimensionsBuilder;
  clear: VoidFunction;
};

export class DimensionsGroupInternal {
  private g: SVGGElement;

  private entries: DimensionEntry[] = [];
  // cursor tracks current dimension write position during record cycle
  private activeCursor = 0;

  private tx = 0;
  private ty = 0;

  constructor(parent: SVGGElement) {
    this.g = document.createElementNS(SVG_NS, "g");
    parent.appendChild(this.g);
  }

  beginRecord() {
    this.activeCursor = 0;
    for (const e of this.entries) e.activeTextCursor = 0;
  }

  commit() {
    for (let i = 0; i < this.activeCursor; i++) {
      const e = this.entries[i];

      const d = e.builder.toPathData();
      if (d) e.path.setAttribute("d", d);

      const fd = e.builder.toFilledPathData();
      if (fd) e.filledPath.setAttribute("d", fd);

      const texts = e.builder.consumeTexts();
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

    if (this.entries.length > this.activeCursor) {
      for (let i = this.entries.length - 1; i >= this.activeCursor; i--) {
        this.entries[i].root.remove();
        this.entries.pop();
      }
    }
  }

  clear() {
    this.entries.length = 0;
    this.activeCursor = 0;
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
    const { className = "" } = options ?? {};
    const i = this.activeCursor++;

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
    this.g.setAttribute("transform", `translate(${this.tx}, ${this.ty})`);
  }

  private createText(entry: DimensionEntry) {
    const t = document.createElementNS(SVG_NS, "text");
    entry.root.appendChild(t);
    entry.texts.push(t);
    return t;
  }
}
