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
    scene.enableMask(true);

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

    const displacementFilterEl = root.querySelector("#pluton-filter-displacement") as SVGFilterElement | null;
    const maskFilterEl = root.querySelector("#pluton-filter-mask") as SVGFilterElement | null;

    const allElements = Array.from(root.querySelectorAll("*"));
    const hasRef = (id: string, absolute: boolean) => {
      const pattern = absolute
        ? new RegExp(`url\\(\\s*(['"]?)https?:\\/\\/[^)]*#${id}\\1\\s*\\)`)
        : new RegExp(`url\\(\\s*(['"]?)#${id}\\1\\s*\\)`);

      return allElements.some((el) => {
        const filterAttr = el.getAttribute("filter") ?? "";
        const styleAttr = el.getAttribute("style") ?? "";
        return pattern.test(filterAttr) || pattern.test(styleAttr);
      });
    };

    const hasNormalizedFilterRef = hasRef("pluton-filter-displacement", false);
    const hasNormalizedStrokeMaskRef = hasRef("pluton-filter-mask", false);
    const hasAbsoluteFilterRef = hasRef("pluton-filter-displacement", true);
    const hasAbsoluteStrokeMaskRef = hasRef("pluton-filter-mask", true);

    const hasDisplacementStage = Boolean(
      displacementFilterEl?.querySelector("feDisplacementMap"),
    );
    const hasMaskFilterDef = Boolean(maskFilterEl);
    const hasMaskNoiseStage = Boolean(
      maskFilterEl?.querySelector("feTurbulence"),
    );
    const hasMaskAlphaStage = Boolean(
      maskFilterEl?.querySelector('feColorMatrix[type="luminanceToAlpha"]'),
    );
    const hasMaskThresholdStage = Boolean(
      maskFilterEl?.querySelector(
        'feComponentTransfer[result="thresholded"] feFuncA[type="discrete"]',
      ),
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
      hasNormalizedStrokeMaskRef,
      hasAbsoluteFilterRef,
      hasAbsoluteStrokeMaskRef,
      hasDisplacementStage,
      hasMaskFilterDef,
      hasMaskNoiseStage,
      hasMaskAlphaStage,
      hasMaskThresholdStage,
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
  expect(result.hasNormalizedStrokeMaskRef).toBe(false);
  expect(result.hasAbsoluteFilterRef).toBe(false);
  expect(result.hasAbsoluteStrokeMaskRef).toBe(false);
  expect(result.hasDisplacementStage).toBe(true);
  expect(result.hasMaskFilterDef).toBe(true);
  expect(result.hasMaskNoiseStage).toBe(true);
  expect(result.hasMaskAlphaStage).toBe(true);
  expect(result.hasMaskThresholdStage).toBe(true);
  expect(result.customWidth).toBe("640");
  expect(result.customHeight).toBe("480");
});

test("snapshotSvg normalizes absolute mask filter URLs in attributes", async ({
  page,
}) => {
  await openFixturePage(page);

  const result = await page.evaluate(() => {
    const api = (window as Window & {
      plutonE2E?: {
        snapshotSvg?: (svg: SVGSVGElement, options?: Record<string, unknown>) => string;
      };
    }).plutonE2E;

    const snapshotSvg = api?.snapshotSvg;
    if (!snapshotSvg) throw new Error("snapshotSvg is not available in fixture");

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "100");
    svg.setAttribute("height", "100");

    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
    const filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
    filter.setAttribute("id", "pluton-filter-mask");
    defs.appendChild(filter);
    svg.appendChild(defs);

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M 0 0 L 10 0");
    path.setAttribute("filter", `url("${location.origin}/#pluton-filter-mask")`);
    svg.appendChild(path);

    const xml = snapshotSvg(svg);
    const doc = new DOMParser().parseFromString(xml, "image/svg+xml");
    const allElements = Array.from(doc.documentElement.querySelectorAll("*"));
    const hasRef = (absolute: boolean) => {
      const pattern = absolute
        ? /url\(\s*(['"]?)https?:\/\/[^)]*#pluton-filter-mask\1\s*\)/
        : /url\(\s*(['"]?)#pluton-filter-mask\1\s*\)/;

      return allElements.some((el) => {
        const filterAttr = el.getAttribute("filter") ?? "";
        const styleAttr = el.getAttribute("style") ?? "";
        return pattern.test(filterAttr) || pattern.test(styleAttr);
      });
    };

    return {
      hasNormalizedMaskRef: hasRef(false),
      hasAbsoluteMaskRef: hasRef(true),
    };
  });

  expect(result.hasNormalizedMaskRef).toBe(true);
  expect(result.hasAbsoluteMaskRef).toBe(false);
});

test("displacement and mask controls are decoupled", async ({
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

    scene.draw(() => {
      group.path().moveToAbs(-40, 0).lineToAbs(40, 0);
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

    if (!ready) throw new Error("Scene did not render in time for filter test");

    const displacementFilter = svg.querySelector("#pluton-filter-displacement");
    const maskFilter = svg.querySelector("#pluton-filter-mask");
    if (!(displacementFilter instanceof SVGElement) || !(maskFilter instanceof SVGElement)) {
      throw new Error("Filter definitions are missing");
    }

    const displacement = displacementFilter.querySelector("feDisplacementMap");
    const maskTurbulence = maskFilter.querySelector("feTurbulence");
    const maskTransferFn = maskFilter.querySelector(
      'feComponentTransfer[result="thresholded"] feFuncA[type="discrete"]',
    );
    if (
      !(displacement instanceof SVGElement) ||
      !(maskTurbulence instanceof SVGElement) ||
      !(maskTransferFn instanceof SVGElement)
    ) {
      throw new Error("Filter stages are missing");
    }

    const maskStateBefore = svg.classList.contains("pluton-mask-on");
    scene.enableMask(true);
    const maskStateAfterEnable = svg.classList.contains("pluton-mask-on");
    scene.enableMask(false);
    const maskStateAfterDisable = svg.classList.contains("pluton-mask-on");

    const activeBefore = {
      scale: displacement.getAttribute("scale"),
      maskFreq: maskTurbulence.getAttribute("baseFrequency"),
      maskTable: maskTransferFn.getAttribute("tableValues"),
    };

    scene.setDisplacementScale(0);
    const scaleAtZero = {
      scale: displacement.getAttribute("scale"),
      maskFreq: maskTurbulence.getAttribute("baseFrequency"),
    };

    scene.setMaskFrequency(0);
    const maskAtZero = {
      scale: displacement.getAttribute("scale"),
      maskFreq: maskTurbulence.getAttribute("baseFrequency"),
    };

    scene.setDisplacementScale(1.8);
    scene.setMaskFrequency(1.8);
    const activeRestored = {
      scale: displacement.getAttribute("scale"),
      maskFreq: maskTurbulence.getAttribute("baseFrequency"),
    };

    scene.dispose();

    return {
      activeBefore,
      scaleAtZero,
      maskAtZero,
      activeRestored,
      maskStateBefore,
      maskStateAfterEnable,
      maskStateAfterDisable,
    };
  });

  expect(result.activeBefore.scale).toBe("2.75");
  expect(result.activeBefore.maskFreq).toBe("0.03");
  expect(result.activeBefore.maskTable).toBe("0 1");
  expect(result.maskStateBefore).toBe(false);
  expect(result.maskStateAfterEnable).toBe(true);
  expect(result.maskStateAfterDisable).toBe(false);
  expect(result.scaleAtZero.scale).toBe("0");
  expect(result.scaleAtZero.maskFreq).toBe("0.03");
  expect(result.maskAtZero.scale).toBe("0");
  expect(result.maskAtZero.maskFreq).toBe("0");
  expect(result.activeRestored.scale).toBe("1.8");
  expect(result.activeRestored.maskFreq).toBe("1.8");
});
