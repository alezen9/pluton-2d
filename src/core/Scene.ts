import { SVG_NS } from "./constants";
import { Defs } from "./Defs";
import { Background } from "./Background";
import {
  GeometryLayerInternal,
  type GeometryLayer,
} from "./geometry/GeometryLayer";
import {
  DimensionsLayerInternal,
  type DimensionsLayer,
} from "./dimensions/DimensionsLayer";

export class Scene {
  private geometryLayer: GeometryLayerInternal;
  private dimensionsLayer: DimensionsLayerInternal;

  constructor(svg: SVGSVGElement) {
    // defs
    const defsEl = document.createElementNS(SVG_NS, "defs");
    svg.insertBefore(defsEl, svg.firstChild);
    const defs = new Defs(defsEl);
    defs.syncForSvg(svg);

    // background
    new Background(svg, "pluton-background", defs);

    // geometry
    this.geometryLayer = new GeometryLayerInternal(svg, "pluton-geometry");
    this.geometryLayer.setCoordinateSystemCenteredYUp(svg);

    // dimensions
    this.dimensionsLayer = new DimensionsLayerInternal(
      svg,
      "pluton-dimensions",
    );
    this.dimensionsLayer.setCoordinateSystemCenteredYUp(svg);
  }

  get geometry() {
    return this.geometryLayer as GeometryLayer;
  }

  get dimensions() {
    return this.dimensionsLayer as DimensionsLayer;
  }

  beginRecord() {
    this.geometryLayer.beginRecord();
    this.dimensionsLayer.beginRecord();
  }

  commit() {
    this.geometryLayer.commit();
    this.dimensionsLayer.commit();
  }
}
