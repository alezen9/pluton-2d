import { SVG_NS } from "./core/constants";
import { EventBus } from "./core/EventBus";
import { ContextInternal } from "./core/Context";
import { DefsRegistry } from "./core/defs/DefsRegistry";
import { Camera } from "./core/Camera";
import { Scene } from "./core/Scene";
import { Engine } from "./core/Engine";

export type PlutonOptions = {
  /** Intensity of the pencil filter effect (default: 1.25) */
  filterIntensity?: number;
};

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
  private defsEl: SVGDefsElement;
  private defs: DefsRegistry;

  /**
   * Reactive parameters that trigger redraw when modified or reassigned
   */
  params: P;

  /**
   * Create a new Pluton2D instance
   * @param svg - SVG element to render into
   * @param initialParams - initial reactive parameters
   */
  constructor(svg: SVGSVGElement, initialParams: P, options?: PlutonOptions) {
    this.events = new EventBus();

    svg.classList.add("pluton-root");

    this.defsEl = document.createElementNS(SVG_NS, "defs");
    svg.insertBefore(this.defsEl, svg.firstChild);

    this.defs = new DefsRegistry(this.defsEl, options?.filterIntensity);
    const defs = this.defs;

    this.engine = new Engine<P>(this.events, initialParams);
    this.params = this.engine.getParams();

    this.camera = new Camera(svg, this.events, () => this.engine.requestFrame());
    this.engine.setTickFn(() => this.camera.tick());

    let handleResize: (() => void) | null = null;

    this.context = new ContextInternal(svg, defs, this.camera, () => {
      handleResize?.();
    });

    defs.syncForViewport(this.context.viewport());

    this.scene = new Scene(this.context, this.events);

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
   * Enable or disable the built-in graph-paper background
   * @param enabled - whether the graph-paper is visible
   * @defaultValue true
   */
  enableGrid(enabled: boolean) {
    this.scene.enableGrid(enabled);
  }

  /**
   * Enable or disable the built-in axes
   * @param enabled - whether the axes are visible
   * @defaultValue true
   */
  enableAxes(enabled: boolean) {
    this.scene.enableAxes(enabled);
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
   * Enable or disable hatch fills on geometry (both default and custom)
   * @param enabled - whether hatch fills are visible
   * @defaultValue true
   */
  enableHatchFill(enabled: boolean) {
    if (enabled) this.context.svg.classList.remove("pluton-no-fill");
    else this.context.svg.classList.add("pluton-no-fill");
  }

  /**
   * Reset camera to initial position and zoom
   */
  resetCamera() {
    this.camera.reset();
  }

  /**
   * Add a colored hatch fill pattern to the SVG defs
   * @param color - CSS color value (hex, rgb, etc.)
   * @param opacity - Stroke opacity (0-1), default 0.3
   * @returns Pattern reference (url(#id)) to use as fill value in path options
   * @example
   * const blueFill = scene.addHatchFill('#2563eb');
   * geom.path({ fill: blueFill }).moveTo(...).close();
   */
  addHatchFill(color: string, opacity?: number): string {
    return this.defs.createHatchFill(color, opacity);
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
    this.defsEl.remove();
    this.context.svg.classList.remove("pluton-root");
  }
}
