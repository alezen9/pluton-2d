import { SVG_NS } from "./constants";
import type { Context } from "./Context";
import type { EventBus } from "./EventBus";
import { Background } from "./Background";
import { GeometryLayerInternal } from "./geometry/GeometryLayer";
import { DimensionsLayerInternal } from "./dimensions/DimensionsLayer";
import type { GeometryLayer, DimensionsLayer } from "./types";
import type { Viewport } from "./Context";

export class Scene {
  private context: Context;
  private viewportLayer: SVGGElement;
  private backgroundLayer: SVGGElement;
  private worldLayer: SVGGElement;
  private geometryLayer: GeometryLayerInternal;
  private dimensionsLayer: DimensionsLayerInternal;
  private pencilFilterEnabled = false;
  private background: Background;

  private lastViewportTransform = "";
  private lastBackgroundTransform = "";
  private lastWorldTransform = "";

  constructor(context: Context, events: EventBus) {
    this.context = context;

    const svg = context.svg;

    this.viewportLayer = document.createElementNS(SVG_NS, "g");
    this.viewportLayer.classList.add("pluton-viewport-layer");
    this.viewportLayer.style.willChange = "transform";
    svg.appendChild(this.viewportLayer);

    const backgroundContainer = document.createElementNS(SVG_NS, "g");
    backgroundContainer.classList.add("pluton-background-container");
    backgroundContainer.setAttribute(
      "mask",
      `url(#${context.defs.graphPaperMaskId})`,
    );
    svg.appendChild(backgroundContainer);

    this.backgroundLayer = document.createElementNS(SVG_NS, "g");
    this.backgroundLayer.classList.add("pluton-background-layer");
    this.backgroundLayer.style.willChange = "transform";
    backgroundContainer.appendChild(this.backgroundLayer);

    this.background = new Background(this.backgroundLayer, context);

    const contentContainer = document.createElementNS(SVG_NS, "g");
    contentContainer.classList.add("pluton-content-container");
    svg.appendChild(contentContainer);

    this.worldLayer = document.createElementNS(SVG_NS, "g");
    this.worldLayer.classList.add("pluton-world-layer");
    this.worldLayer.style.willChange = "transform";
    contentContainer.appendChild(this.worldLayer);

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
    this.viewportLayer.remove();
    this.backgroundLayer.parentElement?.remove();
    this.worldLayer.parentElement?.remove();
  }

  updateTransforms() {
    const viewport = this.context.viewport();
    const camera = this.context.camera();

    const cx = viewport.x + viewport.width * 0.5;
    const cy = viewport.y + viewport.height * 0.5;

    const viewportT = `translate(${cx}px, ${cy}px) scale(1, -1)`;
    if (viewportT !== this.lastViewportTransform) {
      this.viewportLayer.style.transform = viewportT;
      this.lastViewportTransform = viewportT;
    }

    if (camera) {
      const tx = cx + camera.panX;
      const ty = cy + camera.panY;
      const s = camera.scale;
      const cameraT = `translate(${tx}px, ${ty}px) scale(${s}, ${-s})`;

      if (cameraT !== this.lastBackgroundTransform) {
        this.backgroundLayer.style.transform = cameraT;
        this.lastBackgroundTransform = cameraT;
      }
      if (cameraT !== this.lastWorldTransform) {
        this.worldLayer.style.transform = cameraT;
        this.lastWorldTransform = cameraT;
      }
    }
  }

  onViewportChanged(viewport: Viewport) {
    this.background.updateForViewport(viewport);
  }

  enableFilter(enabled: boolean) {
    this.pencilFilterEnabled = enabled;
    this.applyFilter();
  }

  private applyFilter() {
    const filterId = this.context.defs.pencilFilterId;
    const filterValue = this.pencilFilterEnabled ? `url(#${filterId})` : "none";

    this.geometryLayer.root.style.filter = filterValue;
    this.dimensionsLayer.root.style.filter = filterValue;
  }
}
