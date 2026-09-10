import type { SvgNode } from "../SvgNode";
import { Layer } from "../Layer";
import type { EventBus } from "../EventBus";
import { GeometryGroupInternal, type GeometryGroup } from "./GeometryGroup";

export type GeometryLayer = {
  /**
   * Create or reuse a geometry group
   * @returns geometry group for building paths
   */
  group: () => GeometryGroup;
};

export class GeometryLayerInternal
  extends Layer<GeometryGroupInternal>
  implements GeometryLayer
{
  private readonly unsubscribeBegin: () => void;
  private readonly unsubscribeEnd: () => void;

  constructor(parent: SvgNode, events: EventBus) {
    super(parent, "pluton-geometry");

    this.unsubscribeBegin = events.on("engine:commit-start", () =>
      this.beginRecord(),
    );
    this.unsubscribeEnd = events.on("engine:commit-end", () => this.commit());
  }

  protected createGroup(parent: SvgNode) {
    return new GeometryGroupInternal(parent);
  }

  dispose() {
    this.unsubscribeBegin();
    this.unsubscribeEnd();
  }
}
