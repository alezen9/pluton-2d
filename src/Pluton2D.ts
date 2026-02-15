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
  P extends Record<string, unknown> = Record<string, never>,
> {
  private context: ContextInternal;
  private events: EventBus;
  private scene: Scene;
  private engine: Engine<P>;
  private camera: Camera;
  private defsEl: SVGDefsElement;
  private defs: DefsRegistry;

  private paramsState: P;

  /**
   * Creates a new Pluton2D scene.
   *
   * @param svg - The SVG element to render into
   * @param options - Configuration options
   * @param options.params - Optional reactive parameters for drawing.
   *                         Must be flat object (no nested objects).
   *                         Mutations trigger automatic redraws.
   * @param options.viewBox - Optional coordinate space dimensions.
   *                          Defaults to SVG viewBox attribute or pixel dimensions.
   *
   * @example
   * // With params and viewBox
   * const scene = new Pluton2D(svg, {
   *   params: { width: 240, height: 120 },
   *   viewBox: { width: 500, height: 500 }
   * });
   *
   * // Params only
   * const scene = new Pluton2D(svg, {
   *   params: { size: 100, count: 5 }
   * });
   *
   * // No params (empty scene)
   * const scene = new Pluton2D(svg, {});
   */
  constructor(
    svg: SVGSVGElement,
    options: {
      params?: P;
      viewBox?: { width: number; height: number };
    } = {},
  ) {
    this.events = new EventBus();

    svg.classList.add("pluton-root");

    this.defsEl = document.createElementNS(SVG_NS, "defs");
    svg.insertBefore(this.defsEl, svg.firstChild);

    this.defs = new DefsRegistry(this.defsEl);
    const defs = this.defs;
    svg.style.setProperty(
      "--pluton-default-hatch-fill",
      `url(#${defs.hatchFill45Id})`,
    );

    const { params = {} as P, viewBox } = options;

    this.engine = new Engine<P>(this.events, params);
    this.paramsState = this.engine.getParams();

    this.camera = new Camera(svg, this.events, () => this.engine.requestFrame());
    this.engine.setTickFn(() => this.camera.tick());

    let handleResize: (() => void) | null = null;

    this.context = new ContextInternal(svg, defs, this.camera, () => {
      handleResize?.();
    }, viewBox);

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
   * Reactive parameters that trigger redraw when mutated
   * Top-level reassignment is intentionally not supported.
   */
  get params() {
    return this.paramsState;
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
   * Initial state is disabled.
   * @param enabled - whether the filter is active
   */
  enableFilter(enabled: boolean) {
    this.scene.enableFilter(enabled);
  }

  /**
   * Set the pencil filter intensity
   * @param intensity - displacement intensity, clamped to 0+
   */
  setFilterIntensity(intensity: number) {
    this.defs.setPencilIntensity(intensity);
  }

  /**
   * Enable or disable the built-in graph-paper background
   * Initial state is visible.
   * @param enabled - whether the graph-paper is visible
   */
  enableGrid(enabled: boolean) {
    this.scene.enableGrid(enabled);
  }

  /**
   * Enable or disable the built-in axes
   * Initial state is visible.
   * @param enabled - whether the axes are visible
   */
  enableAxes(enabled: boolean) {
    this.scene.enableAxes(enabled);
  }

  /**
   * Enable or disable camera panning
   * Initial state is disabled.
   * @param enabled - whether pan input is active
   */
  enablePan(enabled: boolean) {
    this.camera.enablePan(enabled);
  }

  /**
   * Enable or disable camera zooming
   * Initial state is disabled.
   * @param enabled - whether zoom input is active
   */
  enableZoom(enabled: boolean) {
    this.camera.enableZoom(enabled);
  }

  /**
   * Enable or disable geometry fills (solid and hatch)
   * Initial state is visible.
   * @param enabled - whether geometry fills are visible
   */
  enableFill(enabled: boolean) {
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
   * Sets the view scale multiplier for responsive scaling.
   *
   * Scales the entire view without affecting the coordinate system or
   * camera zoom level. Useful for responsive design (e.g., scale down
   * on mobile devices while preserving zoom/pan functionality).
   *
   * @param scale - Scale multiplier (0.1-10x). Values <1 zoom out, >1 zoom in.
   * @example
   * // Scale view to 75% on mobile
   * scene.setViewScale(0.75);
   *
   * // Reset to normal scale
   * scene.setViewScale(1.0);
   */
  setViewScale(scale: number): void {
    this.camera.setScaleMultiplier(scale);
  }

  /**
   * Add a colored hatch fill pattern to the SVG defs
   * @param color - CSS color value (hex, rgb, etc.)
   * @param opacity - Stroke opacity (0-1), default 0.3
   * @returns Pattern reference (url(#id)) to use as fill value in path options
   * @example
   * const blueFillId = scene.addHatchFill('#2563eb');
   * geom.path({ fill: blueFillId }).moveTo(...).close();
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
    this.context.svg.style.removeProperty("--pluton-default-hatch-fill");
  }
}
