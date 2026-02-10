import { expect, test } from "@playwright/test";
import { openFixturePage } from "./support/fixturePage";

test("repeated create/dispose cycles remain stable and clean", async ({
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

    const waitFor = async (check: () => boolean, timeoutMs = 2_000) => {
      const start = performance.now();
      while (performance.now() - start < timeoutMs) {
        if (check()) return true;
        await new Promise((resolve) => setTimeout(resolve, 16));
      }
      return false;
    };

    const cycles = 30;
    let completed = 0;

    for (let i = 0; i < cycles; i += 1) {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", "300");
      svg.setAttribute("height", "200");
      app.replaceChildren(svg);

      const scene = new Pluton2D(svg, {
        params: { width: 100 + i }
      });
      const group = scene.geometry.group();
      scene.draw((params: { width: number }) => {
        group.path().moveToAbs(0, 0).lineToAbs(params.width, 0);
      });

      const initialized = await waitFor(() => {
        return (
          svg.querySelector("defs") !== null &&
          svg.querySelector(".pluton-content-container") !== null &&
          svg.querySelector("path") !== null
        );
      });
      if (!initialized) {
        throw new Error(`Cycle ${i + 1}: scene did not initialize`);
      }

      scene.dispose();

      const disposed = await waitFor(() => {
        return (
          svg.querySelector("defs") === null &&
          svg.querySelector(".pluton-content-container") === null &&
          !svg.classList.contains("pluton-root")
        );
      });
      if (!disposed) {
        throw new Error(`Cycle ${i + 1}: scene did not dispose cleanly`);
      }

      completed += 1;
    }

    const finalSvg = app.querySelector("svg");
    if (!(finalSvg instanceof SVGSVGElement)) {
      throw new Error("Final svg not found");
    }

    return {
      completed,
      finalHasDefs: finalSvg.querySelector("defs") !== null,
      finalHasContent:
        finalSvg.querySelector(".pluton-content-container") !== null,
      finalHasRootClass: finalSvg.classList.contains("pluton-root"),
    };
  });

  expect(result.completed).toBe(30);
  expect(result.finalHasDefs).toBe(false);
  expect(result.finalHasContent).toBe(false);
  expect(result.finalHasRootClass).toBe(false);
});
