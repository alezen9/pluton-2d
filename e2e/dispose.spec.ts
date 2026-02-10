import { expect, test } from "@playwright/test";
import { openFixturePage } from "./support/fixturePage";

test("dispose removes scene DOM scaffolding and stops further rendering", async ({
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
      params: { width: 100 }
    });
    const geometry = scene.geometry.group();
    scene.draw((params: { width: number }) => {
      geometry.path().moveToAbs(0, 0).lineToAbs(params.width, 0);
    });

    const waitFor = async (check: () => boolean, timeoutMs = 2_000) => {
      const start = performance.now();
      while (performance.now() - start < timeoutMs) {
        if (check()) return true;
        await new Promise((resolve) => setTimeout(resolve, 16));
      }
      return false;
    };

    const initialized = await waitFor(() => {
      return (
        svg.querySelector("defs") !== null &&
        svg.querySelector(".pluton-content-container") !== null &&
        svg.querySelector("path") !== null
      );
    });
    if (!initialized) throw new Error("Scene did not initialize");

    scene.dispose();

    const disposed = await waitFor(() => {
      return (
        svg.querySelector("defs") === null &&
        svg.querySelector(".pluton-content-container") === null &&
        !svg.classList.contains("pluton-root")
      );
    });
    if (!disposed) throw new Error("Scene did not dispose");

    scene.params.width = 200;
    await new Promise((resolve) => setTimeout(resolve, 100));

    return {
      hasDefs: svg.querySelector("defs") !== null,
      hasContent: svg.querySelector(".pluton-content-container") !== null,
      hasRootClass: svg.classList.contains("pluton-root"),
      hasPath: svg.querySelector("path") !== null,
    };
  });

  expect(result.hasDefs).toBe(false);
  expect(result.hasContent).toBe(false);
  expect(result.hasRootClass).toBe(false);
  expect(result.hasPath).toBe(false);
});
