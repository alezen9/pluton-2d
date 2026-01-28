import { SVG_NS } from "./core/constants";
import { EventBus } from "./core/EventBus";
import { ContextInternal } from "./core/Context";
import { DefsRegistry } from "./core/defs/DefsRegistry";
import { Camera } from "./core/Camera";
import { Scene } from "./core/Scene";
import { Engine } from "./core/Engine";

/**
 * Configuration options for Pluton2D instance.
 */
export interface Pluton2DOptions {
  /** enable hand-drawn pencil filter effect (default: true) */
  enablePencilFilter?: boolean;
  /** enable pan/zoom camera controls (default: true) */
  enableCameraControls?: boolean;
}

/**
 * Main Pluton2D instance for creating technical drawings.
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
   * Reactive parameters that trigger redraw when modified.
   * Mutate properties to update the drawing.
   */
  params: P;

  /**
   * Create a new Pluton2D instance.
   * @param svg - SVG element to render into
   * @param initialParams - initial reactive parameters
   * @param options - configuration options
   */
  constructor(
    svg: SVGSVGElement,
    initialParams: P,
    options: Pluton2DOptions = {},
  ) {
    const { enablePencilFilter = true, enableCameraControls = true } = options;

    this.events = new EventBus();

    const defsEl = document.createElementNS(SVG_NS, "defs");
    svg.insertBefore(defsEl, svg.firstChild);

    const defs = new DefsRegistry(defsEl);

    this.camera = new Camera(svg, this.events);
    this.context = new ContextInternal(svg, defs, this.camera);

    defs.syncForViewport(this.context.viewport());

    this.scene = new Scene(this.context, this.events, enablePencilFilter);
    this.engine = new Engine<P>(this.events, initialParams);
    this.params = this.engine.getParams();

    this.events.on("camera:changed", () => {
      this.scene.updateTransforms();
      this.engine.scheduleRender();
    });

    this.enableCameraControls(enableCameraControls);
  }

  /**
   * Access the geometry layer for drawing shapes.
   */
  get geometry() {
    return this.scene.geometry;
  }

  /**
   * Access the dimensions layer for annotations.
   */
  get dimensions() {
    return this.scene.dimensions;
  }

  /**
   * Register a reactive drawing callback.
   * Called whenever params change.
   * @param callback - drawing function receiving current params
   */
  draw(callback: (params: P) => void) {
    this.engine.draw(callback);
  }

  /**
   * Enable or disable camera pan and zoom controls.
   * @param enabled - true to enable, false to disable
   */
  enableCameraControls(enabled: boolean) {
    if (enabled) this.camera.enable();
    else this.camera.disable();
  }

  /**
   * Enable or disable the hand-drawn pencil filter effect.
   * @param enabled - true to enable, false to disable
   */
  enablePencilFilter(enabled: boolean) {
    this.scene.enablePencilFilter(enabled);
  }

  /**
   * Reset camera to initial position and zoom.
   */
  resetCamera() {
    this.camera.reset();
  }

  /**
   * Clean up resources and remove event listeners.
   */
  dispose() {
    this.camera.dispose();
    this.scene.dispose();
    this.engine.dispose();
    this.context.dispose();
    this.events.clear();
  }
}
