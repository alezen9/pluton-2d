import { describe, expect, it, vi } from "vitest";
import { EventBus } from "./EventBus";

describe("EventBus", () => {
  it("emits events to registered listeners and supports unsubscribe", () => {
    const events = new EventBus();
    const calls: number[] = [];

    const off = events.on("camera:changed", (camera) => {
      calls.push(camera.scale);
    });

    events.emit("camera:changed", { panX: 0, panY: 0, scale: 1 });
    off();
    events.emit("camera:changed", { panX: 0, panY: 0, scale: 2 });

    expect(calls).toEqual([1]);
  });

  it("isolates listener failures and keeps dispatching", () => {
    const events = new EventBus();
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const calls: string[] = [];

    events.on("engine:commit-end", () => {
      calls.push("bad");
      throw new Error("boom");
    });
    events.on("engine:commit-end", () => {
      calls.push("good");
    });

    events.emit("engine:commit-end", undefined);

    expect(calls).toEqual(["bad", "good"]);
    expect(consoleSpy).toHaveBeenCalledTimes(1);
  });

  it("clear removes all listeners", () => {
    const events = new EventBus();
    const calls: string[] = [];

    events.on("engine:commit-start", () => {
      calls.push("start");
    });

    events.clear();
    events.emit("engine:commit-start", undefined);

    expect(calls).toHaveLength(0);
  });
});
