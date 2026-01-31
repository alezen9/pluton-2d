import { Layer } from "../Layer";
import type { EventBus } from "../EventBus";
import { GeometryGroupInternal } from "./GeometryGroup";

export class GeometryLayerInternal extends Layer<GeometryGroupInternal> {
  private readonly unsubscribeBegin: () => void;
  private readonly unsubscribeEnd: () => void;

  constructor(parent: SVGGElement, events: EventBus) {
    super(parent, 'pluton-geometry');

    this.unsubscribeBegin = events.on('engine:commit-start', () => this.beginRecord());
    this.unsubscribeEnd = events.on('engine:commit-end', () => this.commit());
  }

  protected createGroup(parent: SVGGElement) {
    return new GeometryGroupInternal(parent);
  }

  dispose() {
    this.unsubscribeBegin();
    this.unsubscribeEnd();
  }
}
