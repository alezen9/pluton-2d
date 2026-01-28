import { SVG_NS } from "./core/constants";
import { EventBus } from "./core/EventBus";
import { ContextInternal } from "./core/Context";
import { DefsRegistry } from "./core/defs/DefsRegistry";
import { Camera } from "./core/Camera";
import { Scene } from "./core/Scene";
import { Engine } from "./core/Engine";

export interface Pluton2DOptions {
  enablePencilFilter?: boolean;
  enableCameraControls?: boolean;
}

export class Pluton2D<
  P extends Record<string, unknown> = Record<string, unknown>,
> {
  private context: ContextInternal;
  private events: EventBus;
  private scene: Scene;
  private engine: Engine<P>;
  private camera: Camera;
  params: P;

  constructor(
    svg: SVGSVGElement,
    initialParams: P,
    options: Pluton2DOptions = {},
  ) {
    const { enablePencilFilter = true, enableCameraControls = true } = options;

    this.events = new EventBus();

    const defsEl = document.createElementNS(SVG_NS, "defs");
    svg.insertBefore(defsEl, svg.firstChild);

    const defs = new DefsRegistry(defsEl);

    this.camera = new Camera(svg, this.events);
    this.context = new ContextInternal(svg, defs, this.camera);

    defs.syncForViewport(this.context.viewport());

    this.scene = new Scene(this.context, this.events, enablePencilFilter);
    this.engine = new Engine<P>(this.events, initialParams);
    this.params = this.engine.getParams();

    this.events.on("camera:changed", () => {
      this.scene.updateTransforms();
      this.engine.scheduleRender();
    });

    this.setupControls(enableCameraControls);
  }

  get geometry() {
    return this.scene.geometry;
  }

  get dimensions() {
    return this.scene.dimensions;
  }

  draw(callback: (params: P) => void) {
    this.engine.draw(callback);
  }

  setupControls(enabled = true): void {
    if (enabled) this.camera.enable();
    else this.camera.disable();
  }

  setPencilFilter(enabled: boolean): void {
    this.scene.setPencilFilter(enabled);
  }

  resetCamera(): void {
    this.camera.reset();
  }

  dispose(): void {
    this.camera.dispose();
    this.scene.dispose();
    this.engine.dispose();
    this.context.dispose();
    this.events.clear();
  }
}
