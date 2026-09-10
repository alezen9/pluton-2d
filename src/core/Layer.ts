import type { SvgNode } from "./SvgNode";

export type BaseGroup = {
  /**
   * Translate the entire group
   * @param x - horizontal translation
   * @param y - vertical translation
   */
  translate: (x: number, y: number) => void;
  /**
   * Set draw usage for this group
   * New groups start with `"dynamic"` usage.
   * @param usage - controls whether commits run for this group
   */
  setDrawUsage: (usage: "static" | "dynamic") => void;
  /**
   * Set visibility of this group
   * New groups start as visible.
   * @param visible - whether the group is visible
   */
  visible: (visible: boolean) => void;
  /**
   * Clear all items in this group
   */
  clear: VoidFunction;
};

type RecordableGroup = BaseGroup & {
  beginRecord: VoidFunction;
  commit: VoidFunction;
};

export abstract class Layer<G extends RecordableGroup> {
  readonly root: SvgNode;
  private groups: G[] = [];

  constructor(parent: SvgNode, className: string) {
    this.root = parent.create("g");
    this.root.addClass("pluton-layer", className);
    parent.append(this.root);
  }

  group() {
    const group = this.createGroup(this.root);
    this.groups.push(group);
    return group;
  }

  beginRecord() {
    for (const g of this.groups) g.beginRecord();
  }

  commit() {
    for (const g of this.groups) g.commit();
  }

  protected abstract createGroup(parent: SvgNode): G;
}
