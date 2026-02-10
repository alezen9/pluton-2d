import { expect, test } from "@playwright/test";
import { openFixturePage } from "./support/fixturePage";

test("grid, axes, and filter toggles update scene presentation", async ({ page }) => {
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
      params: { width: 100 }
    });
    scene.draw((params: { width: number }) => {
      const group = scene.geometry.group();
      group.path().moveToAbs(0, 0).lineToAbs(params.width, 0);
    });

    const waitFor = async (check: () => boolean, timeoutMs = 2_000) => {
      const start = performance.now();
      while (performance.now() - start < timeoutMs) {
        if (check()) return true;
        await new Promise((resolve) => setTimeout(resolve, 16));
      }
      return false;
    };

    const ready = await waitFor(() => {
      return (
        svg.querySelector(".pluton-graph-paper") instanceof SVGRectElement &&
        svg.querySelector(".pluton-axes") instanceof SVGGElement &&
        svg.querySelector(".pluton-geometry") instanceof SVGGElement &&
        svg.querySelector(".pluton-dimensions") instanceof SVGGElement
      );
    });
    if (!ready) throw new Error("Scene layers were not initialized");

    const grid = svg.querySelector(".pluton-graph-paper") as SVGRectElement;
    const axes = svg.querySelector(".pluton-axes") as SVGGElement;
    const geometryLayer = svg.querySelector(".pluton-geometry") as SVGGElement;
    const dimensionsLayer = svg.querySelector(".pluton-dimensions") as SVGGElement;

    scene.enableGrid(false);
    scene.enableAxes(false);
    scene.enableFilter(true);

    const toggled = await waitFor(() => {
      return (
        grid.style.display === "none" &&
        axes.style.display === "none" &&
        geometryLayer.style.filter.includes("url(") &&
        dimensionsLayer.style.filter.includes("url(")
      );
    });
    if (!toggled) throw new Error("Toggles did not apply expected styles");

    scene.enableGrid(true);
    scene.enableAxes(true);
    scene.enableFilter(false);

    const restored = await waitFor(() => {
      return (
        grid.style.display === "" &&
        axes.style.display === "" &&
        geometryLayer.style.filter === "none" &&
        dimensionsLayer.style.filter === "none"
      );
    });
    if (!restored) throw new Error("Toggles did not restore expected styles");

    const output = {
      gridDisplay: grid.style.display,
      axesDisplay: axes.style.display,
      geometryFilter: geometryLayer.style.filter,
      dimensionsFilter: dimensionsLayer.style.filter,
    };

    scene.dispose();
    return output;
  });

  expect(result.gridDisplay).toBe("");
  expect(result.axesDisplay).toBe("");
  expect(result.geometryFilter).toBe("none");
  expect(result.dimensionsFilter).toBe("none");
});

test("group.visible() toggles group display", async ({ page }) => {
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

    const scene = new Pluton2D(svg, {});
    const geomGroup = scene.geometry.group();
    const dimGroup = scene.dimensions.group();

    scene.draw(() => {
      geomGroup.path().moveToAbs(0, 0).lineToAbs(50, 50);
      dimGroup.dimension().moveToAbs(0, 0).lineTo(30, 0).tick(0);
    });

    const waitFor = async (check: () => boolean, timeoutMs = 2_000) => {
      const start = performance.now();
      while (performance.now() - start < timeoutMs) {
        if (check()) return true;
        await new Promise((resolve) => setTimeout(resolve, 16));
      }
      return false;
    };

    await waitFor(() => {
      const geomLayer = svg.querySelector(".pluton-geometry");
      return geomLayer?.querySelector("g path") !== null;
    });

    const geomLayer = svg.querySelector(".pluton-geometry") as SVGGElement;
    const dimLayer = svg.querySelector(".pluton-dimensions") as SVGGElement;
    const geomG = geomLayer.querySelector(":scope > g") as SVGGElement;
    const dimG = dimLayer.querySelector(":scope > g") as SVGGElement;

    const initialGeomDisplay = geomG.getAttribute("display");
    const initialDimDisplay = dimG.getAttribute("display");

    geomGroup.visible(false);
    dimGroup.visible(false);

    const hiddenGeomDisplay = geomG.getAttribute("display");
    const hiddenDimDisplay = dimG.getAttribute("display");

    geomGroup.visible(true);
    dimGroup.visible(true);

    const restoredGeomDisplay = geomG.getAttribute("display");
    const restoredDimDisplay = dimG.getAttribute("display");

    scene.dispose();

    return {
      initialGeomDisplay,
      initialDimDisplay,
      hiddenGeomDisplay,
      hiddenDimDisplay,
      restoredGeomDisplay,
      restoredDimDisplay,
    };
  });

  expect(result.initialGeomDisplay).toBeNull();
  expect(result.initialDimDisplay).toBeNull();
  expect(result.hiddenGeomDisplay).toBe("none");
  expect(result.hiddenDimDisplay).toBe("none");
  expect(result.restoredGeomDisplay).toBeNull();
  expect(result.restoredDimDisplay).toBeNull();
});
