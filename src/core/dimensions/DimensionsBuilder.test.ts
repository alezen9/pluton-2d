import { describe, expect, it } from "vitest";
import { DimensionsBuilder } from "./DimensionsBuilder";

describe("DimensionsBuilder", () => {
  it("tracks path and text records from relative and absolute operations", () => {
    const builder = new DimensionsBuilder();

    builder
      .moveToAbs(10, 20)
      .lineTo(5, -10)
      .textAt(0, 0, "A")
      .textAtAbs(20, 30, "B", "end", "label");

    expect(builder.toPathData()).toBe("M 10 20 l 5 -10");
    expect(builder.getTexts()).toEqual([
      { x: 15, y: 10, text: "A", align: "middle", className: undefined },
      { x: 20, y: 30, text: "B", align: "end", className: "label" },
    ]);
  });

  it("writes filled commands for filled primitives", () => {
    const builder = new DimensionsBuilder();

    builder.moveToAbs(0, 0).arrowFilled(0, 8).centerMark(10);

    expect(builder.toFilledPathData()).toContain("Z");
    expect(builder.toFilledPathData()).toContain("a");
  });

  it("reset clears path, filled path, text and cursor state", () => {
    const builder = new DimensionsBuilder();

    builder.moveToAbs(5, 5).lineToAbs(10, 10).textAt(1, 2, "X");
    builder.reset();
    builder.lineTo(3, 4).textAt(0, 0, "Y");

    expect(builder.toPathData()).toBe("l 3 4");
    expect(builder.toFilledPathData()).toBe("");
    expect(builder.getTexts()).toEqual([{ x: 3, y: 4, text: "Y", align: "middle", className: undefined }]);
  });
});
