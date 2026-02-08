import type { Viewport } from "../Context";
import { PatternDefs } from "./PatternDefs";
import { GradientDefs } from "./GradientDefs";
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

  get pencilFilterId() {
    return this.filters.pencilFilterId;
  }

  /**
   * Create a colored hatch fill pattern
   * @param color - CSS color value (hex, rgb, etc.)
   * @param opacity - Stroke opacity (0-1), default 0.3
   * @returns CSS fill value: url(#pattern-id)
   */
  createHatchFill(color: string, opacity?: number): string {
    return this.patterns.createColoredHatch(color, opacity);
  }

  setPencilIntensity(intensity: number): void {
    this.filters.setIntensity(intensity);
  }
}
