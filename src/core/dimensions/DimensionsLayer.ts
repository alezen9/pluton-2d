import { Layer } from "../Layer";
import type { EventBus } from "../EventBus";
import { DimensionsGroupInternal } from "./DimensionsGroup";

export class DimensionsLayerInternal extends Layer<DimensionsGroupInternal> {
  private readonly unsubscribeBegin: () => void;
  private readonly unsubscribeEnd: () => void;

  constructor(parent: SVGGElement, events: EventBus) {
    super(parent, 'pluton-dimensions');

    this.unsubscribeBegin = events.on('engine:commit-start', () => this.beginRecord());
    this.unsubscribeEnd = events.on('engine:commit-end', () => this.commit());
  }

  protected createGroup(parent: SVGGElement) {
    return new DimensionsGroupInternal(parent);
  }

  dispose() {
    this.unsubscribeBegin();
    this.unsubscribeEnd();
  }
}
