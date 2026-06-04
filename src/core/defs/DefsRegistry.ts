import type { Viewport } from "../Context";
import { PatternDefs } from "./PatternDefs";
import {
  GradientDefs,
  type LinearGradientStop,
  type RadialGradientStop,
  type LinearGradientOptions,
  type RadialGradientOptions,
} from "./GradientDefs";
import { FilterDefs } from "./FilterDefs";

export class DefsRegistry {
  readonly patterns: PatternDefs;
  readonly gradients: GradientDefs;
  readonly filters: FilterDefs;
  private lastWidth = 0;
  private lastHeight = 0;

  constructor(defsEl: SVGDefsElement) {
    this.patterns = new PatternDefs(defsEl);
    this.gradients = new GradientDefs(defsEl);
    this.filters = new FilterDefs(defsEl);

    this.patterns.sync();
    this.filters.sync();
  }

  syncForViewport(viewport: Viewport): void {
    if (
      this.lastWidth === viewport.width &&
      this.lastHeight === viewport.height
    ) {
      return;
    }
    this.lastWidth = viewport.width;
    this.lastHeight = viewport.height;

    this.gradients.syncForViewport(viewport);
  }

  get hatchFill45Id() {
    return this.patterns.hatchFill45Id;
  }

  get graphPaperPatternId() {
    return this.patterns.graphPaperPatternId;
  }

  get graphPaperGradientId() {
    return this.gradients.graphPaperGradientId;
  }

  get graphPaperMaskId() {
    return this.gradients.graphPaperMaskId;
  }

  get displacementFilterId() {
    return this.filters.displacementFilterId;
  }

  /**
   * Create a colored hatch fill pattern
   * @param color - CSS color value (hex, rgb, etc.)
   * @param opacity - stroke opacity (0-1), default 0.3
   * @returns CSS fill value: url(#pattern-id)
   */
  createHatchFill(color: string, opacity?: number): string {
    return this.patterns.createColoredHatch(color, opacity);
  }

  /**
   * Create a linear gradient. Vector is derived from the first and last stop's `at` position.
   * Intermediate stops are projected onto that line.
   * @param stops - positioned color stops; `at` in `units` coords, `color` any CSS color, `opacity` optional
   * @param options - global flow (units, spread)
   * @returns CSS fill value: url(#gradient-id). Identical inputs return the same id.
   */
  createLinearGradient(
    stops: ReadonlyArray<LinearGradientStop>,
    options?: LinearGradientOptions,
  ): string {
    return this.gradients.createLinearGradient(stops, options);
  }

  /**
   * Create a radial gradient
   * @param stops - color stops; `offset` ∈ [0,1] (0 at center, 1 at radius), `color` any CSS color, `opacity` optional
   * @param options - placement & flow (units, center, radius, focal, spread)
   * @returns CSS fill value: url(#gradient-id). Identical inputs return the same id.
   */
  createRadialGradient(
    stops: ReadonlyArray<RadialGradientStop>,
    options?: RadialGradientOptions,
  ): string {
    return this.gradients.createRadialGradient(stops, options);
  }

  setDisplacementScale(scale: number): void {
    this.filters.setDisplacementScale(scale);
  }

  setDisplacementFrequency(frequency: number): void {
    this.filters.setDisplacementFrequency(frequency);
  }

  setDisplacementOctaves(octaves: number): void {
    this.filters.setDisplacementOctaves(octaves);
  }

  setMaskFrequency(frequency: number): void {
    this.filters.setMaskFrequency(frequency);
  }

  setMaskOctaves(octaves: number): void {
    this.filters.setMaskOctaves(octaves);
  }

  setMaskScale(scale: number): void {
    this.filters.setMaskScale(scale);
  }
}
