import { describe, expect, it } from "vitest";
import { Engine } from "./Engine";
import { EventBus } from "./EventBus";

function createTestScheduler() {
  let nextId = 1;
  const pending = new Map<number, FrameRequestCallback>();
  const order: number[] = [];

  return {
    scheduler: {
      request: (callback: FrameRequestCallback) => {
        const id = nextId++;
        pending.set(id, callback);
        order.push(id);
        return id;
      },
      cancel: (id: number) => {
        pending.delete(id);
      },
    },
    step(time: number) {
      while (order.length > 0) {
        const id = order.shift()!;
        const callback = pending.get(id);
        if (!callback) continue;
        pending.delete(id);
        callback(time);
        return true;
      }
      return false;
    },
  };
}

describe("Engine", () => {
  it("runs draw callbacks and emits commit lifecycle events in order", () => {
    const testScheduler = createTestScheduler();
    const events = new EventBus();
    const engine = new Engine(events, { width: 100 }, testScheduler.scheduler);

    const calls: string[] = [];
    events.on("engine:commit-start", () => calls.push("start"));
    events.on("engine:commit-end", () => calls.push("end"));
    engine.draw(() => calls.push("draw"));

    testScheduler.step(20);

    expect(calls).toEqual(["start", "draw", "end"]);
  });

  it("keeps pending render until frame budget is met", () => {
    const testScheduler = createTestScheduler();
    const events = new EventBus();
    const engine = new Engine(events, { width: 100 }, testScheduler.scheduler);

    let runs = 0;
    engine.draw(() => {
      runs += 1;
    });

    // below frame budget: no commit
    testScheduler.step(5);
    expect(runs).toBe(0);

    // enough elapsed time: commit occurs
    testScheduler.step(20);
    expect(runs).toBe(1);

    engine.getParams().width = 140;
    testScheduler.step(22);
    expect(runs).toBe(1);
    testScheduler.step(40);
    expect(runs).toBe(2);
  });

  it("supports flat reactive params and rejects nested objects", () => {
    const testScheduler = createTestScheduler();
    const events = new EventBus();
    const engine = new Engine(
      events,
      { width: 100, height: 50 },
      testScheduler.scheduler,
    );

    let runs = 0;
    engine.draw(() => {
      runs += 1;
    });
    testScheduler.step(20);
    expect(runs).toBe(1);

    engine.getParams().width = 120;
    testScheduler.step(40);
    expect(runs).toBe(2);

    Object.assign(engine.getParams(), { width: 140, height: 70 });
    testScheduler.step(60);
    expect(runs).toBe(3);

    expect(() => {
      (engine.getParams() as Record<string, unknown>).width = { bad: true };
    }).toThrowError(/flat/);

    expect(() => {
      new Engine(new EventBus(), { nested: { x: 1 } } as unknown as Record<string, unknown>);
    }).toThrowError(/flat/);

  });
});
