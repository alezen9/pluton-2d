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
