import { expect, test } from "@playwright/test";
import { openFixturePage } from "./support/fixturePage";

test("sustained redraw loop completes within regression budget", async ({
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
    svg.setAttribute("width", "400");
    svg.setAttribute("height", "300");
    app.replaceChildren(svg);

    const scene = new Pluton2D(svg, { width: 40 });
    const group = scene.geometry.group();

    const targetDraws = 60;
    let drawCount = 0;
    const start = performance.now();

    scene.draw((params: { width: number }) => {
      drawCount += 1;

      // Keep work realistic but small: one path per frame with changing width.
      group.path().moveToAbs(0, 0).lineToAbs(params.width, 0);

      // Trigger another frame until target is reached.
      if (drawCount < targetDraws) {
        scene.params.width = params.width + 1;
      }
    });

    const waitFor = async (check: () => boolean, timeoutMs = 7_000) => {
      const started = performance.now();
      while (performance.now() - started < timeoutMs) {
        if (check()) return true;
        await new Promise((resolve) => setTimeout(resolve, 16));
      }
      return false;
    };

    const complete = await waitFor(() => drawCount >= targetDraws);
    if (!complete) {
      throw new Error(`Timed out before ${targetDraws} redraws`);
    }

    const elapsedMs = performance.now() - start;
    const finalWidth = scene.params.width;

    scene.dispose();
    return { drawCount, elapsedMs, finalWidth };
  });

  expect(result.drawCount).toBeGreaterThanOrEqual(60);
  expect(result.finalWidth).toBeGreaterThanOrEqual(99);
  // Regression guard, not micro-benchmark:
  expect(result.elapsedMs).toBeLessThan(3_500);
});
