const defsCache = new WeakMap<SVGDefsElement, Map<string, Element>>();

function getDefsMap(defsEl: SVGDefsElement): Map<string, Element> {
  let map = defsCache.get(defsEl);
  if (!map) {
    map = new Map();
    defsCache.set(defsEl, map);
  }
  return map;
}

export function upsertDef(defsEl: SVGDefsElement, node: Element): void {
  const id = node.getAttribute("id");
  if (!id) {
    defsEl.appendChild(node);
    return;
  }

  const map = getDefsMap(defsEl);
  const existing = map.get(id);
  if (existing) existing.replaceWith(node);
  else defsEl.appendChild(node);
  map.set(id, node);
}
