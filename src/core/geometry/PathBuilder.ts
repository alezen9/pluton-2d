export class PathBuilder {
  private commands: string[] = [];

  /**
   * Move to a position relative to current position
   * @param dx - horizontal offset
   * @param dy - vertical offset
   * @returns this builder for chaining
   */
  moveTo(dx: number, dy: number) {
    this.commands.push(`m ${dx} ${dy}`);
    return this;
  }

  /**
   * Move to an absolute position
   * @param x - absolute x coordinate
   * @param y - absolute y coordinate
   * @returns this builder for chaining
   */
  moveToAbs(x: number, y: number) {
    this.commands.push(`M ${x} ${y}`);
    return this;
  }

  /**
   * Draw a line relative to current position
   * @param dx - horizontal offset
   * @param dy - vertical offset
   * @returns this builder for chaining
   */
  lineTo(dx: number, dy: number) {
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
    this.commands.push(`L ${x} ${y}`);
    return this;
  }

  /**
   * Draw a cubic Bezier curve relative to current position
   * @param c1dx - first control point horizontal offset
   * @param c1dy - first control point vertical offset
   * @param c2dx - second control point horizontal offset
   * @param c2dy - second control point vertical offset
   * @param dx - end point horizontal offset
   * @param dy - end point vertical offset
   * @returns this builder for chaining
   */
  cubicTo(c1dx: number, c1dy: number, c2dx: number, c2dy: number, dx: number, dy: number) {
    this.commands.push(`c ${c1dx} ${c1dy} ${c2dx} ${c2dy} ${dx} ${dy}`);
    return this;
  }

  /**
   * Draw a cubic Bezier curve to an absolute position
   * @param c1x - first control point absolute x coordinate
   * @param c1y - first control point absolute y coordinate
   * @param c2x - second control point absolute x coordinate
   * @param c2y - second control point absolute y coordinate
   * @param x - end point absolute x coordinate
   * @param y - end point absolute y coordinate
   * @returns this builder for chaining
   */
  cubicToAbs(c1x: number, c1y: number, c2x: number, c2y: number, x: number, y: number) {
    this.commands.push(`C ${c1x} ${c1y} ${c2x} ${c2y} ${x} ${y}`);
    return this;
  }

  /**
   * Draw a smooth cubic Bezier curve relative to current position
   * @param c2dx - second control point horizontal offset
   * @param c2dy - second control point vertical offset
   * @param dx - end point horizontal offset
   * @param dy - end point vertical offset
   * @returns this builder for chaining
   */
  smoothCubicTo(c2dx: number, c2dy: number, dx: number, dy: number) {
    this.commands.push(`s ${c2dx} ${c2dy} ${dx} ${dy}`);
    return this;
  }

  /**
   * Draw a smooth cubic Bezier curve to an absolute position
   * @param c2x - second control point absolute x coordinate
   * @param c2y - second control point absolute y coordinate
   * @param x - end point absolute x coordinate
   * @param y - end point absolute y coordinate
   * @returns this builder for chaining
   */
  smoothCubicToAbs(c2x: number, c2y: number, x: number, y: number) {
    this.commands.push(`S ${c2x} ${c2y} ${x} ${y}`);
    return this;
  }

  /**
   * Draw a quadratic Bezier curve relative to current position
   * @param c1dx - control point horizontal offset
   * @param c1dy - control point vertical offset
   * @param dx - end point horizontal offset
   * @param dy - end point vertical offset
   * @returns this builder for chaining
   */
  quadTo(c1dx: number, c1dy: number, dx: number, dy: number) {
    this.commands.push(`q ${c1dx} ${c1dy} ${dx} ${dy}`);
    return this;
  }

  /**
   * Draw a quadratic Bezier curve to an absolute position
   * @param c1x - control point absolute x coordinate
   * @param c1y - control point absolute y coordinate
   * @param x - end point absolute x coordinate
   * @param y - end point absolute y coordinate
   * @returns this builder for chaining
   */
  quadToAbs(c1x: number, c1y: number, x: number, y: number) {
    this.commands.push(`Q ${c1x} ${c1y} ${x} ${y}`);
    return this;
  }

  /**
   * Draw a smooth quadratic Bezier curve relative to current position
   * @param dx - end point horizontal offset
   * @param dy - end point vertical offset
   * @returns this builder for chaining
   */
  smoothQuadTo(dx: number, dy: number) {
    this.commands.push(`t ${dx} ${dy}`);
    return this;
  }

  /**
   * Draw a smooth quadratic Bezier curve to an absolute position
   * @param x - end point absolute x coordinate
   * @param y - end point absolute y coordinate
   * @returns this builder for chaining
   */
  smoothQuadToAbs(x: number, y: number) {
    this.commands.push(`T ${x} ${y}`);
    return this;
  }

  /**
   * Draw an arc relative to current position
   * @param dx - horizontal offset to end point
   * @param dy - vertical offset to end point
   * @param r - arc radius
   * @param clockwise - whether the arc sweeps clockwise
   * @defaultValue false
   * @param largeArc - whether to take the arc > 180°
   * @defaultValue false
   * @returns this builder for chaining
   */
  arcTo(dx: number, dy: number, r: number, clockwise = false, largeArc = false) {
    if (r <= 0) {
      // sharp corner fallback
      this.commands.push(`l ${dx} ${dy}`);
      return this;
    }

    const sweep = clockwise ? 0 : 1;
    const la = largeArc ? 1 : 0;
    this.commands.push(`a ${r} ${r} 0 ${la} ${sweep} ${dx} ${dy}`);
    return this;
  }

  /**
   * Draw an arc to an absolute position
   * @param x - absolute x coordinate of end point
   * @param y - absolute y coordinate of end point
   * @param r - arc radius
   * @param clockwise - whether the arc sweeps clockwise
   * @defaultValue false
   * @param largeArc - whether to take the arc > 180°
   * @defaultValue false
   * @returns this builder for chaining
   */
  arcToAbs(x: number, y: number, r: number, clockwise = false, largeArc = false) {
    if (r <= 0) {
      this.commands.push(`L ${x} ${y}`);
      return this;
    }

    const sweep = clockwise ? 0 : 1;
    const la = largeArc ? 1 : 0;
    this.commands.push(`A ${r} ${r} 0 ${la} ${sweep} ${x} ${y}`);
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

  /**
   * Reset the builder
   */
  reset() {
    this.commands.length = 0;
  }

  /**
   * Get the SVG path data string
   * @returns SVG path data
   */
  toString() {
    return this.commands.join(" ");
  }
}
