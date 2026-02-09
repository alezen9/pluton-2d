import { describe, expect, it } from "vitest";
import { PathBuilder } from "./PathBuilder";

describe("PathBuilder", () => {
  it("builds chained SVG path commands", () => {
    const path = new PathBuilder()
      .moveToAbs(10, 20)
      .lineTo(5, -2)
      .cubicTo(1, 2, 3, 4, 5, 6)
      .quadToAbs(20, 30, 40, 50)
      .close()
      .toString();

    expect(path).toBe("M 10 20 l 5 -2 c 1 2 3 4 5 6 Q 20 30 40 50 z");
  });

  it("falls back to line commands when arc radius is not positive", () => {
    const relative = new PathBuilder().moveToAbs(0, 0).arcTo(10, 5, 0).toString();
    const absolute = new PathBuilder().moveToAbs(0, 0).arcToAbs(10, 5, -1).toString();

    expect(relative).toBe("M 0 0 l 10 5");
    expect(absolute).toBe("M 0 0 L 10 5");
  });

  it("resets accumulated commands", () => {
    const builder = new PathBuilder();
    builder.moveToAbs(0, 0).lineToAbs(10, 0);
    expect(builder.toString()).toBe("M 0 0 L 10 0");

    builder.reset();
    expect(builder.toString()).toBe("");
  });
});
