import { BackgroundLayer } from "./BackgroundLayer";
import { Layer } from "./Layer";

export class Scene {
  private backgroundLayer: BackgroundLayer;
  private geometryLayer: Layer;

  constructor(svg: SVGSVGElement) {
    this.backgroundLayer = new BackgroundLayer(svg);
    this.geometryLayer = new Layer(svg, "pluton-geometry");

    this.backgroundLayer.setCoordinateSystemCenteredYUp(svg);
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
