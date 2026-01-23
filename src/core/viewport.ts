export type Viewport = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function getSvgViewport(svg: SVGSVGElement): Viewport {
  const vb = svg.viewBox?.baseVal;
  if (vb && vb.width && vb.height) {
    return { x: vb.x, y: vb.y, width: vb.width, height: vb.height };
  }

  const wAttr = Number(svg.getAttribute("width")) || 0;
  const hAttr = Number(svg.getAttribute("height")) || 0;
  if (wAttr && hAttr) {
    return { x: 0, y: 0, width: wAttr, height: hAttr };
  }

  const rect = svg.getBoundingClientRect();
  return { x: 0, y: 0, width: rect.width, height: rect.height };
}

export function applyCenteredYUpTransform(g: SVGGElement, vp: Viewport) {
  const cx = vp.x + vp.width / 2;
  const cy = vp.y + vp.height / 2;
  g.setAttribute("transform", `translate(${cx}, ${cy}) scale(1, -1)`);
}
