// src/core/Defs.ts
import { SVG_NS } from "./constants";
import { getSvgViewport } from "./viewport";

export class Defs {
  private defsEl: SVGDefsElement;

  // patterns
  readonly hatchFill45Id = "pluton-pattern-fill-hatch-45";
  readonly graphPaperPatternId = "pluton-pattern-graph-paper";

  // graph paper fade
  readonly graphPaperGradientId = "pluton-gradient-graph-paper";
  readonly graphPaperMaskId = "pluton-mask-graph-paper";

  // vfx
  readonly pencilFilterId = "pluton-filter-pencil";

  constructor(defsEl: SVGDefsElement) {
    this.defsEl = defsEl;
  }

  /** Call once on init (and again if SVG viewport changes). */
  syncForSvg(svg: SVGSVGElement) {
    const vp = getSvgViewport(svg);

    // Fixed defs
    this.upsert(this.createHatchFill45Pattern());
    this.upsert(this.createGraphPaperPattern());

    // Viewport-dependent defs
    this.upsert(this.createGraphPaperFadeGradient(vp));
    this.upsert(this.createGraphPaperFadeMask(vp));

    // VFX (filter region sized generously in user-space)
    this.upsert(this.createPencilFilter());
  }

  // ---------------------------------------------------------------------------

  private upsert(node: Element) {
    const id = node.getAttribute("id");
    if (!id) {
      this.defsEl.appendChild(node);
      return;
    }

    const existing = this.defsEl.querySelector(`#${id}`);
    if (existing) existing.replaceWith(node);
    else this.defsEl.appendChild(node);
  }

  // ------------------------------- patterns ---------------------------------

  private createHatchFill45Pattern() {
    const pattern = document.createElementNS(SVG_NS, "pattern");
    pattern.setAttribute("id", this.hatchFill45Id);
    pattern.setAttribute("patternUnits", "userSpaceOnUse");
    pattern.setAttribute("width", "8");
    pattern.setAttribute("height", "8");
    pattern.setAttribute("patternTransform", "rotate(-45)");

    const line = document.createElementNS(SVG_NS, "line");
    line.setAttribute("x1", "0");
    line.setAttribute("y1", "0");
    line.setAttribute("x2", "0");
    line.setAttribute("y2", "8");
    line.setAttribute("stroke", "rgba(0, 39, 50, 0.2)");
    line.setAttribute("stroke-width", "12.5");

    pattern.appendChild(line);
    return pattern;
  }

  private createGraphPaperPattern() {
    const smallSize = 10;
    const majorSize = 50;

    const pattern = document.createElementNS(SVG_NS, "pattern");
    pattern.setAttribute("id", this.graphPaperPatternId);
    pattern.setAttribute("patternUnits", "userSpaceOnUse");
    pattern.setAttribute("x", "0");
    pattern.setAttribute("y", "0");
    pattern.setAttribute("width", String(majorSize));
    pattern.setAttribute("height", String(majorSize));

    const minorPath = document.createElementNS(SVG_NS, "path");
    minorPath.classList.add("pluton-pattern-graph-paper-minor");

    const minorCount = Math.max(1, Math.floor(majorSize / smallSize));
    const cmds: string[] = [];

    for (let i = 1; i < minorCount; i++) {
      const x = i * smallSize;
      cmds.push(`M ${x} 0 L ${x} ${majorSize}`);
    }
    for (let i = 1; i < minorCount; i++) {
      const y = i * smallSize;
      cmds.push(`M 0 ${y} L ${majorSize} ${y}`);
    }

    minorPath.setAttribute("d", cmds.join(" "));
    pattern.appendChild(minorPath);

    const majorPath = document.createElementNS(SVG_NS, "path");
    majorPath.classList.add("pluton-pattern-graph-paper-major");
    majorPath.setAttribute(
      "d",
      `M ${majorSize} 0 L ${majorSize} ${majorSize} M 0 ${majorSize} L ${majorSize} ${majorSize}`,
    );
    pattern.appendChild(majorPath);

    return pattern;
  }

  // ----------------------------- fade (viewport) ----------------------------

  private createGraphPaperFadeGradient(
    viewport: ReturnType<typeof getSvgViewport>,
  ) {
    // Tweaks (0..1)
    const fadeStartPct = 0.65; // fade starts at 65% of radius
    const fadeEndPct = 1.0; // fade reaches edge at 100% of radius

    const halfW = viewport.width / 2;
    const halfH = viewport.height / 2;

    // use half diagonal so corners fade nicely
    const halfDiag = Math.sqrt(halfW * halfW + halfH * halfH);

    const fadeStartRadius = halfDiag * fadeStartPct;
    const fadeEndRadius = halfDiag * fadeEndPct;

    const grad = document.createElementNS(SVG_NS, "radialGradient");
    grad.setAttribute("id", this.graphPaperGradientId);
    grad.setAttribute("gradientUnits", "userSpaceOnUse");
    grad.setAttribute("cx", "0");
    grad.setAttribute("cy", "0");
    grad.setAttribute("r", String(fadeEndRadius));

    const stop0 = document.createElementNS(SVG_NS, "stop");
    stop0.setAttribute("offset", "0");
    stop0.setAttribute("stop-color", "white");

    const stop1 = document.createElementNS(SVG_NS, "stop");
    stop1.setAttribute(
      "offset",
      fadeEndRadius === 0 ? "0" : String(fadeStartRadius / fadeEndRadius),
    );
    stop1.setAttribute("stop-color", "white");

    const stop2 = document.createElementNS(SVG_NS, "stop");
    stop2.setAttribute("offset", "1");
    stop2.setAttribute("stop-color", "black");

    grad.append(stop0, stop1, stop2);
    return grad;
  }

  private createGraphPaperFadeMask(
    viewport: ReturnType<typeof getSvgViewport>,
  ) {
    const halfW = viewport.width / 2;
    const halfH = viewport.height / 2;
    const halfDiag = Math.sqrt(halfW * halfW + halfH * halfH);

    const mask = document.createElementNS(SVG_NS, "mask");
    mask.setAttribute("id", this.graphPaperMaskId);
    mask.setAttribute("maskUnits", "userSpaceOnUse");
    mask.setAttribute("x", String(-halfDiag));
    mask.setAttribute("y", String(-halfDiag));
    mask.setAttribute("width", String(halfDiag * 2));
    mask.setAttribute("height", String(halfDiag * 2));

    const rect = document.createElementNS(SVG_NS, "rect");
    rect.setAttribute("x", String(-halfDiag));
    rect.setAttribute("y", String(-halfDiag));
    rect.setAttribute("width", String(halfDiag * 2));
    rect.setAttribute("height", String(halfDiag * 2));
    rect.setAttribute("fill", `url(#${this.graphPaperGradientId})`);

    mask.appendChild(rect);
    return mask;
  }

  // ---------------------------------- vfx -----------------------------------

  private createPencilFilter(): SVGFilterElement {
    const frequency = 0.22;
    const octaves = 3;
    const intensity = 1.5;
    const filter = document.createElementNS(SVG_NS, "filter");
    filter.setAttribute("id", this.pencilFilterId);
    filter.setAttribute("x", "-50%");
    filter.setAttribute("y", "-50%");
    filter.setAttribute("width", "200%");
    filter.setAttribute("height", "200%");

    const turbulence = document.createElementNS(SVG_NS, "feTurbulence");
    turbulence.setAttribute("type", "fractalNoise");
    turbulence.setAttribute("baseFrequency", String(frequency));
    turbulence.setAttribute("numOctaves", String(octaves));
    turbulence.setAttribute("result", "turbulence");

    const displacementMap = document.createElementNS(
      SVG_NS,
      "feDisplacementMap",
    );
    displacementMap.setAttribute("in", "SourceGraphic");
    displacementMap.setAttribute("in2", "turbulence");
    displacementMap.setAttribute("scale", String(intensity));
    displacementMap.setAttribute("xChannelSelector", "R");
    displacementMap.setAttribute("yChannelSelector", "G");

    filter.appendChild(turbulence);
    filter.appendChild(displacementMap);

    return filter;
  }
}
