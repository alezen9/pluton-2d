function normalizePaintUrl(value: string): string {
  return value.replace(/url\((['"]?)(?:[^)"']*?)#([^)'"\\s]+)\1\)/g, "url(#$2)");
}

function formatDimension(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return String(Number(value.toFixed(3)));
}

function getDimensionFromAttribute(svg: SVGSVGElement, attr: "width" | "height"): number {
  const raw = svg.getAttribute(attr);
  if (!raw) return 0;
  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

function resolveViewBox(
  svg: SVGSVGElement,
  fallbackWidth: number,
  fallbackHeight: number,
): { x: number; y: number; width: number; height: number } {
  const vb = svg.viewBox?.baseVal;
  if (vb && vb.width > 0 && vb.height > 0) {
    return { x: vb.x, y: vb.y, width: vb.width, height: vb.height };
  }

  const rawViewBox = svg.getAttribute("viewBox");
  if (rawViewBox) {
    const values = rawViewBox
      .trim()
      .split(/[,\s]+/)
      .map((value) => Number.parseFloat(value));

    if (values.length === 4 && values.every(Number.isFinite) && values[2] > 0 && values[3] > 0) {
      return { x: values[0], y: values[1], width: values[2], height: values[3] };
    }
  }

  return { x: 0, y: 0, width: fallbackWidth, height: fallbackHeight };
}

function insertBackgroundRect(
  svg: SVGSVGElement,
  background: string,
  viewBox: { x: number; y: number; width: number; height: number },
): void {
  const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  rect.setAttribute("x", formatDimension(viewBox.x));
  rect.setAttribute("y", formatDimension(viewBox.y));
  rect.setAttribute("width", formatDimension(viewBox.width));
  rect.setAttribute("height", formatDimension(viewBox.height));
  rect.setAttribute("fill", background);
  rect.setAttribute("data-pluton-snapshot-background", "true");

  let insertBeforeNode: ChildNode | null = null;
  for (const child of Array.from(svg.childNodes)) {
    if (!(child instanceof SVGDefsElement)) {
      insertBeforeNode = child;
      break;
    }
  }

  if (insertBeforeNode) svg.insertBefore(rect, insertBeforeNode);
  else svg.appendChild(rect);
}

function copyComputedStyles(sourceSvg: SVGSVGElement, targetSvg: SVGSVGElement): void {
  const sourceNodes = [sourceSvg, ...Array.from(sourceSvg.querySelectorAll("*"))];
  const targetNodes = [targetSvg, ...Array.from(targetSvg.querySelectorAll("*"))];
  const nodeCount = Math.min(sourceNodes.length, targetNodes.length);

  for (let i = 0; i < nodeCount; i += 1) {
    const sourceNode = sourceNodes[i];
    const targetNode = targetNodes[i];

    if (!(sourceNode instanceof SVGElement) || !(targetNode instanceof SVGElement)) continue;

    const computed = globalThis.getComputedStyle(sourceNode);
    for (let j = 0; j < computed.length; j += 1) {
      const prop = computed.item(j);
      if (!prop || prop.startsWith("--")) continue;

      const value = computed.getPropertyValue(prop).trim();
      if (!value) continue;
      targetNode.style.setProperty(prop, normalizePaintUrl(value));
    }

    const styleAttr = targetNode.getAttribute("style");
    if (styleAttr) targetNode.setAttribute("style", normalizePaintUrl(styleAttr));

    for (const attr of Array.from(targetNode.attributes)) {
      const normalizedValue = normalizePaintUrl(attr.value);
      if (normalizedValue !== attr.value) {
        targetNode.setAttribute(attr.name, normalizedValue);
      }
    }
  }
}

/**
 * Create a standalone SVG snapshot string from a rendered SVG element.
 *
 * The snapshot:
 * - clones the live SVG DOM tree
 * - inlines computed styles for each SVG node
 * - normalizes paint URLs (`url(...#id)`) to local fragment form (`url(#id)`)
 * - ensures root `xmlns`, `width`, `height`, and `viewBox` attributes
 *
 * @param svg - Source SVG element to snapshot
 * @param options - Optional output dimensions. Defaults to rendered SVG size.
 * @param options.width - Output width in SVG user units/pixels
 * @param options.height - Output height in SVG user units/pixels
 * @param options.background - Optional background fill color to inject as a base rect
 * @returns Serialized SVG XML string including XML declaration
 */
export function snapshotSvg(
  svg: SVGSVGElement,
  options: { width?: number; height?: number; background?: string } = {},
): string {
  const rect = svg.getBoundingClientRect();

  const fallbackWidth =
    rect.width || svg.viewBox?.baseVal.width || svg.clientWidth || getDimensionFromAttribute(svg, "width") || 1;
  const fallbackHeight =
    rect.height ||
    svg.viewBox?.baseVal.height ||
    svg.clientHeight ||
    getDimensionFromAttribute(svg, "height") ||
    1;

  const width = options.width ?? fallbackWidth;
  const height = options.height ?? fallbackHeight;

  const clonedSvg = svg.cloneNode(true) as SVGSVGElement;
  const viewBox = resolveViewBox(svg, width, height);
  clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clonedSvg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  clonedSvg.setAttribute("width", formatDimension(width));
  clonedSvg.setAttribute("height", formatDimension(height));

  if (!clonedSvg.getAttribute("viewBox")) {
    clonedSvg.setAttribute(
      "viewBox",
      `${formatDimension(viewBox.x)} ${formatDimension(viewBox.y)} ${formatDimension(viewBox.width)} ${formatDimension(viewBox.height)}`,
    );
  }

  copyComputedStyles(svg, clonedSvg);
  if (options.background) insertBackgroundRect(clonedSvg, options.background, viewBox);

  const serializer = new XMLSerializer();
  return `<?xml version="1.0" encoding="UTF-8"?>\n${serializer.serializeToString(clonedSvg)}`;
}
