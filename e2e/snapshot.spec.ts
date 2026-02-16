import { expect, test } from "@playwright/test";
import { openFixturePage } from "./support/fixturePage";

test("snapshotSvg creates standalone SVG with normalized refs and optional background", async ({
  page,
}) => {
  await openFixturePage(page);

  const result = await page.evaluate(async () => {
    const api = (window as Window & {
      plutonE2E?: {
        Pluton2D?: new (...args: any[]) => any;
        snapshotSvg?: (svg: SVGSVGElement, options?: Record<string, unknown>) => string;
      };
    }).plutonE2E;

    const Pluton2D = api?.Pluton2D;
    const snapshotSvg = api?.snapshotSvg;
    if (!Pluton2D || !snapshotSvg) {
      throw new Error("Pluton2D or snapshotSvg is not available in fixture");
    }

    const app = document.querySelector("#app");
    if (!(app instanceof HTMLElement)) throw new Error("Fixture root #app not found");

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "320");
    svg.setAttribute("height", "240");
    app.replaceChildren(svg);

    const scene = new Pluton2D(svg, {});
    const group = scene.geometry.group();
    const hatchFill = scene.addHatchFill("#2563eb", 0.45);

    scene.draw(() => {
      group
        .path({ stroke: "#2563eb", fill: hatchFill })
        .moveToAbs(-40, -20)
        .lineToAbs(40, -20)
        .lineToAbs(40, 20)
        .lineToAbs(-40, 20)
        .close();
    });
    scene.enableFilter(true);

    const waitFor = async (check: () => boolean, timeoutMs = 2000) => {
      const start = performance.now();
      while (performance.now() - start < timeoutMs) {
        if (check()) return true;
        await new Promise((resolve) => setTimeout(resolve, 16));
      }
      return false;
    };

    const ready = await waitFor(() => {
      const geometryLayer = svg.querySelector(".pluton-geometry") as SVGGElement | null;
      return Boolean(
        geometryLayer &&
          geometryLayer.querySelector("path") &&
          geometryLayer.style.filter.includes("url("),
      );
    });

    if (!ready) throw new Error("Scene did not render in time for snapshot test");

    const xml = snapshotSvg(svg, { background: "#f8f4ea" });
    const xmlCustomSize = snapshotSvg(svg, {
      width: 640,
      height: 480,
      background: "#f8f4ea",
    });

    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "image/svg+xml");
    const root = doc.documentElement;

    const docCustomSize = parser.parseFromString(xmlCustomSize, "image/svg+xml");
    const rootCustomSize = docCustomSize.documentElement;

    const backgroundRect = root.querySelector(
      'rect[data-pluton-snapshot-background="true"]',
    ) as SVGRectElement | null;

    const hasNormalizedFilterRef = /url\(#pluton-filter-pencil\)/.test(xml);
    const hasAbsoluteFilterRef = /url\((['"]?)https?:\/\/[^)]*#pluton-filter-pencil\1\)/.test(
      xml,
    );

    scene.dispose();

    return {
      hasXmlDeclaration: xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'),
      hasXmlns: root.getAttribute("xmlns") === "http://www.w3.org/2000/svg",
      hasXmlnsXlink: root.getAttribute("xmlns:xlink") === "http://www.w3.org/1999/xlink",
      hasViewBox: Boolean(root.getAttribute("viewBox")),
      hasBackgroundRect: Boolean(backgroundRect),
      backgroundFill: backgroundRect?.getAttribute("fill"),
      hasNormalizedFilterRef,
      hasAbsoluteFilterRef,
      customWidth: rootCustomSize.getAttribute("width"),
      customHeight: rootCustomSize.getAttribute("height"),
    };
  });

  expect(result.hasXmlDeclaration).toBe(true);
  expect(result.hasXmlns).toBe(true);
  expect(result.hasXmlnsXlink).toBe(true);
  expect(result.hasViewBox).toBe(true);
  expect(result.hasBackgroundRect).toBe(true);
  expect(result.backgroundFill).toBe("#f8f4ea");
  expect(result.hasNormalizedFilterRef).toBe(true);
  expect(result.hasAbsoluteFilterRef).toBe(false);
  expect(result.customWidth).toBe("640");
  expect(result.customHeight).toBe("480");
});
