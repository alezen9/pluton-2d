import { Layer } from "../Layer";
import type { EventBus } from "../EventBus";
import { DimensionsGroupInternal } from "./DimensionsGroup";

export class DimensionsLayerInternal extends Layer<DimensionsGroupInternal> {
  constructor(parent: SVGGElement, events: EventBus) {
    super(parent, 'pluton-dimensions');

    events.on('layer:record-start', () => this.beginRecord());
    events.on('layer:record-end', () => this.commit());
  }

  protected createGroup(parent: SVGGElement) {
    return new DimensionsGroupInternal(parent);
  }
}
