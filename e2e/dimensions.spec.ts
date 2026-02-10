import { expect, test } from "@playwright/test";
import { openFixturePage } from "./support/fixturePage";

test("dimensions reuse text nodes, remove surplus text, and clear transform state", async ({
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
      params: { mode: 0 }
    });
    const group = scene.dimensions.group();
    group.translate(30, 40);

    scene.draw((params: { mode: number }) => {
      const dim = group.dimension();
      dim
        .moveToAbs(0, 0)
        .lineToAbs(20, 0)
        .textAt(0, 0, params.mode === 0 ? "A" : "Updated");
      if (params.mode === 0) {
        dim.textAt(10, 0, "B");
      }
    });

    const waitFor = async (check: () => boolean, timeoutMs = 2_000) => {
      const start = performance.now();
      while (performance.now() - start < timeoutMs) {
        if (check()) return true;
        await new Promise((resolve) => setTimeout(resolve, 16));
      }
      return false;
    };

    const twoTextsReady = await waitFor(
      () => svg.querySelectorAll(".pluton-dimensions text").length === 2,
    );
    if (!twoTextsReady) throw new Error("Initial dimensions were not committed");

    const textsBefore = svg.querySelectorAll(".pluton-dimensions text");
    textsBefore[0]?.setAttribute("data-first-text", "true");

    scene.params.mode = 1;

    const updatedReady = await waitFor(() => {
      const texts = svg.querySelectorAll(".pluton-dimensions text");
      if (texts.length !== 1) return false;
      return (
        texts[0].getAttribute("data-first-text") === "true" &&
        texts[0].textContent === "Updated"
      );
    });
    if (!updatedReady) throw new Error("Updated dimensions were not committed");

    group.clear();

    const clearedReady = await waitFor(() => {
      const textCount = svg.querySelectorAll(".pluton-dimensions text").length;
      const transform =
        svg.querySelector(".pluton-dimensions > g")?.getAttribute("transform") ?? "";
      return textCount === 0 && transform === "translate(0, 0)";
    });
    if (!clearedReady) throw new Error("Dimensions group did not clear correctly");

    const output = {
      textCount: svg.querySelectorAll(".pluton-dimensions text").length,
      transform:
        svg.querySelector(".pluton-dimensions > g")?.getAttribute("transform") ??
        "",
    };

    scene.dispose();
    return output;
  });

  expect(result.textCount).toBe(0);
  expect(result.transform).toBe("translate(0, 0)");
});
