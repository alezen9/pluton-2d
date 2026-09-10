import type { SvgNode } from "../SvgNode";
const defsCache = new WeakMap<SvgNode, Map<string, SvgNode>>();

function getDefsMap(defsEl: SvgNode): Map<string, SvgNode> {
  let map = defsCache.get(defsEl);
  if (!map) {
    map = new Map();
    defsCache.set(defsEl, map);
  }
  return map;
}

export function upsertDef(defsEl: SvgNode, node: SvgNode): void {
  const id = node.getAttribute("id");
  if (!id) {
    defsEl.append(node);
    return;
  }

  const map = getDefsMap(defsEl);
  const existing = map.get(id);
  if (existing) existing.replaceWith(node);
  else defsEl.append(node);
  map.set(id, node);
}
