import { expect, test } from "@playwright/test";
import { openFixturePage } from "./support/fixturePage";

test("addLinearGradient/addRadialGradient inject defs, dedupe by content, and apply as path fill", async ({
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
    if (!(app instanceof HTMLElement)) throw new Error("Fixture root #app not found");

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "320");
    svg.setAttribute("height", "240");
    app.replaceChildren(svg);

    const scene = new Pluton2D(svg, {});
    const group = scene.geometry.group();

    const linearA = scene.addLinearGradient([
      { at: [0, 0], color: "#1d4ed8" },
      { at: [0, 1], color: "#f59e0b" },
    ]);
    const linearADuplicate = scene.addLinearGradient([
      { at: [0, 0], color: "#1d4ed8" },
      { at: [0, 1], color: "#f59e0b" },
    ]);
    const linearB = scene.addLinearGradient([
      { at: [0, 0], color: "#1d4ed8" },
      { at: [0, 1], color: "#22c55e" },
    ]);

    // 3-stop with intermediate not on a clean offset — should be projected
    const projected = scene.addLinearGradient([
      { at: [0, 0], color: "#000" },
      { at: [0, 30], color: "#888" },   // 30% along a 0→100 vector
      { at: [0, 100], color: "#fff" },
    ]);

    const radial = scene.addRadialGradient(
      [
        { offset: 0, color: "#ffffff", opacity: 0.9 },
        { offset: 1, color: "#0f172a" },
      ],
      { units: "userSpaceOnUse", center: [0, 0], radius: 50 },
    );

    scene.draw(() => {
      group
        .path({ fill: linearA, stroke: "#0f172a" })
        .moveToAbs(-40, -20)
        .lineToAbs(40, -20)
        .lineToAbs(40, 20)
        .lineToAbs(-40, 20)
        .close();
      group
        .path({ fill: radial, stroke: "#0f172a" })
        .moveToAbs(60, -20)
        .lineToAbs(140, -20)
        .lineToAbs(140, 20)
        .lineToAbs(60, 20)
        .close();
    });

    const waitFor = async (check: () => boolean, timeoutMs = 2000) => {
      const start = performance.now();
      while (performance.now() - start < timeoutMs) {
        if (check()) return true;
        await new Promise((resolve) => setTimeout(resolve, 16));
      }
      return false;
    };

    const ready = await waitFor(() => {
      const layer = svg.querySelector(".pluton-geometry");
      return Boolean(layer && layer.querySelectorAll("path").length >= 2);
    });
    if (!ready) throw new Error("Scene did not render gradient paths in time");

    const extractId = (fillValue: string) => fillValue.replace(/^url\(#|\)$/g, "");
    const linearAId = extractId(linearA);
    const linearBId = extractId(linearB);
    const projectedId = extractId(projected);
    const radialId = extractId(radial);

    const linearAEl = svg.querySelector(`#${linearAId}`) as SVGLinearGradientElement | null;
    const linearBEl = svg.querySelector(`#${linearBId}`) as SVGLinearGradientElement | null;
    const projectedEl = svg.querySelector(`#${projectedId}`) as SVGLinearGradientElement | null;
    const radialEl = svg.querySelector(`#${radialId}`) as SVGRadialGradientElement | null;
    const projectedStops = projectedEl ? Array.from(projectedEl.querySelectorAll("stop")) : [];

    const linearAStops = linearAEl ? Array.from(linearAEl.querySelectorAll("stop")) : [];
    const radialStops = radialEl ? Array.from(radialEl.querySelectorAll("stop")) : [];

    const paths = svg.querySelectorAll(".pluton-geometry path");
    const firstPathFill = (paths[0] as SVGPathElement | undefined)?.style.getPropertyValue(
      "--hatch-fill-value",
    );
    const secondPathFill = (paths[1] as SVGPathElement | undefined)?.style.getPropertyValue(
      "--hatch-fill-value",
    );

    const totalLinearDefs = svg.querySelectorAll("defs linearGradient[id^='pluton-gradient-linear-']").length;
    const totalRadialDefs = svg.querySelectorAll("defs radialGradient[id^='pluton-gradient-radial-']").length;

    scene.dispose();

    return {
      linearADedupe: linearA === linearADuplicate,
      linearABDifferent: linearA !== linearB,
      linearAExists: Boolean(linearAEl),
      linearBExists: Boolean(linearBEl),
      projectedExists: Boolean(projectedEl),
      projectedStopOffsets: projectedStops.map((s) => s.getAttribute("offset")),
      radialExists: Boolean(radialEl),
      linearAUnits: linearAEl?.getAttribute("gradientUnits"),
      linearAX1: linearAEl?.getAttribute("x1"),
      linearAY1: linearAEl?.getAttribute("y1"),
      linearAX2: linearAEl?.getAttribute("x2"),
      linearAY2: linearAEl?.getAttribute("y2"),
      linearAStopCount: linearAStops.length,
      linearAStop0Color: linearAStops[0]?.getAttribute("stop-color"),
      linearAStop1Color: linearAStops[1]?.getAttribute("stop-color"),
      radialUnits: radialEl?.getAttribute("gradientUnits"),
      radialCx: radialEl?.getAttribute("cx"),
      radialCy: radialEl?.getAttribute("cy"),
      radialR: radialEl?.getAttribute("r"),
      radialStop0Opacity: radialStops[0]?.getAttribute("stop-opacity"),
      radialStop1HasOpacity: radialStops[1]?.hasAttribute("stop-opacity") ?? false,
      firstPathFill: firstPathFill?.trim(),
      secondPathFill: secondPathFill?.trim(),
      totalLinearDefs,
      totalRadialDefs,
    };
  });

  expect(result.linearADedupe).toBe(true);
  expect(result.linearABDifferent).toBe(true);
  expect(result.linearAExists).toBe(true);
  expect(result.linearBExists).toBe(true);
  expect(result.radialExists).toBe(true);
  expect(result.linearAUnits).toBe("objectBoundingBox");
  expect(result.linearAX1).toBe("0");
  expect(result.linearAY1).toBe("0");
  expect(result.linearAX2).toBe("0");
  expect(result.linearAY2).toBe("1");
  expect(result.linearAStopCount).toBe(2);
  expect(result.linearAStop0Color).toBe("#1d4ed8");
  expect(result.linearAStop1Color).toBe("#f59e0b");
  expect(result.projectedExists).toBe(true);
  expect(result.projectedStopOffsets).toEqual(["0", "0.3", "1"]);
  expect(result.radialUnits).toBe("userSpaceOnUse");
  expect(result.radialCx).toBe("0");
  expect(result.radialCy).toBe("0");
  expect(result.radialR).toBe("50");
  expect(result.radialStop0Opacity).toBe("0.9");
  expect(result.radialStop1HasOpacity).toBe(false);
  expect(result.firstPathFill).toMatch(/^url\(#pluton-gradient-linear-/);
  expect(result.secondPathFill).toMatch(/^url\(#pluton-gradient-radial-/);
  expect(result.totalLinearDefs).toBe(3);
  expect(result.totalRadialDefs).toBe(1);
});
