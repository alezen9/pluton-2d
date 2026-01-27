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
  private filledCommands: string[] = [];
  private textRecords: TextRecord[] = [];
  private cx = 0;
  private cy = 0;

  reset() {
    this.commands.length = 0;
    this.textRecords.length = 0;
    this.filledCommands.length = 0;
    this.cx = 0;
    this.cy = 0;
  }

  toPathData() {
    return this.commands.join(" ");
  }

  toFilledPathData() {
    return this.filledCommands.join(" ");
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

  /** Open arrow points in angleRad direction. */
  arrow(angleRad: number) {
    const size = 8;
    const wingAngleRad = Math.PI / 4;
    const tipX = this.cx;
    const tipY = this.cy;

    const baseX = tipX - Math.cos(angleRad) * size;
    const baseY = tipY - Math.sin(angleRad) * size;

    // rotate that base point around the tip to get the two wing endpoints
    const wingEnd1 = this.rotateAround(baseX, baseY, tipX, tipY, +wingAngleRad);
    const wingEnd2 = this.rotateAround(baseX, baseY, tipX, tipY, -wingAngleRad);

    this.commands.push(
      `M ${wingEnd1.x} ${wingEnd1.y} L ${tipX} ${tipY} L ${wingEnd2.x} ${wingEnd2.y}`,
      `M ${tipX} ${tipY}`,
    );

    return this;
  }

  /** Filled arrow points in angleRad direction. */
  arrowFilled(angleRad: number) {
    const size = 8;
    const wingAngleRad = Math.PI / 4;
    const tipX = this.cx;
    const tipY = this.cy;

    const baseX = tipX - Math.cos(angleRad) * size;
    const baseY = tipY - Math.sin(angleRad) * size;

    // rotate that base point around the tip to get the two wing endpoints
    const wingEnd1 = this.rotateAround(baseX, baseY, tipX, tipY, +wingAngleRad);
    const wingEnd2 = this.rotateAround(baseX, baseY, tipX, tipY, -wingAngleRad);

    this.filledCommands.push(
      `M ${wingEnd1.x} ${wingEnd1.y} L ${tipX} ${tipY} L ${wingEnd2.x} ${wingEnd2.y} Z`,
      `M ${tipX} ${tipY}`,
    );

    return this;
  }

  /**
   * Draw a tick mark at the current point.
   * Architectural standard: single -45° slash crossing dimension line.
   */
  tick(angleRad: number) {
    const size = 15;

    const centerX = this.cx;
    const centerY = this.cy;

    const halfSize = size / 2;

    // vertical segment (centered at current point)
    const verticalStartX = centerX;
    const verticalStartY = centerY - halfSize;
    const verticalEndX = centerX;
    const verticalEndY = centerY + halfSize;

    // diagonal segment = the vertical segment rotated by -45° around the current point
    const diagonalLocalRotationRad = -Math.PI / 4;

    const diagonalStartLocal = this.rotateAround(
      verticalStartX,
      verticalStartY,
      centerX,
      centerY,
      diagonalLocalRotationRad,
    );
    const diagonalEndLocal = this.rotateAround(
      verticalEndX,
      verticalEndY,
      centerX,
      centerY,
      diagonalLocalRotationRad,
    );

    // rotate BOTH segments by angleRad around the current point
    const verticalStart = this.rotateAround(
      verticalStartX,
      verticalStartY,
      centerX,
      centerY,
      angleRad,
    );
    const verticalEnd = this.rotateAround(
      verticalEndX,
      verticalEndY,
      centerX,
      centerY,
      angleRad,
    );

    const diagonalStart = this.rotateAround(
      diagonalStartLocal.x,
      diagonalStartLocal.y,
      centerX,
      centerY,
      angleRad,
    );
    const diagonalEnd = this.rotateAround(
      diagonalEndLocal.x,
      diagonalEndLocal.y,
      centerX,
      centerY,
      angleRad,
    );

    this.commands.push(
      `M ${verticalStart.x} ${verticalStart.y} L ${verticalEnd.x} ${verticalEnd.y}`,
      `M ${diagonalStart.x} ${diagonalStart.y} L ${diagonalEnd.x} ${diagonalEnd.y}`,
      `M ${centerX} ${centerY}`,
    );

    return this;
  }

  private rotateAround = (
    x: number,
    y: number,
    centerX: number,
    centerY: number,
    radians: number,
  ) => {
    const dx = x - centerX;
    const dy = y - centerY;

    const cos = Math.cos(radians);
    const sin = Math.sin(radians);

    return {
      x: centerX + dx * cos - dy * sin,
      y: centerY + dx * sin + dy * cos,
    };
  };

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
