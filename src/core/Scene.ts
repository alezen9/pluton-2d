import { BackgroundLayer } from "./BackgroundLayer";
import { SVG_NS } from "./constants";
import { Layer } from "./Layer";
import { Defs } from "./Defs";

export class Scene {
  private geometryLayer: Layer;

  constructor(svg: SVGSVGElement) {
    const defsEl = document.createElementNS(SVG_NS, "defs");
    svg.insertBefore(defsEl, svg.firstChild);
    const defs = new Defs(defsEl);
    defs.syncForSvg(svg);

    const backgroundLayer = new BackgroundLayer(svg, "pluton-background", defs);
    backgroundLayer.setCoordinateSystemCenteredYUp(svg);

    this.geometryLayer = new Layer(svg, "pluton-geometry");
    this.geometryLayer.setCoordinateSystemCenteredYUp(svg);
  }

  get geometry() {
    return this.geometryLayer;
  }

  beginRecord() {
    this.geometryLayer.beginRecord();
  }

  commit() {
    this.geometryLayer.commit();
  }
}
