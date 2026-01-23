export class PathBuilder {
  private commands: string[] = [];

  /**
   * Absolute move. Sets the starting point.
   */
  moveTo(x: number, y: number): this {
    this.commands.push(`M ${x} ${y}`);
    return this;
  }

  /**
   * Relative line.
   * Moves by `(dx, dy)` from the current point.
   */
  lineTo(dx: number, dy: number): this {
    this.commands.push(`l ${dx} ${dy}`);
    return this;
  }

  /**
   * Relative arc.
   * Moves by `(dx, dy)` with radius `r`.
   * Uses small-arc-flag = 0 and sweep-flag based on clockwise.
   */
  arcTo(dx: number, dy: number, r: number, clockwise = false): this {
    if (r <= 0) {
      // Sharp corner fallback
      this.commands.push(`l ${dx} ${dy}`);
      return this;
    }

    const sweep = clockwise ? 1 : 0;
    this.commands.push(`a ${r} ${r} 0 0 ${sweep} ${dx} ${dy}`);
    return this;
  }

  close(): this {
    this.commands.push("z");
    return this;
  }

  reset(): void {
    this.commands.length = 0;
  }

  toString(): string {
    return this.commands.join(" ");
  }
}
