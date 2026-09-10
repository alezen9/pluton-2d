import type { SvgNode } from "./SvgNode";
import type { Context } from "./Context";
import type { EventBus } from "./EventBus";
import { Background } from "./Background";
import { GeometryLayerInternal } from "./geometry/GeometryLayer";
import { DimensionsLayerInternal } from "./dimensions/DimensionsLayer";
import type { GeometryLayer } from "./geometry/GeometryLayer";
import type { DimensionsLayer } from "./dimensions/DimensionsLayer";
import type { Viewport } from "./Context";

export class Scene {
  private context: Context;
  private backgroundLayer: SvgNode;
  private worldLayer: SvgNode;
  private geometryLayer: GeometryLayerInternal;
  private dimensionsLayer: DimensionsLayerInternal;
  private filterEnabled = false;
  private maskEnabled = false;
  private background: Background;

  private lastCameraTransform = "";

  constructor(context: Context, events: EventBus) {
    this.context = context;

    const svg = context.svg;

    const backgroundContainer = svg.create("g");
    backgroundContainer.addClass("pluton-background-container");
    backgroundContainer.setAttribute(
      "mask",
      `url(#${context.defs.graphPaperMaskId})`,
    );
    svg.append(backgroundContainer);

    this.backgroundLayer = svg.create("g");
    this.backgroundLayer.addClass("pluton-background-layer");
    backgroundContainer.append(this.backgroundLayer);

    this.background = new Background(this.backgroundLayer, context);

    const contentContainer = svg.create("g");
    contentContainer.addClass("pluton-content-container");
    svg.append(contentContainer);

    this.worldLayer = svg.create("g");
    this.worldLayer.addClass("pluton-world-layer");
    contentContainer.append(this.worldLayer);

    this.geometryLayer = new GeometryLayerInternal(this.worldLayer, events);
    this.dimensionsLayer = new DimensionsLayerInternal(this.worldLayer, events);

    this.applyFilter();
    this.updateTransforms();
  }

  get geometry() {
    return this.geometryLayer as GeometryLayer;
  }

  get dimensions() {
    return this.dimensionsLayer as DimensionsLayer;
  }

  dispose() {
    this.geometryLayer.dispose();
    this.dimensionsLayer.dispose();
    this.backgroundLayer.parent?.remove();
    this.worldLayer.parent?.remove();
  }

  updateTransforms() {
    const viewport = this.context.viewport();
    const camera = this.context.camera();

    const cx = viewport.x + viewport.width * 0.5;
    const cy = viewport.y + viewport.height * 0.5;

    if (camera) {
      const tx = cx + camera.panX;
      const ty = cy + camera.panY;
      const s = camera.scale * camera.multiplier;
      const cameraT = `translate(${tx}px, ${ty}px) scale(${s}, ${-s})`;

      if (cameraT !== this.lastCameraTransform) {
        this.backgroundLayer.setStyle("transform", cameraT);
        this.worldLayer.setStyle("transform", cameraT);
        this.lastCameraTransform = cameraT;
      }
    }
  }

  onViewportChanged(viewport: Viewport) {
    this.background.updateForViewport(viewport);
  }

  enableGrid(enabled: boolean) {
    this.background.enableGrid(enabled);
  }

  enableAxes(enabled: boolean) {
    this.background.enableAxes(enabled);
  }

  enableFilter(enabled: boolean) {
    this.filterEnabled = enabled;
    this.applyFilter();
  }

  enableMask(enabled: boolean) {
    this.maskEnabled = enabled;
    this.updateMaskClass();
  }

  private applyFilter() {
    const filterId = this.context.defs.displacementFilterId;
    const filterValue = this.filterEnabled ? `url(#${filterId})` : "none";

    this.geometryLayer.root.setStyle("filter", filterValue);
    this.dimensionsLayer.root.setStyle("filter", filterValue);
  }

  private updateMaskClass() {
    this.context.svg.toggleClass("pluton-mask-on", this.maskEnabled);
  }
}
