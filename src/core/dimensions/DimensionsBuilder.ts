type TextAlign = "start" | "middle" | "end";

type TextRecord = {
  x: number;
  y: number;
  text: string;
  align: TextAlign;
  className?: string;
};

export class DimensionsBuilder {
  private commands: string[] = [];
  private cx = 0;
  private cy = 0;

  private textRecords: TextRecord[] = [];

  reset() {
    this.commands.length = 0;
    this.textRecords.length = 0;
    this.cx = 0;
    this.cy = 0;
  }

  toPathData() {
    return this.commands.join(" ");
  }

  consumeTexts() {
    return this.textRecords;
  }

  // ------------------------------------
  // Positioning
  // ------------------------------------

  /** Relative move (starts from 0,0 if first command). */
  moveTo(dx: number, dy: number) {
    this.cx += dx;
    this.cy += dy;
    this.commands.push(`M ${this.cx} ${this.cy}`);
    return this;
  }

  /** Absolute move. */
  moveToAbs(x: number, y: number) {
    this.cx = x;
    this.cy = y;
    this.commands.push(`M ${x} ${y}`);
    return this;
  }

  /** Relative line. */
  lineTo(dx: number, dy: number) {
    this.cx += dx;
    this.cy += dy;
    this.commands.push(`l ${dx} ${dy}`);
    return this;
  }

  /** Absolute line. */
  lineToAbs(x: number, y: number) {
    this.cx = x;
    this.cy = y;
    this.commands.push(`L ${x} ${y}`);
    return this;
  }

  // ------------------------------------
  // Primitives
  // ------------------------------------

  /**
   * Draw a small arrow head at the current point.
   * The arrow points along angleRad.
   */
  arrow(angleRad: number, size = 10) {
    const tipX = this.cx;
    const tipY = this.cy;

    const back = size;
    const halfW = size * 0.45;

    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);

    // point behind tip (center of base)
    const bx = tipX - cos * back;
    const by = tipY - sin * back;

    // perpendicular
    const px = -sin;
    const py = cos;

    const b1x = bx + px * halfW;
    const b1y = by + py * halfW;

    const b2x = bx - px * halfW;
    const b2y = by - py * halfW;

    this.commands.push(`M ${tipX} ${tipY} L ${b1x} ${b1y} L ${b2x} ${b2y} Z`);
    return this;
  }

  /**
   * Place text at (current + dx/dy).
   * `align` maps to SVG `text-anchor`.
   */
  textAt(dx: number, dy: number, text: string, align: TextAlign = "middle") {
    this.textRecords.push({
      x: this.cx + dx,
      y: this.cy + dy,
      text,
      align,
    });
    return this;
  }

  /** Place text at an absolute position. */
  textAtAbs(x: number, y: number, text: string, align: TextAlign = "middle") {
    this.textRecords.push({ x, y, text, align });
    return this;
  }

  close() {
    this.commands.push("z");
    return this;
  }
}
