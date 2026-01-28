export class PathBuilder {
  private commands: string[] = [];

  /**
   * Move to an absolute position (sets starting point).
   * @param x - absolute x coordinate
   * @param y - absolute y coordinate
   * @returns this builder for chaining
   */
  moveTo(x: number, y: number) {
    this.commands.push(`M ${x} ${y}`);
    return this;
  }

  /**
   * Draw a line relative to current position.
   * @param dx - horizontal offset
   * @param dy - vertical offset
   * @returns this builder for chaining
   */
  lineTo(dx: number, dy: number) {
    this.commands.push(`l ${dx} ${dy}`);
    return this;
  }

  /**
   * Draw an arc to a position relative to current position.
   * Falls back to straight line if radius is zero.
   * @param dx - horizontal offset to end point
   * @param dy - vertical offset to end point
   * @param r - arc radius
   * @param clockwise - arc direction (default: false = counterclockwise)
   * @returns this builder for chaining
   */
  arcTo(dx: number, dy: number, r: number, clockwise = false) {
    if (r <= 0) {
      // sharp corner fallback
      this.commands.push(`l ${dx} ${dy}`);
      return this;
    }

    const sweep = clockwise ? 1 : 0;
    this.commands.push(`a ${r} ${r} 0 0 ${sweep} ${dx} ${dy}`);
    return this;
  }

  /**
   * Close the current path.
   * @returns this builder for chaining
   */
  close() {
    this.commands.push("z");
    return this;
  }

  /**
   * Reset the builder, clearing all commands.
   */
  reset() {
    this.commands.length = 0;
  }

  /**
   * Get the SVG path data string.
   * @returns SVG path data
   */
  toString() {
    return this.commands.join(" ");
  }
}
