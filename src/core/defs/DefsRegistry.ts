import type { Viewport } from '../Context';
import { PatternDefs } from './PatternDefs';
import { GradientDefs } from './GradientDefs';
import { FilterDefs } from './FilterDefs';

export class DefsRegistry {
  readonly patterns: PatternDefs;
  readonly gradients: GradientDefs;
  readonly filters: FilterDefs;

  constructor(defsEl: SVGDefsElement) {
    this.patterns = new PatternDefs(defsEl);
    this.gradients = new GradientDefs(defsEl);
    this.filters = new FilterDefs(defsEl);
  }

  syncForViewport(viewport: Viewport): void {
    this.patterns.sync();
    this.gradients.syncForViewport(viewport);
    this.filters.sync();
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
}
