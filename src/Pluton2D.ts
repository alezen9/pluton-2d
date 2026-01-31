import { SVG_NS } from "./core/constants";
import { EventBus } from "./core/EventBus";
import { ContextInternal } from "./core/Context";
import { DefsRegistry } from "./core/defs/DefsRegistry";
import { Camera } from "./core/Camera";
import { Scene } from "./core/Scene";
import { Engine } from "./core/Engine";

/**
 * Main Pluton2D instance for creating technical drawings
 * @template P - parameter type for reactive drawing
 */
export class Pluton2D<
  P extends Record<string, unknown> = Record<string, unknown>,
> {
  private context: ContextInternal;
  private events: EventBus;
  private scene: Scene;
  private engine: Engine<P>;
  private camera: Camera;

  /**
   * Reactive parameters that trigger redraw when modified or reassigned
   */
  params: P;

  /**
   * Create a new Pluton2D instance
   * @param svg - SVG element to render into
   * @param initialParams - initial reactive parameters
   */
  constructor(svg: SVGSVGElement, initialParams: P) {
    this.events = new EventBus();

    const defsEl = document.createElementNS(SVG_NS, "defs");
    svg.insertBefore(defsEl, svg.firstChild);

    const defs = new DefsRegistry(defsEl);

    let handleResize: (() => void) | null = null;

    this.camera = new Camera(svg, this.events);
    this.context = new ContextInternal(svg, defs, this.camera, () => {
      handleResize?.();
    });

    defs.syncForViewport(this.context.viewport());

    this.scene = new Scene(this.context, this.events);
    this.engine = new Engine<P>(this.events, initialParams);
    this.params = this.engine.getParams();

    handleResize = () => {
      this.context.invalidateViewport();
      const viewport = this.context.viewport();
      defs.syncForViewport(viewport);
      this.scene.onViewportChanged(viewport);
      this.scene.updateTransforms();
      this.engine.scheduleRender();
    };

    this.events.on("camera:changed", () => {
      this.scene.updateTransforms();
    });

    this.enablePan(false);
    this.enableZoom(false);
    this.enableFilter(false);
  }

  /**
   * Access the geometry layer for drawing shapes
   */
  get geometry() {
    return this.scene.geometry;
  }

  /**
   * Access the dimensions layer for annotations
   */
  get dimensions() {
    return this.scene.dimensions;
  }

  /**
   * Register a reactive drawing callback
   * @param callback - drawing function receiving current params
   * @returns unsubscribe function to remove the callback
   */
  draw(callback: (params: P) => void) {
    return this.engine.draw(callback);
  }

  /**
   * Enable or disable the hand-drawn pencil filter effect
   * @param enabled - whether the filter is active
   * @defaultValue false
   */
  enableFilter(enabled: boolean) {
    this.scene.enableFilter(enabled);
  }

  /**
   * Enable or disable camera panning
   * @param enabled - whether pan input is active
   * @defaultValue false
   */
  enablePan(enabled: boolean) {
    this.camera.enablePan(enabled);
  }

  /**
   * Enable or disable camera zooming
   * @param enabled - whether zoom input is active
   * @defaultValue false
   */
  enableZoom(enabled: boolean) {
    this.camera.enableZoom(enabled);
  }

  /**
   * Reset camera to initial position and zoom
   */
  resetCamera() {
    this.camera.reset();
  }

  /**
   * Clean up resources and remove event listeners
   */
  dispose() {
    this.camera.dispose();
    this.scene.dispose();
    this.engine.dispose();
    this.context.dispose();
    this.events.clear();
  }
}
