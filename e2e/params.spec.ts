import { expect, test } from "@playwright/test";
import { openFixturePage } from "./support/fixturePage";

test("params allow property mutation but block top-level reassignment", async ({
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

    const scene = new Pluton2D(svg, { width: 100, height: 50 });
    let drawCount = 0;
    scene.draw(() => {
      drawCount += 1;
    });

    const waitFor = async (check: () => boolean, timeoutMs = 2_000) => {
      const start = performance.now();
      while (performance.now() - start < timeoutMs) {
        if (check()) return true;
        await new Promise((resolve) => setTimeout(resolve, 16));
      }
      return false;
    };

    const firstDrawOk = await waitFor(() => drawCount >= 1);
    if (!firstDrawOk) throw new Error("Initial draw did not run");

    scene.params.width = 140;
    const secondDrawOk = await waitFor(() => drawCount >= 2);
    if (!secondDrawOk) throw new Error("Draw did not rerun after params mutation");

    const replaceAccepted = Reflect.set(scene, "params", {
      width: 1,
      height: 1,
    });
    const widthAfter = scene.params.width;

    scene.dispose();
    return { drawCount, replaceAccepted, widthAfter };
  });

  expect(result.drawCount).toBeGreaterThanOrEqual(2);
  expect(result.replaceAccepted).toBe(false);
  expect(result.widthAfter).toBe(140);
});
