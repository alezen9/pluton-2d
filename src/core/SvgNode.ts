import { SVG_NS } from "./constants";

const escapeSvg = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

export class SvgNode {
  private attributes = new Map<string, string>();
  private styles = new Map<string, string>();
  private children: SvgNode[] = [];
  private text = "";
  private tag: string;
  private element?: SVGElement;
  parent: SvgNode | null = null;

  constructor(tag: string, element?: SVGElement) {
    this.tag = tag;
    this.element = element;
  }

  create(tag: string) {
    const element = this.element?.ownerDocument.createElementNS(SVG_NS, tag);
    return new SvgNode(tag, element);
  }

  setAttribute(name: string, value: string) {
    if (this.element) this.element.setAttribute(name, value);
    else this.attributes.set(name, value);
  }

  getAttribute(name: string) {
    if (this.element) return this.element.getAttribute(name);
    return this.attributes.get(name) ?? null;
  }

  removeAttribute(name: string) {
    if (this.element) this.element.removeAttribute(name);
    else this.attributes.delete(name);
  }

  setStyle(name: string, value: string) {
    if (!value) return this.removeStyle(name);
    if (this.element) this.element.style.setProperty(name, value);
    else this.styles.set(name, value);
  }

  removeStyle(name: string) {
    if (this.element) this.element.style.removeProperty(name);
    else this.styles.delete(name);
  }

  addClass(...names: string[]) {
    for (const name of names) this.toggleClass(name, true);
  }

  removeClass(name: string) {
    this.toggleClass(name, false);
  }

  toggleClass(name: string, isEnabled: boolean) {
    if (this.element) {
      this.element.classList.toggle(name, isEnabled);
      return;
    }
    const classes = new Set((this.getAttribute("class") ?? "").split(/\s+/));
    classes.delete("");
    if (isEnabled) classes.add(name);
    else classes.delete(name);
    this.setAttribute("class", [...classes].join(" "));
  }

  append(...nodes: SvgNode[]) {
    for (const node of nodes) {
      node.remove();
      node.parent = this;
      this.children.push(node);
      if (this.element && node.element) this.element.appendChild(node.element);
    }
  }

  prepend(node: SvgNode) {
    node.remove();
    node.parent = this;
    this.children.unshift(node);
    if (this.element && node.element) this.element.prepend(node.element);
  }

  remove() {
    if (!this.parent) return;
    const { children } = this.parent;
    children.splice(children.indexOf(this), 1);
    this.parent = null;
    this.element?.remove();
  }

  replaceWith(node: SvgNode) {
    const parent = this.parent;
    if (!parent) return;
    node.remove();
    parent.children[parent.children.indexOf(this)] = node;
    node.parent = parent;
    this.parent = null;
    if (this.element && node.element) this.element.replaceWith(node.element);
  }

  clear() {
    for (const child of this.children) child.parent = null;
    this.children.length = 0;
    this.text = "";
    this.element?.replaceChildren();
  }

  setText(text: string) {
    this.clear();
    if (this.element) this.element.textContent = text;
    else this.text = text;
  }

  toString(): string {
    if (this.element) return this.element.outerHTML;
    let markup = `<${this.tag}`;
    for (const [name, value] of this.attributes) {
      markup += ` ${name}="${escapeSvg(value)}"`;
    }
    if (this.styles.size) {
      let style = "";
      for (const [name, value] of this.styles) style += `${name}: ${value};`;
      markup += ` style="${escapeSvg(style)}"`;
    }
    markup += `>${escapeSvg(this.text)}`;
    for (const child of this.children) markup += child.toString();
    return `${markup}</${this.tag}>`;
  }
}
