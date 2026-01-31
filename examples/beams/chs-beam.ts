import { Pluton2D } from "../../src/index";
import type { CHSParams } from "../types";

export function createCHSBeam(container: HTMLElement, params: CHSParams) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.style.width = "100%";
  svg.style.height = "100%";
  container.appendChild(svg);

  const bp = new Pluton2D(svg, params);
  const geom = bp.geometry.group();
  const dims = bp.dimensions.group();

  bp.draw((p) => {
    const { radius: r, thickness: t } = p;
    const ir = r - t;

    const path = geom.path();

    path
      .moveToAbs(-r, 0)
      .arcTo(r, r, r, false)
      .arcTo(r, -r, r, false)
      .arcTo(-r, -r, r, false)
      .arcTo(-r, r, r, false);

    path
      .moveToAbs(-ir, 0)
      .arcTo(ir, ir, ir, false)
      .arcTo(ir, -ir, ir, false)
      .arcTo(-ir, -ir, ir, false)
      .arcTo(-ir, ir, ir, false);
  });

  bp.draw((p) => {
    const { radius: r, thickness: t } = p;

    const dim = dims.dimension();

    const angle = Math.PI / 4;
    const x = r * Math.cos(angle);
    const y = r * Math.sin(angle);

    // center mark
    dim.moveToAbs(0, 0).centerMark(20);

    // radius line
    dim
      .moveToAbs(0, 0)
      .lineToAbs(x, y)
      .arrowFilled(angle)
      .textAtAbs(x / 2 - 10, y / 2, `${r}mm`, "end");

    // angular dimension showing 45° angle
    const arcRadius = 40;
    dim
      .moveToAbs(0, 0)
      .arc(arcRadius, 0, angle)
      .textAtAbs(arcRadius * 0.7, 12, "45°", "middle");
  });

  return {
    bp,
    update: (newParams: CHSParams) => Object.assign(bp.params, newParams),
  };
}
