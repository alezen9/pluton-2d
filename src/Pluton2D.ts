// src/Pluton2D.ts

import { Engine } from "./core/Engine";
import { Scene } from "./core/Scene";

export class Pluton2D<P extends Record<string, any>> {
  private scene: Scene;
  private engine: Engine<P>;

  constructor(svg: SVGSVGElement) {
    this.scene = new Scene(svg);

    this.engine = new Engine<P>({
      onRecord: () => this.scene.beginRecord(),
      onCommit: () => this.scene.commit(),
    });
  }

  get geometry() {
    return this.scene.geometry;
  }

  get dimensions() {
    return this.scene.dimensions;
  }

  params(initial: P) {
    return this.engine.params(initial);
  }

  draw(callback: (params: P) => void) {
    this.engine.draw(callback);
  }

  render() {
    this.engine.render();
  }
}
