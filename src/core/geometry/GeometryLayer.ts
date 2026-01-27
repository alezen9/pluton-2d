import { Layer } from "../Layer";
import type { EventBus } from "../EventBus";
import { GeometryGroupInternal } from "./GeometryGroup";

export class GeometryLayerInternal extends Layer<GeometryGroupInternal> {
  constructor(parent: SVGGElement, events: EventBus) {
    super(parent, 'pluton-geometry');

    events.on('layer:record-start', () => this.beginRecord());
    events.on('layer:record-end', () => this.commit());
  }

  protected createGroup(parent: SVGGElement) {
    return new GeometryGroupInternal(parent);
  }
}
