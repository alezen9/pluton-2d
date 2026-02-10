import { expect, test } from "@playwright/test";
import { openFixturePage } from "./support/fixturePage";

test("geometry reuses/removes path nodes and respects static draw usage", async ({
  page,
}) => {
  await openFixturePage(page);

  const result = await page.evaluate(async () => {
    const api = (window as Window & {
      plutonE2E?: { Pluton2D?: new (...args: any[]) => any };
    }).plutonE2E;
    const Pluton2D = api?.Pluton2D;
    if (!Pluton2D) throw new Error("Pluton2D is not available in fixture");

    const app = document.querySelector("#app");
    if (!(app instanceof HTMLElement)) {
      throw new Error("Fixture root #app not found");
    }

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "300");
    svg.setAttribute("height", "200");
    app.replaceChildren(svg);

    const scene = new Pluton2D(svg, {
      params: { count: 2, staticLen: 20, dynamicLen: 20 }
    });

    const reusableGroup = scene.geometry.group();
    const staticGroup = scene.geometry.group();
    const dynamicGroup = scene.geometry.group();
    staticGroup.setDrawUsage("static");

    scene.draw((params: { count: number; staticLen: number; dynamicLen: number }) => {
      for (let i = 0; i < params.count; i += 1) {
        reusableGroup.path().moveToAbs(i * 10, 0).lineToAbs(i * 10 + 5, 0);
      }
      staticGroup.path().moveToAbs(0, 10).lineToAbs(params.staticLen, 10);
      dynamicGroup.path().moveToAbs(0, 20).lineToAbs(params.dynamicLen, 20);
    });

    const waitFor = async (check: () => boolean, timeoutMs = 2_000) => {
      const start = performance.now();
      while (performance.now() - start < timeoutMs) {
        if (check()) return true;
        await new Promise((resolve) => setTimeout(resolve, 16));
      }
      return false;
    };

    const layer = svg.querySelector(".pluton-geometry");
    if (!(layer instanceof SVGGElement)) {
      throw new Error("Geometry layer not found");
    }

    const initialReady = await waitFor(() => {
      const groups = layer.querySelectorAll(":scope > g");
      return (
        groups.length >= 3 &&
        groups[0].querySelectorAll("path").length === 2 &&
        groups[1].querySelectorAll("path").length === 1 &&
        groups[2].querySelectorAll("path").length === 1
      );
    });
    if (!initialReady) throw new Error("Initial geometry was not committed");

    const groupsBefore = layer.querySelectorAll(":scope > g");
    const firstReusablePath = groupsBefore[0].querySelector("path");
    firstReusablePath?.setAttribute("data-first-reusable", "true");

    const staticD1 = groupsBefore[1].querySelector("path")?.getAttribute("d") ?? "";
    const dynamicD1 = groupsBefore[2].querySelector("path")?.getAttribute("d") ?? "";

    scene.params.count = 1;
    scene.params.staticLen = 80;
    scene.params.dynamicLen = 80;

    const updatedReady = await waitFor(() => {
      const groups = layer.querySelectorAll(":scope > g");
      if (groups.length < 3) return false;

      const reusablePaths = groups[0].querySelectorAll("path");
      if (reusablePaths.length !== 1) return false;

      const staticPath = groups[1].querySelector("path");
      const dynamicPath = groups[2].querySelector("path");
      if (!staticPath || !dynamicPath) return false;

      return (
        reusablePaths[0].getAttribute("data-first-reusable") === "true" &&
        staticPath.getAttribute("d") === staticD1 &&
        dynamicPath.getAttribute("d") !== dynamicD1
      );
    });
    if (!updatedReady) throw new Error("Updated geometry was not committed");

    const groupsAfter = layer.querySelectorAll(":scope > g");
    const reusablePathsAfter = groupsAfter[0].querySelectorAll("path");
    const staticPathAfter = groupsAfter[1].querySelector("path");
    const dynamicPathAfter = groupsAfter[2].querySelector("path");

    const output = {
      reusableCount: reusablePathsAfter.length,
      reusedFirstNode:
        reusablePathsAfter[0]?.getAttribute("data-first-reusable") === "true",
      staticUnchanged: staticPathAfter?.getAttribute("d") === staticD1,
      dynamicChanged: dynamicPathAfter?.getAttribute("d") !== dynamicD1,
    };

    scene.dispose();
    return output;
  });

  expect(result.reusableCount).toBe(1);
  expect(result.reusedFirstNode).toBe(true);
  expect(result.staticUnchanged).toBe(true);
  expect(result.dynamicChanged).toBe(true);
});
