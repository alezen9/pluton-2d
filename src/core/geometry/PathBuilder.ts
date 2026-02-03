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
