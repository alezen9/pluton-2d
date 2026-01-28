import { SVG_NS } from "../constants";
import { upsertDef } from "./utils";

export class FilterDefs {
  readonly pencilFilterId = "pluton-filter-pencil";

  private defsEl: SVGDefsElement;
  private intensity: number;

  constructor(defsEl: SVGDefsElement, intensity = 1) {
    this.defsEl = defsEl;
    this.intensity = intensity;
  }

  sync(): void {
    upsertDef(this.defsEl, this.createPencilFilter());
  }

  private createPencilFilter(): SVGFilterElement {
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

    return filter;
  }
}
