import type { PathBuilder } from './geometry/PathBuilder';
import type { DimensionsBuilder } from './dimensions/DimensionsBuilder';

export type PathOptions = {
  className?: string;
};

export type DimensionOptions = {
  className?: string;
};

export type GeometryLayer = {
  group: () => GeometryGroup;
};

export type GeometryGroup = {
  translate: (x: number, y: number) => void;
  path: (options?: PathOptions) => PathBuilder;
  clear: VoidFunction;
};

export type DimensionsLayer = {
  group: () => DimensionsGroup;
};

export type DimensionsGroup = {
  translate: (x: number, y: number) => void;
  dimension: (options?: DimensionOptions) => DimensionsBuilder;
  clear: VoidFunction;
};
