<script lang="ts">
  import { Pluton2D } from "pluton-2d";
  import ExampleLayout from "@examples/components/ExampleLayout.svelte";

  type SceneParams = {
    height: number;
  };

  type GeometryPathBuilder = {
    moveToAbs: (x: number, y: number) => GeometryPathBuilder;
    lineToAbs: (x: number, y: number) => GeometryPathBuilder;
    cubicToAbs: (c1x: number, c1y: number, c2x: number, c2y: number, x: number, y: number) => GeometryPathBuilder;
    close: () => GeometryPathBuilder;
  };

  const toScreenX = (x: number, scale: number, offsetX: number) => x * scale + offsetX;
  const toScreenY = (y: number, scale: number, offsetY: number) => y * scale + offsetY;

  const moveAbs = (
    path: GeometryPathBuilder,
    x: number,
    y: number,
    scale: number,
    offsetX: number,
    offsetY: number,
  ) => path.moveToAbs(toScreenX(x, scale, offsetX), toScreenY(y, scale, offsetY));

  const lineAbs = (
    path: GeometryPathBuilder,
    x: number,
    y: number,
    scale: number,
    offsetX: number,
    offsetY: number,
  ) => path.lineToAbs(toScreenX(x, scale, offsetX), toScreenY(y, scale, offsetY));

  const cubicAbs = (
    path: GeometryPathBuilder,
    c1x: number,
    c1y: number,
    c2x: number,
    c2y: number,
    x: number,
    y: number,
    scale: number,
    offsetX: number,
    offsetY: number,
  ) => path.cubicToAbs(
    toScreenX(c1x, scale, offsetX),
    toScreenY(c1y, scale, offsetY),
    toScreenX(c2x, scale, offsetX),
    toScreenY(c2y, scale, offsetY),
    toScreenX(x, scale, offsetX),
    toScreenY(y, scale, offsetY),
  );

  const appendEllipse = (
    path: GeometryPathBuilder,
    centerX: number,
    centerY: number,
    radiusX: number,
    radiusY: number,
    rotation: number,
    scale: number,
    offsetX: number,
    offsetY: number,
    segments = 24,
  ) => {
    const cosR = Math.cos(rotation);
    const sinR = Math.sin(rotation);

    for (let index = 0; index <= segments; index++) {
      const angle = (index / segments) * Math.PI * 2;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      const localX = radiusX * cosA;
      const localY = radiusY * sinA;
      const x = centerX + localX * cosR - localY * sinR;
      const y = centerY + localX * sinR + localY * cosR;

      if (index === 0) moveAbs(path, x, y, scale, offsetX, offsetY);
      else lineAbs(path, x, y, scale, offsetX, offsetY);
    }

    path.close();
  };

  const drawHeadShell = (path: GeometryPathBuilder, scale: number, offsetX: number, offsetY: number) => {
    moveAbs(path, -104, 62, scale, offsetX, offsetY);
    cubicAbs(path, -113, 97, -109, 136, -78, 151, scale, offsetX, offsetY);
    cubicAbs(path, -41, 171, 8, 173, 43, 161, scale, offsetX, offsetY);
    cubicAbs(path, 78, 149, 103, 120, 106, 83, scale, offsetX, offsetY);
    cubicAbs(path, 108, 54, 102, 20, 90, -8, scale, offsetX, offsetY);
    cubicAbs(path, 72, -36, 26, -49, -33, -46, scale, offsetX, offsetY);
    cubicAbs(path, -71, -45, -95, -30, -102, 8, scale, offsetX, offsetY);
    cubicAbs(path, -105, 23, -104, 43, -104, 62, scale, offsetX, offsetY);
    path.close();
  };

  const drawTorso = (path: GeometryPathBuilder, scale: number, offsetX: number, offsetY: number) => {
    moveAbs(path, -74, -24, scale, offsetX, offsetY);
    cubicAbs(path, -89, -67, -88, -122, -50, -149, scale, offsetX, offsetY);
    cubicAbs(path, -21, -171, 21, -171, 52, -151, scale, offsetX, offsetY);
    cubicAbs(path, 87, -127, 89, -72, 75, -22, scale, offsetX, offsetY);
    cubicAbs(path, 49, -8, 21, -7, 0, -15, scale, offsetX, offsetY);
    cubicAbs(path, -23, -7, -50, -8, -74, -24, scale, offsetX, offsetY);
    path.close();
  };

  const drawVisor = (path: GeometryPathBuilder, scale: number, offsetX: number, offsetY: number) => {
    moveAbs(path, -89, 54, scale, offsetX, offsetY);
    cubicAbs(path, -95, 86, -85, 115, -64, 124, scale, offsetX, offsetY);
    cubicAbs(path, -32, 138, 17, 140, 50, 130, scale, offsetX, offsetY);
    cubicAbs(path, 76, 122, 91, 101, 90, 69, scale, offsetX, offsetY);
    cubicAbs(path, 90, 34, 79, 10, 57, -8, scale, offsetX, offsetY);
    cubicAbs(path, 26, -26, -23, -31, -61, -18, scale, offsetX, offsetY);
    cubicAbs(path, -82, -10, -88, 18, -89, 54, scale, offsetX, offsetY);
    path.close();
  };

  const drawChestPanel = (path: GeometryPathBuilder, scale: number, offsetX: number, offsetY: number) => {
    moveAbs(path, -28, -24, scale, offsetX, offsetY);
    cubicAbs(path, -38, -53, -37, -95, -18, -121, scale, offsetX, offsetY);
    cubicAbs(path, -8, -136, 9, -138, 21, -126, scale, offsetX, offsetY);
    cubicAbs(path, 39, -105, 38, -61, 28, -31, scale, offsetX, offsetY);
    cubicAbs(path, 15, -16, -13, -14, -28, -24, scale, offsetX, offsetY);
    path.close();
  };

  const drawScarf = (path: GeometryPathBuilder, scale: number, offsetX: number, offsetY: number) => {
    moveAbs(path, 55, -39, scale, offsetX, offsetY);
    cubicAbs(path, 100, -38, 148, -53, 180, -84, scale, offsetX, offsetY);
    cubicAbs(path, 198, -103, 211, -111, 226, -101, scale, offsetX, offsetY);
    cubicAbs(path, 196, -84, 161, -76, 124, -79, scale, offsetX, offsetY);
    cubicAbs(path, 95, -82, 71, -68, 54, -43, scale, offsetX, offsetY);
    path.close();
  };

  const drawSilhouette = (path: GeometryPathBuilder, scale: number, offsetX: number, offsetY: number) => {
    drawHeadShell(path, scale, offsetX, offsetY);
    drawTorso(path, scale, offsetX, offsetY);
    appendEllipse(path, -95, -90, 22, 40, -0.42, scale, offsetX, offsetY);
    appendEllipse(path, 93, -90, 22, 40, 0.52, scale, offsetX, offsetY);
    appendEllipse(path, -66, -182, 24, 50, -0.24, scale, offsetX, offsetY);
    appendEllipse(path, 58, -178, 24, 48, 0.18, scale, offsetX, offsetY);
    appendEllipse(path, -80, -235, 23, 14, -0.15, scale, offsetX, offsetY);
    appendEllipse(path, 76, -235, 23, 14, 0.12, scale, offsetX, offsetY);
  };

  let height = $state(300);
  let scene: Pluton2D<SceneParams> | null = null;

  const onSetup = (sceneInstance: Pluton2D<SceneParams>) => {
    scene = sceneInstance;
    const geometry = sceneInstance.geometry.group();

    const shellFillId = sceneInstance.addHatchFill("#f9fcff", 0.06);
    const underlayFillId = sceneInstance.addHatchFill("#4a95ff", 0.16);
    const visorFillId = sceneInstance.addHatchFill("#15203f", 0.24);
    const blueFillId = sceneInstance.addHatchFill("#3e86f4", 0.22);
    const cyanFillId = sceneInstance.addHatchFill("#8ff3ff", 0.28);

    sceneInstance.draw((params) => {
      const scale = Math.max(0.45, params.height / 420);

      drawSilhouette(
        geometry.path({ className: "demo-astro-underlay", fill: underlayFillId, fillRule: "nonzero" }),
        scale,
        6 * scale,
        2 * scale,
      );

      drawSilhouette(
        geometry.path({ className: "demo-astro-shell", fill: shellFillId, fillRule: "nonzero" }),
        scale,
        0,
        0,
      );

      drawVisor(geometry.path({ className: "demo-astro-visor", fill: visorFillId }), scale, 0, 0);
      drawChestPanel(geometry.path({ className: "demo-astro-panel", fill: blueFillId }), scale, 0, 0);
      drawScarf(geometry.path({ className: "demo-astro-scarf", fill: cyanFillId }), scale, 0, 0);

      appendEllipse(geometry.path({ className: "demo-astro-eye", fill: cyanFillId }), -31, 45, 18, 16, 0, scale, 0, 0, 20);
      appendEllipse(geometry.path({ className: "demo-astro-eye", fill: cyanFillId }), 25, 49, 18, 16, 0, scale, 0, 0, 20);

      appendEllipse(geometry.path({ className: "demo-astro-band", fill: blueFillId }), -97, -118, 17, 9, -0.42, scale, 0, 0, 18);
      appendEllipse(geometry.path({ className: "demo-astro-band", fill: blueFillId }), 98, -118, 17, 9, 0.45, scale, 0, 0, 18);
      appendEllipse(geometry.path({ className: "demo-astro-band", fill: blueFillId }), -75, -208, 19, 10, -0.2, scale, 0, 0, 18);
      appendEllipse(geometry.path({ className: "demo-astro-band", fill: blueFillId }), 70, -205, 19, 10, 0.16, scale, 0, 0, 18);

      const antenna = geometry.path({ className: "demo-astro-antenna" });
      moveAbs(antenna, 2, 156, scale, 0, 0);
      cubicAbs(antenna, 3, 180, 18, 207, 32, 221, scale, 0, 0);
      appendEllipse(geometry.path({ className: "demo-astro-orb", fill: cyanFillId }), 36, 225, 11, 11, 0, scale, 0, 0, 20);
    });
  };

  $effect(() => {
    if (!scene) return;
    Object.assign(scene.params, { height });
  });
</script>

<ExampleLayout initialParams={{ height }} {onSetup}>
  <div class="demo-control">
    <label>
      Height
      <input type="range" bind:value={height} min={220} max={520} step={2} />
    </label>
    <span class="value">{height}</span>
  </div>
</ExampleLayout>

<style>
  :global(.pluton-root .pluton-geometry path.demo-astro-underlay) {
    stroke: rgba(42, 92, 190, 0.7);
    stroke-width: 0.96;
  }

  :global(.pluton-root .pluton-geometry path.demo-astro-shell) {
    stroke: rgba(12, 28, 58, 0.86);
    stroke-width: 1.08;
  }

  :global(.pluton-root .pluton-geometry path.demo-astro-visor) {
    stroke: rgba(6, 12, 30, 0.95);
    stroke-width: 0.98;
  }

  :global(.pluton-root .pluton-geometry path.demo-astro-panel) {
    stroke: rgba(39, 96, 219, 0.88);
    stroke-width: 0.9;
  }

  :global(.pluton-root .pluton-geometry path.demo-astro-scarf) {
    stroke: rgba(81, 233, 255, 0.96);
    stroke-width: 0.86;
  }

  :global(.pluton-root .pluton-geometry path.demo-astro-eye) {
    stroke: rgba(95, 236, 255, 0.96);
    stroke-width: 0.82;
  }

  :global(.pluton-root .pluton-geometry path.demo-astro-band) {
    stroke: rgba(33, 84, 190, 0.9);
    stroke-width: 0.82;
  }

  :global(.pluton-root .pluton-geometry path.demo-astro-antenna) {
    fill: none;
    stroke: rgba(210, 236, 255, 0.96);
    stroke-width: 1.35;
  }

  :global(.pluton-root .pluton-geometry path.demo-astro-orb) {
    stroke: rgba(108, 244, 255, 0.96);
    stroke-width: 0.84;
  }
</style>
