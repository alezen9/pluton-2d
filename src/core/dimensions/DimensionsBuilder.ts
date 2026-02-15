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
  private currentX = 0;
  private currentY = 0;

  /**
   * Reset builder state
   */
  reset() {
    this.commands.length = 0;
    this.textRecords.length = 0;
    this.filledCommands.length = 0;
    this.currentX = 0;
    this.currentY = 0;
  }

  /**
   * Get SVG path data for dimension lines
   * @returns SVG path data string
   */
  toPathData() {
    return this.commands.join(" ");
  }

  /**
   * Get SVG path data for filled shapes
   * @returns SVG path data string
   */
  toFilledPathData() {
    return this.filledCommands.join(" ");
  }

  /**
   * Get all text records
   * @returns array of text records with positions and alignment
   */
  getTexts() {
    return this.textRecords;
  }

  // ------------------------------------
  // positioning
  // ------------------------------------

  /**
   * Move to a position relative to current position
   * @param dx - horizontal offset
   * @param dy - vertical offset
   * @returns this builder for chaining
   */
  moveTo(dx: number, dy: number) {
    this.currentX += dx;
    this.currentY += dy;
    this.commands.push(`M ${this.currentX} ${this.currentY}`);
    return this;
  }

  /**
   * Move to an absolute position
   * @param x - absolute x coordinate
   * @param y - absolute y coordinate
   * @returns this builder for chaining
   */
  moveToAbs(x: number, y: number) {
    this.currentX = x;
    this.currentY = y;
    this.commands.push(`M ${x} ${y}`);
    return this;
  }

  /**
   * Draw a line to a position relative to current position
   * @param dx - horizontal offset
   * @param dy - vertical offset
   * @returns this builder for chaining
   */
  lineTo(dx: number, dy: number) {
    this.currentX += dx;
    this.currentY += dy;
    this.commands.push(`l ${dx} ${dy}`);
    return this;
  }

  /**
   * Draw a line to an absolute position
   * @param x - absolute x coordinate
   * @param y - absolute y coordinate
   * @returns this builder for chaining
   */
  lineToAbs(x: number, y: number) {
    this.currentX = x;
    this.currentY = y;
    this.commands.push(`L ${x} ${y}`);
    return this;
  }

  /**
   * Draw an arc centered at current position
   * @param r - arc radius
   * @param startAngle - start angle in radians (0 = right, π/2 = up)
   * @param endAngle - end angle in radians
   * @returns this builder for chaining
   */
  arc(r: number, startAngle: number, endAngle: number) {
    const centerX = this.currentX;
    const centerY = this.currentY;

    // calculate start and end points
    const startX = centerX + r * Math.cos(startAngle);
    const startY = centerY + r * Math.sin(startAngle);
    const endX = centerX + r * Math.cos(endAngle);
    const endY = centerY + r * Math.sin(endAngle);

    // determine direction from angle order
    const angleDiff = endAngle - startAngle;
    const sweep = angleDiff > 0 ? 1 : 0; // positive = CCW in math coords = sweep=1 in SVG

    // determine if we need large arc (>180°)
    const absDiff = Math.abs(angleDiff);
    const largeArc = absDiff > Math.PI ? 1 : 0;

    // move to start point
    this.commands.push(`M ${startX} ${startY}`);

    // draw arc to end point
    const dx = endX - startX;
    const dy = endY - startY;
    this.commands.push(`a ${r} ${r} 0 ${largeArc} ${sweep} ${dx} ${dy}`);

    // update current position to end of arc
    this.currentX = endX;
    this.currentY = endY;

    return this;
  }

  // ------------------------------------
  // primitives
  // ------------------------------------

  /**
   * Draw an open arrow at current position
   * @param angleRad - direction the arrow points in radians (0 = right, π/2 = up)
   * @returns this builder for chaining
   */
  arrow(angleRad: number, size = 8) {
    const wingAngleRad = Math.PI / 4;
    const tipX = this.currentX;
    const tipY = this.currentY;

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

  /**
   * Draw a filled arrow at current position
   * @param angleRad - direction the arrow points in radians (0 = right, π/2 = up)
   * @returns this builder for chaining
   */
  arrowFilled(angleRad: number, size = 8) {
    const wingAngleRad = Math.PI / 4;
    const tipX = this.currentX;
    const tipY = this.currentY;

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
   * Draw a tick mark at current position
   * @param angleRad - orientation angle in radians (dimension line direction)
   * @returns this builder for chaining
   */
  tick(angleRad: number, size = 15) {

    const centerX = this.currentX;
    const centerY = this.currentY;

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

  /**
   * Draw a center mark (crosshair with center dot) at current position
   * @param size - total size of the crosshair, defaults to `10`
   * @returns this builder for chaining
   */
  centerMark(size = 10) {
    const half = size / 2;
    const x = this.currentX;
    const y = this.currentY;

    this.commands.push(
      `M ${x - half} ${y} L ${x + half} ${y}`,
      `M ${x} ${y - half} L ${x} ${y + half}`,
      `M ${x} ${y}`,
    );

    const dotR = size / 10;
    this.filledCommands.push(
      `M ${x - dotR} ${y} a ${dotR} ${dotR} 0 1 0 ${dotR * 2} 0 a ${dotR} ${dotR} 0 1 0 ${-(dotR * 2)} 0`,
    );

    return this;
  }

  /**
   * Rotate a point around a center point by a given angle
   * @param x - point x coordinate
   * @param y - point y coordinate
   * @param centerX - rotation center x
   * @param centerY - rotation center y
   * @param radians - rotation angle in radians
   * @returns rotated point coordinates
   */
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
   * Place text at position relative to current position
   * @param dx - horizontal offset from current position
   * @param dy - vertical offset from current position
   * @param text - text content to display
   * @param align - text alignment (maps to SVG text-anchor: start, middle, end), defaults to `"middle"`
   * @param className - optional class name for the text element
   * @returns this builder for chaining
   */
  textAt(
    dx: number,
    dy: number,
    text: string,
    align: TextAlign = "middle",
    className?: string,
  ) {
    this.textRecords.push({
      x: this.currentX + dx,
      y: this.currentY + dy,
      text,
      align,
      className,
    });
    return this;
  }

  /**
   * Place text at absolute position
   * @param x - absolute x coordinate
   * @param y - absolute y coordinate
   * @param text - text content to display
   * @param align - text alignment (maps to SVG text-anchor: start, middle, end), defaults to `"middle"`
   * @param className - optional class name for the text element
   * @returns this builder for chaining
   */
  textAtAbs(
    x: number,
    y: number,
    text: string,
    align: TextAlign = "middle",
    className?: string,
  ) {
    this.textRecords.push({ x, y, text, align, className });
    return this;
  }

  /**
   * Close the current path
   * @returns this builder for chaining
   */
  close() {
    this.commands.push("z");
    return this;
  }
}
