type DrawCallback<P> = (params: P) => void;

type EngineHooks<P> = {
  onRecord: (params: P) => void;
  onCommit: VoidFunction;
};

export class Engine<P extends Record<string, any>> {
  private drawCallbacks: DrawCallback<P>[] = [];
  private paramsState!: P;

  private isRenderScheduled = false;
  private autoRenderEnabled = false;
  private hooks: EngineHooks<P>;

  constructor(hooks: EngineHooks<P>) {
    this.hooks = hooks;
  }

  params(initial: P) {
    this.paramsState = new Proxy(initial, {
      set: (target, prop, value) => {
        target[prop as keyof P] = value;
        if (this.autoRenderEnabled) this.scheduleRender();
        return true;
      },
    });

    return this.paramsState;
  }

  draw(callback: DrawCallback<P>) {
    this.drawCallbacks.push(callback);
  }

  render() {
    this.autoRenderEnabled = true;
    this.scheduleRender();
  }

  private scheduleRender() {
    if (this.isRenderScheduled) return;
    this.isRenderScheduled = true;

    requestAnimationFrame(() => {
      this.isRenderScheduled = false;
      this.commit();
    });
  }

  private commit() {
    this.hooks.onRecord(this.paramsState);

    for (const cb of this.drawCallbacks) {
      cb(this.paramsState);
    }

    this.hooks.onCommit();
  }
}
