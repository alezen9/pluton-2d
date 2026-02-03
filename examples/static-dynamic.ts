import { Pluton2D } from "../src/index";

export type StaticDynamicParams = {
  size: number;
};

export function createStaticDynamicDemo(
  container: HTMLElement,
  params: StaticDynamicParams,
) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.style.width = "100%";
  svg.style.height = "100%";
  container.appendChild(svg);

  const bp = new Pluton2D(svg, params);
  const staticGroup = bp.geometry.group();
  staticGroup.setDrawUsage("static");
  const dynamicGroup = bp.geometry.group();

  bp.draw((p) => {
    const half = p.size / 2;
    const offset = 90;

    const path = staticGroup.path({ className: "demo-static" });
    path
      .moveToAbs(-offset - half, -half)
      .lineTo(p.size, 0)
      .lineTo(0, p.size)
      .lineTo(-p.size, 0)
      .close();

    const dynamicPath = dynamicGroup.path({ className: "demo-dynamic" });
    dynamicPath
      .moveToAbs(offset - half, -half)
      .lineTo(p.size, 0)
      .lineTo(0, p.size)
      .lineTo(-p.size, 0)
      .close();
  });

  return {
    bp,
    update: (newParams: StaticDynamicParams) =>
      Object.assign(bp.params, newParams),
  };
}
