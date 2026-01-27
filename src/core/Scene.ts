import { SVG_NS } from './constants';
import type { Context, Viewport, CameraState } from './Context';
import type { EventBus } from './EventBus';
import { Background } from './Background';
import { GeometryLayerInternal } from './geometry/GeometryLayer';
import { DimensionsLayerInternal } from './dimensions/DimensionsLayer';
import type { GeometryLayer, DimensionsLayer } from './types';

export class Scene {
  private context: Context;
  private viewportLayer: SVGGElement;
  private backgroundLayer: SVGGElement;
  private worldLayer: SVGGElement;
  private background: Background;
  private geometryLayer: GeometryLayerInternal;
  private dimensionsLayer: DimensionsLayerInternal;

  constructor(context: Context, events: EventBus) {
    this.context = context;

    const svg = context.svg;

    this.viewportLayer = document.createElementNS(SVG_NS, 'g');
    this.viewportLayer.classList.add('pluton-viewport-layer');
    svg.appendChild(this.viewportLayer);

    const backgroundContainer = document.createElementNS(SVG_NS, 'g');
    backgroundContainer.classList.add('pluton-background-container');
    backgroundContainer.setAttribute('mask', `url(#${context.defs.graphPaperMaskId})`);
    svg.appendChild(backgroundContainer);

    this.backgroundLayer = document.createElementNS(SVG_NS, 'g');
    this.backgroundLayer.classList.add('pluton-background-layer');
    backgroundContainer.appendChild(this.backgroundLayer);

    this.background = new Background(this.backgroundLayer, context);

    const contentContainer = document.createElementNS(SVG_NS, 'g');
    contentContainer.classList.add('pluton-content-container');
    svg.appendChild(contentContainer);

    this.worldLayer = document.createElementNS(SVG_NS, 'g');
    this.worldLayer.classList.add('pluton-world-layer');
    contentContainer.appendChild(this.worldLayer);

    this.geometryLayer = new GeometryLayerInternal(this.worldLayer, events);
    this.dimensionsLayer = new DimensionsLayerInternal(this.worldLayer, events);

    this.updateTransforms();
  }

  get geometry() {
    return this.geometryLayer as GeometryLayer;
  }

  get dimensions() {
    return this.dimensionsLayer as DimensionsLayer;
  }

  updateTransforms() {
    const viewport = this.context.viewport();
    const camera = this.context.camera();

    this.applyCenteredYUpTransform(this.viewportLayer, viewport);

    if (camera) {
      this.applyCameraTransform(this.backgroundLayer, viewport, camera);
      this.applyCameraTransform(this.worldLayer, viewport, camera);
      this.background.updateAxesExtent(viewport);
    }
  }

  private applyCameraTransform(g: SVGGElement, viewport: Viewport, camera: CameraState) {
    const cx = viewport.x + viewport.width * 0.5;
    const cy = viewport.y + viewport.height * 0.5;
    const tx = cx + camera.panX;
    const ty = cy + camera.panY;
    const s = camera.scale;

    g.setAttribute('transform', `translate(${tx}, ${ty}) scale(${s}, ${-s})`);
  }

  private applyCenteredYUpTransform(g: SVGGElement, viewport: Viewport) {
    const cx = viewport.x + viewport.width * 0.5;
    const cy = viewport.y + viewport.height * 0.5;

    g.setAttribute('transform', `translate(${cx}, ${cy}) scale(1, -1)`);
  }
}
