import { Layer } from "../Layer";
import {
  DimensionsGroupInternal,
  type DimensionsGroup,
} from "./DimensionsGroup";

export type DimensionsLayer = {
  group: () => DimensionsGroup;
};

export class DimensionsLayerInternal extends Layer<DimensionsGroupInternal> {
  protected createGroup(parent: SVGGElement) {
    return new DimensionsGroupInternal(parent);
  }
}
