export function upsertDef(defsEl: SVGDefsElement, node: Element): void {
  const id = node.getAttribute("id");
  if (!id) {
    defsEl.appendChild(node);
    return;
  }
  const existing = defsEl.querySelector(`#${id}`);
  if (existing) existing.replaceWith(node);
  else defsEl.appendChild(node);
}
