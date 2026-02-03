import { Pluton2D } from "../../src/index";
import type { RHSParams } from "../types";

export function createRHSBeam(container: HTMLElement, params: RHSParams) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.style.width = "100%";
  svg.style.height = "100%";
  container.appendChild(svg);

  const bp = new Pluton2D(svg, params);
  const geom = bp.geometry.group();
  const dims = bp.dimensions.group();

  bp.draw((p) => {
    const {
      width: w,
      height: h,
      thickness: t,
      outerRadius: ro,
      innerRadius: ri,
    } = p;

    const iw = w - 2 * t;
    const ih = h - 2 * t;

    const path = geom.path({ className: "rhs" });

    path
      .moveToAbs(-w / 2 + ro, -h / 2)
      .lineTo(w - 2 * ro, 0)
      .arcTo(ro, ro, ro, false)
      .lineTo(0, h - 2 * ro)
      .arcTo(-ro, ro, ro, false)
      .lineTo(-w + 2 * ro, 0)
      .arcTo(-ro, -ro, ro, false)
      .lineTo(0, -h + 2 * ro)
      .arcTo(ro, -ro, ro, false)
      .close();

    path
      .moveToAbs(-iw / 2 + ri, -ih / 2)
      .lineTo(iw - 2 * ri, 0)
      .arcTo(ri, ri, ri, false)
      .lineTo(0, ih - 2 * ri)
      .arcTo(-ri, ri, ri, false)
      .lineTo(-iw + 2 * ri, 0)
      .arcTo(-ri, -ri, ri, false)
      .lineTo(0, -ih + 2 * ri)
      .arcTo(ri, -ri, ri, false)
      .close();

    const dim = dims.dimension();

    // width
    dim
      .moveToAbs(-w / 2, -h / 2 - 20)
      .tick(0)
      .lineTo(w, 0)
      .tick(0)
      .textAt(-w / 2, -16, `${w}mm`, "middle");

    // height
    dim
      .moveToAbs(w / 2 + 40, -h / 2)
      .tick(-Math.PI / 2)
      .lineTo(0, h)
      .tick(Math.PI / 2)
      .textAt(5, -h / 2, `${h}mm`, "start");

    // thickness
    dim
      .moveToAbs(-w / 2, 20)
      .tick(0)
      .lineTo(-30, 0)
      .moveToAbs(-w / 2 + t, 20)
      .tick(Math.PI)
      .lineTo(50, 0)
      .textAt(5, 0, `${t}mm`, "start");
  });

  return {
    bp,
    update: (newParams: RHSParams) => Object.assign(bp.params, newParams),
  };
}
