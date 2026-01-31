import { Pluton2D } from "../../src/index";
import type { IBeamParams } from "../types";

export function createIBeam(container: HTMLElement, params: IBeamParams) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.style.width = "100%";
  svg.style.height = "100%";
  container.appendChild(svg);

  const bp = new Pluton2D(svg, params);
  const geom = bp.geometry.group();
  const dims = bp.dimensions.group();

  bp.draw((p) => {
    const fw = p.width;
    const ft = p.flangeThickness;
    const wt = p.webThickness;
    const h = p.height;
    const r = p.filletRadius;

    const path = geom.path();
    path
      .moveToAbs(0, 0)
      .lineTo(fw / 2, 0)
      .lineTo(0, ft)
      .lineTo(-fw / 2 + wt / 2 + r, 0)
      .arcTo(-r, r, r, false)
      .lineTo(0, h - 2 * ft - 2 * r)
      .arcTo(r, r, r, false)
      .lineTo(fw / 2 - wt / 2 - r, 0)
      .lineTo(0, ft)
      .lineTo(-fw, 0)
      .lineTo(0, -ft)
      .lineTo(fw / 2 - wt / 2 - r, 0)
      .arcTo(r, -r, r, false)
      .lineTo(0, -h + 2 * ft + 2 * r)
      .arcTo(-r, -r, r, false)
      .lineTo(-fw / 2 + wt / 2 + r, 0)
      .lineTo(0, -ft)
      .lineTo(fw / 2, 0);

    geom.translate(0, -h / 2);
  });

  bp.draw((p) => {
    const fw = p.width;
    const ft = p.flangeThickness;
    const wt = p.webThickness;
    const h = p.height;

    const dim = dims.dimension();

    // web thickness
    dim
      .moveToAbs(-wt / 2, (h / 2 - ft) / 2)
      .tick(0)
      .lineTo(-30, 0)
      .moveToAbs(wt / 2, (h / 2 - ft) / 2)
      .tick(Math.PI)
      .lineTo(50, 0)
      .textAt(10, 0, `${wt}`, "start");

    // flange width
    dim
      .moveToAbs(-fw / 2, -h / 2 - 20)
      .tick(0)
      .lineTo(fw, 0)
      .tick(0)
      .textAt(-fw / 2, -16, `${fw}`, "middle");

    // height
    dim
      .moveToAbs(fw / 2 + 40, -h / 2)
      .tick(-Math.PI / 2)
      .lineTo(0, h)
      .tick(Math.PI / 2)
      .textAt(18, -h / 2, `${h}`, "start");
  });

  return {
    bp,
    update: (newParams: IBeamParams) => Object.assign(bp.params, newParams),
  };
}
