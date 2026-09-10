import type { SvgNode } from "../SvgNode";
import { upsertDef } from "./utils";

export class FilterDefs {
  readonly displacementFilterId = "pluton-filter-displacement";
  readonly maskFilterId = "pluton-filter-mask";

  private defsEl: SvgNode;
  private displacementScale = 2.75;
  private displacementFrequency = 0.1;
  private displacementOctaves = 1;
  private maskFrequency = 0.03;
  private maskOctaves = 1;
  private maskScale = 1.6;

  private displacementNoiseEl: SvgNode | null = null;
  private displacementEl: SvgNode | null = null;
  private maskNoiseEl: SvgNode | null = null;
  private maskScaleEl: SvgNode | null = null;

  constructor(defsEl: SvgNode) {
    this.defsEl = defsEl;
  }

  sync(): void {
    const {
      filter: displacementFilter,
      noise,
      displacementMap,
    } = this.createDisplacementFilter();
    const {
      filter: maskFilter,
      noise: maskNoise,
      scaleFn,
    } = this.createMaskFilter();

    this.displacementNoiseEl = noise;
    this.displacementEl = displacementMap;
    this.maskNoiseEl = maskNoise;
    this.maskScaleEl = scaleFn;
    upsertDef(this.defsEl, displacementFilter);
    upsertDef(this.defsEl, maskFilter);
  }

  setDisplacementScale(scale: number): void {
    if (!Number.isFinite(scale)) return;
    const next = Math.max(0, scale);
    if (next === this.displacementScale) return;
    this.displacementScale = next;
    this.displacementEl?.setAttribute("scale", String(this.displacementScale));
  }

  setDisplacementFrequency(frequency: number): void {
    if (!Number.isFinite(frequency)) return;
    const next = Math.max(0, frequency);
    if (next === this.displacementFrequency) return;
    this.displacementFrequency = next;
    this.displacementNoiseEl?.setAttribute("baseFrequency", String(this.displacementFrequency));
  }

  setDisplacementOctaves(octaves: number): void {
    if (!Number.isFinite(octaves)) return;
    const next = Math.max(0, octaves);
    if (next === this.displacementOctaves) return;
    this.displacementOctaves = next;
    this.displacementNoiseEl?.setAttribute("numOctaves", String(this.displacementOctaves));
  }

  setMaskFrequency(frequency: number): void {
    if (!Number.isFinite(frequency)) return;
    const next = Math.max(0, frequency);
    if (next === this.maskFrequency) return;
    this.maskFrequency = next;
    this.maskNoiseEl?.setAttribute("baseFrequency", String(this.maskFrequency));
  }

  setMaskOctaves(octaves: number): void {
    if (!Number.isFinite(octaves)) return;
    const next = Math.max(0, octaves);
    if (next === this.maskOctaves) return;
    this.maskOctaves = next;
    this.maskNoiseEl?.setAttribute("numOctaves", String(this.maskOctaves));
  }

  setMaskScale(scale: number): void {
    if (!Number.isFinite(scale)) return;
    const next = Math.max(0, scale);
    if (next === this.maskScale) return;
    this.maskScale = next;
    this.maskScaleEl?.setAttribute("slope", String(this.maskScale));
  }

  private createDisplacementFilter(): {
    filter: SvgNode;
    noise: SvgNode;
    displacementMap: SvgNode;
  } {
    const filter = this.defsEl.create("filter");
    filter.setAttribute("id", this.displacementFilterId);
    filter.setAttribute("x", "-50%");
    filter.setAttribute("y", "-50%");
    filter.setAttribute("width", "200%");
    filter.setAttribute("height", "200%");

    const noise = this.defsEl.create("feTurbulence");
    noise.setAttribute("type", "fractalNoise");
    noise.setAttribute("baseFrequency", String(this.displacementFrequency));
    noise.setAttribute("numOctaves", String(this.displacementOctaves));
    noise.setAttribute("seed", "1");
    noise.setAttribute("result", "turbulence");

    const displacementMap = this.defsEl.create("feDisplacementMap");
    displacementMap.setAttribute("in", "SourceGraphic");
    displacementMap.setAttribute("in2", "turbulence");
    displacementMap.setAttribute("scale", String(this.displacementScale));
    displacementMap.setAttribute("xChannelSelector", "R");
    displacementMap.setAttribute("yChannelSelector", "G");
    displacementMap.setAttribute("result", "output");

    filter.append(noise);
    filter.append(displacementMap);

    return { filter, noise, displacementMap };
  }

  private createMaskFilter(): {
    filter: SvgNode;
    noise: SvgNode;
    scaleFn: SvgNode;
  } {
    const filter = this.defsEl.create("filter");
    filter.setAttribute("id", this.maskFilterId);
    filter.setAttribute("x", "-50%");
    filter.setAttribute("y", "-50%");
    filter.setAttribute("width", "200%");
    filter.setAttribute("height", "200%");
    filter.setAttribute("color-interpolation-filters", "linearRGB");

    const noise = this.defsEl.create("feTurbulence");
    noise.setAttribute("type", "fractalNoise");
    noise.setAttribute("baseFrequency", String(this.maskFrequency));
    noise.setAttribute("numOctaves", String(this.maskOctaves));
    noise.setAttribute("seed", "2");
    noise.setAttribute("result", "noise");

    const noiseAlpha = this.defsEl.create("feColorMatrix");
    noiseAlpha.setAttribute("in", "noise");
    noiseAlpha.setAttribute("type", "luminanceToAlpha");
    noiseAlpha.setAttribute("result", "noiseAlpha");

    // linear scale applied before the discrete threshold — controls mask density
    const scaleTransfer = this.defsEl.create("feComponentTransfer");
    scaleTransfer.setAttribute("in", "noiseAlpha");
    scaleTransfer.setAttribute("result", "scaledNoise");
    const scaleFn = this.defsEl.create("feFuncA");
    scaleFn.setAttribute("type", "linear");
    scaleFn.setAttribute("slope", String(this.maskScale));
    scaleTransfer.append(scaleFn);

    const alphaTransfer = this.defsEl.create("feComponentTransfer");
    alphaTransfer.setAttribute("in", "scaledNoise");
    alphaTransfer.setAttribute("result", "thresholded");
    const transferFn = this.defsEl.create("feFuncA");
    transferFn.setAttribute("type", "discrete");
    transferFn.setAttribute("tableValues", "0 1");
    alphaTransfer.append(transferFn);

    const composite = this.defsEl.create("feComposite");
    composite.setAttribute("in", "SourceGraphic");
    composite.setAttribute("in2", "thresholded");
    composite.setAttribute("operator", "in");

    filter.append(noise);
    filter.append(noiseAlpha);
    filter.append(scaleTransfer);
    filter.append(alphaTransfer);
    filter.append(composite);

    return { filter, noise, scaleFn };
  }
}
