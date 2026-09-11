import { SVG_NS } from "./core/constants";
import { SvgNode } from "./core/SvgNode";
import { EventBus } from "./core/EventBus";
import { ContextInternal } from "./core/Context";
import { DefsRegistry } from "./core/defs/DefsRegistry";
import { Camera } from "./core/Camera";
import { Scene } from "./core/Scene";
import { Engine } from "./core/Engine";

type ViewBox = { width: number; height: number };

type PlutonOptions<P> = { params?: P; viewBox?: ViewBox };
type SsrRenderOptions<P> = ViewBox & { params: P };

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
  private camera: Camera | null;
  private defsEl: SvgNode;
  private defs: DefsRegistry;

  private paramsState: P;
  private hasScheduledInitialDraw = false;

  static ssrRender<P extends Record<string, unknown>>(
    options: SsrRenderOptions<P>,
    setup: (scene: Pluton2D<P>) => void,
  ) {
    const { width, height, params } = options;
    if (
      !Number.isFinite(width) ||
      !Number.isFinite(height) ||
      width <= 0 ||
      height <= 0
    ) {
      throw new Error(
        "Pluton2D SVG width and height must be positive finite numbers.",
      );
    }

    const svg = new SvgNode("svg");
    svg.setAttribute("xmlns", SVG_NS);
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

    const scene = new Pluton2D(svg, {
      params: { ...params },
      viewBox: { width, height },
    });
    try {
      setup(scene);
      scene.engine.render();
      return svg.toString();
    } finally {
      scene.dispose();
    }
  }

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
  constructor(svg: SVGSVGElement, options?: PlutonOptions<P>);
  constructor(svg: SvgNode, options: PlutonOptions<P> & { viewBox: ViewBox });
  constructor(svg: SVGSVGElement | SvgNode, options: PlutonOptions<P> = {}) {
    const element = svg instanceof SvgNode ? undefined : svg;
    const root = svg instanceof SvgNode ? svg : new SvgNode("svg", svg);
    this.events = new EventBus();

    root.addClass("pluton-root");

    this.defsEl = root.create("defs");
    root.prepend(this.defsEl);

    this.defs = new DefsRegistry(this.defsEl);
    const defs = this.defs;
    root.setStyle("--pluton-default-hatch-fill", `url(#${defs.hatchFill45Id})`);

    const { params = {} as P, viewBox } = options;

    this.engine = new Engine<P>(
      this.events,
      params,
      element ? undefined : null,
    );
    this.paramsState = this.engine.getParams();

    this.camera = element
      ? new Camera(element, this.events, () => this.engine.requestFrame())
      : null;
    this.engine.setTickFn(() => this.camera?.tick() ?? false);

    this.context = new ContextInternal(
      root,
      defs,
      this.camera,
      this.onResize,
      viewBox,
      element,
    );

    defs.syncForViewport(this.context.viewport());

    this.scene = new Scene(this.context, this.events);

    this.events.on("camera:changed", () => {
      this.scene.updateTransforms();
    });
  }

  private onResize = () => {
    const viewport = this.context.viewport();
    this.defs.syncForViewport(viewport);
    this.scene.onViewportChanged(viewport);
    this.scene.updateTransforms();
    this.engine.scheduleRender();
  };

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
    const unsubscribe = this.engine.draw(callback);
    if (this.camera && !this.hasScheduledInitialDraw) {
      this.hasScheduledInitialDraw = true;
      queueMicrotask(() => this.engine.render());
    }
    return unsubscribe;
  }

  /**
   * Enable or disable the hand-drawn filter effect
   * Initial state is disabled.
   * @param enabled - whether the filter is active
   */
  enableFilter(enabled: boolean) {
    this.scene.enableFilter(enabled);
  }

  /**
   * Set displacement scale for the hand-drawn filter. Affects strokes and fills.
   * @param scale - displacement scale, clamped to 0+
   */
  setDisplacementScale(scale: number) {
    this.defs.setDisplacementScale(scale);
  }

  /**
   * Set displacement noise frequency for the hand-drawn filter. Affects strokes and fills.
   * @param frequency - noise baseFrequency, clamped to 0+
   */
  setDisplacementFrequency(frequency: number) {
    this.defs.setDisplacementFrequency(frequency);
  }

  /**
   * Set displacement noise octaves for the hand-drawn filter. Affects strokes and fills.
   * @param octaves - number of noise octaves, clamped to 0+
   */
  setDisplacementOctaves(octaves: number) {
    this.defs.setDisplacementOctaves(octaves);
  }

  /**
   * Set mask noise frequency for the hand-drawn filter.
   * @param frequency - noise baseFrequency, clamped to 0+
   */
  setMaskFrequency(frequency: number) {
    this.defs.setMaskFrequency(frequency);
  }

  /**
   * Set mask noise octaves for the hand-drawn filter.
   * @param octaves - number of noise octaves, clamped to 0+
   */
  setMaskOctaves(octaves: number) {
    this.defs.setMaskOctaves(octaves);
  }

  /**
   * Set mask amplitude scale for the hand-drawn filter.
   * Higher values push more noise pixels above the threshold, creating denser line breaks.
   * @param scale - linear slope on noise alpha before thresholding, clamped to 0+
   */
  setMaskScale(scale: number) {
    this.defs.setMaskScale(scale);
  }

  /**
   * Enable or disable the mask in the hand-drawn filter.
   * Applies to geometry groups and dimension strokes. Default: false.
   * @param enabled - whether the mask is active
   */
  enableMask(enabled: boolean) {
    this.scene.enableMask(enabled);
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
    this.camera?.enablePan(enabled);
  }

  /**
   * Enable or disable camera zooming
   * Initial state is disabled.
   * @param enabled - whether zoom input is active
   */
  enableZoom(enabled: boolean) {
    this.camera?.enableZoom(enabled);
  }

  /**
   * Enable or disable geometry fills (solid and hatch)
   * Initial state is visible.
   * @param enabled - whether geometry fills are visible
   */
  enableFill(enabled: boolean) {
    if (enabled) this.context.svg.removeClass("pluton-no-fill");
    else this.context.svg.addClass("pluton-no-fill");
  }

  /**
   * Reset camera to initial position and zoom
   */
  resetCamera() {
    this.camera?.reset();
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
    if (this.camera) {
      this.camera.setScaleMultiplier(scale);
      return;
    }
    this.context.setViewScale(scale);
    this.scene.updateTransforms();
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
   * Add a linear gradient to the SVG defs.
   *
   * The gradient vector is derived from the first and last stop's `at` position;
   * intermediate stops are projected onto that line. Identical inputs return the
   * same reference, so calling this inside a draw callback is safe.
   *
   * @param stops - positioned color stops (minimum 2)
   * @param stops[].at - position in `options.units` coords (defaults to objectBoundingBox `[0..1]`)
   * @param stops[].color - any CSS color
   * @param stops[].opacity - 0..1, optional
   * @param options - global flow
   * @param options.units - `"objectBoundingBox"` (default, stops follow the path bbox) or `"userSpaceOnUse"` (world coords)
   * @param options.spread - `"pad"` | `"reflect"` | `"repeat"`. Defaults to `"pad"`
   * @returns Gradient reference (url(#id)) to use as fill value in path options
   * @example
   * const fill = scene.addLinearGradient(
   *   [
   *     { at: [0, 0], color: "#1d4ed8" },
   *     { at: [0, 1], color: "#f59e0b" },
   *   ],
   * );
   * geom.path({ fill }).moveTo(...).close();
   */
  addLinearGradient(
    stops: ReadonlyArray<{
      at: [x: number, y: number];
      color: string;
      opacity?: number;
    }>,
    options?: {
      units?: "userSpaceOnUse" | "objectBoundingBox";
      spread?: "pad" | "reflect" | "repeat";
    },
  ): string {
    return this.defs.createLinearGradient(stops, options);
  }

  /**
   * Add a radial gradient to the SVG defs.
   *
   * Identical inputs return the same reference, so calling this inside a
   * draw callback is safe — only truly unique gradients create new defs nodes.
   *
   * @param stops - color stops (minimum 2); `offset` ∈ [0,1] (0 at center, 1 at radius)
   * @param stops[].color - any CSS color
   * @param stops[].opacity - 0..1, optional
   * @param options - placement & flow
   * @param options.units - `"objectBoundingBox"` (default) or `"userSpaceOnUse"` (world coords)
   * @param options.center - gradient center. Defaults to `[0.5, 0.5]`
   * @param options.radius - outer radius. Defaults to `0.5`
   * @param options.focal - focal point. Defaults to `center`
   * @param options.spread - `"pad"` | `"reflect"` | `"repeat"`. Defaults to `"pad"`
   * @returns Gradient reference (url(#id)) to use as fill value in path options
   * @example
   * const fill = scene.addRadialGradient(
   *   [
   *     { offset: 0, color: "#fff" },
   *     { offset: 1, color: "#0f172a" },
   *   ],
   * );
   * geom.path({ fill }).moveTo(...).close();
   */
  addRadialGradient(
    stops: ReadonlyArray<{ offset: number; color: string; opacity?: number }>,
    options?: {
      units?: "userSpaceOnUse" | "objectBoundingBox";
      center?: [x: number, y: number];
      radius?: number;
      focal?: [x: number, y: number];
      spread?: "pad" | "reflect" | "repeat";
    },
  ): string {
    return this.defs.createRadialGradient(stops, options);
  }

  /**
   * Clean up resources and remove event listeners
   */
  dispose() {
    this.camera?.dispose();
    this.scene.dispose();
    this.engine.dispose();
    this.context.dispose();
    this.events.clear();
    this.defsEl.remove();
    this.context.svg.removeClass("pluton-root");
    this.context.svg.removeStyle("--pluton-default-hatch-fill");
  }
}
