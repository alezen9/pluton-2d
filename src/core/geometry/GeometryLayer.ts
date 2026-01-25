import { Layer } from "../Layer";
import { GeometryGroupInternal, type GeometryGroup } from "./GeometryGroup";

export type GeometryLayer = {
  group: () => GeometryGroup;
};

export class GeometryLayerInternal extends Layer<GeometryGroupInternal> {
  protected createGroup(parent: SVGGElement) {
    return new GeometryGroupInternal(parent);
  }
}
