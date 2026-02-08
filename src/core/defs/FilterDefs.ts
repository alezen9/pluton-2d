import { SVG_NS } from "../constants";
import { upsertDef } from "./utils";

export class FilterDefs {
  readonly pencilFilterId = "pluton-filter-pencil";

  private defsEl: SVGDefsElement;
  private intensity = 1.25;
  private displacementMapEl: SVGElement | null = null;

  constructor(defsEl: SVGDefsElement) {
    this.defsEl = defsEl;
  }

  sync(): void {
    const { filter, displacementMap } = this.createPencilFilter();
    this.displacementMapEl = displacementMap;
    upsertDef(this.defsEl, filter);
  }

  setIntensity(intensity: number): void {
    if (!Number.isFinite(intensity)) return;

    const nextIntensity = Math.max(0, intensity);
    if (nextIntensity === this.intensity) return;

    this.intensity = nextIntensity;
    this.displacementMapEl?.setAttribute("scale", String(this.intensity));
  }

  private createPencilFilter(): {
    filter: SVGFilterElement;
    displacementMap: SVGElement;
  } {
    const frequency = 0.22;
    const octaves = 3;

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
    turbulence.setAttribute("seed", "1");
    turbulence.setAttribute("result", "turbulence");

    const displacementMap = document.createElementNS(
      SVG_NS,
      "feDisplacementMap",
    );
    displacementMap.setAttribute("in", "SourceGraphic");
    displacementMap.setAttribute("in2", "turbulence");
    displacementMap.setAttribute("scale", String(this.intensity));
    displacementMap.setAttribute("xChannelSelector", "R");
    displacementMap.setAttribute("yChannelSelector", "G");

    filter.appendChild(turbulence);
    filter.appendChild(displacementMap);

    return { filter, displacementMap };
  }
}
