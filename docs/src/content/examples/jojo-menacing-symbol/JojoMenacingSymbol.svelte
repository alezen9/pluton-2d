<script lang="ts">
  import { Pluton2D } from "pluton-2d";
  import ExampleLayout from "@examples/components/ExampleLayout.svelte";

  type SceneParams = {
    height: number;
  };

  type Point = {
    x: number;
    y: number;
  };

  type Bounds = {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };

  const MENACING_PATHS = [
    "M276.8,107.5c19,5.7,39.7,11.7,51.8,14.1C361.7,86.1,424,28.5,444,20.3C418.8,12.5,386.6,7.4,365.2,6C341.6,23.5,295.5,68.3,276.8,107.5z",
    "M357.1,126.9c3.4,6,32.2,32.2,40,31.5c34.2-16.6,89.9-67.8,101-95c-11.4-9.2-27.5-19-38-20.9C434.7,58.1,371.2,108.1,357.1,126.9z",
    "M52.9,390.3c-14.3,27-50.6,89.2-35.3,114.4c3.9,6.5,65.1-11.9,131.8-26.9c46.6-10.4,96.4-24.1,125.2-28.1c11.5-1.6,28.5-26.4,29.4-45c1.2-25.3-0.8-147.8,35.6-223.6c6-10.1,4.1-29.6-2.7-35.4c-8-6.8-20.2-10.5-42.5-3.5c-14.7,4.6-117.8,57-122.8,53.7c-3.2-2.1,9.9-58.8,11.5-70.6c-26.3,29.1-164.5,180.1-142.6,202c14.8,14.8,153.9-80.5,185.7-75.9c14.9,2.1,16.9,10.4,16.2,21.4c-1.9,13.7-15.6,100.4-18.1,114.1C167.5,388,79.9,388.9,52.9,390.3z",
  ];

  const LAYER_CLASSES = ["demo-jojo-layer-a", "demo-jojo-layer-b", "demo-jojo-layer-c"];
  const LAYER_COLORS = ["#a9447c", "#713068", "#0b0c44"];

  let height = $state(248);
  let scene: Pluton2D<SceneParams> | null = null;

  const cubicPoint = (p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point => {
    const u = 1 - t;
    const uu = u * u;
    const tt = t * t;

    return {
      x: uu * u * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + tt * t * p3.x,
      y: uu * u * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + tt * t * p3.y,
    };
  };

  const tokenizePath = (pathData: string): string[] => {
    return pathData.match(/[A-Za-z]|[-+]?\d*\.?\d+(?:e[-+]?\d+)?/g) ?? [];
  };

  const samplePath = (pathData: string, segmentsPerCurve: number): Point[] => {
    const tokens = tokenizePath(pathData);

    let cursor = 0;
    let command = "";
    let currentX = 0;
    let currentY = 0;
    let subpathStartX = 0;
    let subpathStartY = 0;

    const points: Point[] = [];

    const readNumber = () => Number(tokens[cursor++]);

    while (cursor < tokens.length) {
      if (/^[A-Za-z]$/.test(tokens[cursor])) {
        command = tokens[cursor++];
      }

      const relative = command === command.toLowerCase();

      if (command === "M" || command === "m") {
        currentX = (relative ? currentX : 0) + readNumber();
        currentY = (relative ? currentY : 0) + readNumber();
        subpathStartX = currentX;
        subpathStartY = currentY;
        points.push({ x: currentX, y: currentY });
        command = relative ? "l" : "L";
        continue;
      }

      if (command === "L" || command === "l") {
        while (cursor + 1 < tokens.length && !/^[A-Za-z]$/.test(tokens[cursor])) {
          currentX = (relative ? currentX : 0) + readNumber();
          currentY = (relative ? currentY : 0) + readNumber();
          points.push({ x: currentX, y: currentY });
        }
        continue;
      }

      if (command === "C" || command === "c") {
        while (cursor + 5 < tokens.length && !/^[A-Za-z]$/.test(tokens[cursor])) {
          const x1 = (relative ? currentX : 0) + readNumber();
          const y1 = (relative ? currentY : 0) + readNumber();
          const x2 = (relative ? currentX : 0) + readNumber();
          const y2 = (relative ? currentY : 0) + readNumber();
          const x3 = (relative ? currentX : 0) + readNumber();
          const y3 = (relative ? currentY : 0) + readNumber();

          const p0 = { x: currentX, y: currentY };
          const p1 = { x: x1, y: y1 };
          const p2 = { x: x2, y: y2 };
          const p3 = { x: x3, y: y3 };

          for (let step = 1; step <= segmentsPerCurve; step++) {
            points.push(cubicPoint(p0, p1, p2, p3, step / segmentsPerCurve));
          }

          currentX = x3;
          currentY = y3;
        }
        continue;
      }

      if (command === "Z" || command === "z") {
        points.push({ x: subpathStartX, y: subpathStartY });
        currentX = subpathStartX;
        currentY = subpathStartY;
        continue;
      }

      throw new Error(`Unsupported SVG path command: ${command}`);
    }

    return points;
  };

  const measureBounds = (paths: Point[][]): Bounds => {
    const bounds: Bounds = {
      minX: Infinity,
      maxX: -Infinity,
      minY: Infinity,
      maxY: -Infinity,
    };

    for (const path of paths) {
      for (const point of path) {
        bounds.minX = Math.min(bounds.minX, point.x);
        bounds.maxX = Math.max(bounds.maxX, point.x);
        bounds.minY = Math.min(bounds.minY, point.y);
        bounds.maxY = Math.max(bounds.maxY, point.y);
      }
    }

    return bounds;
  };

  const sampledPaths = MENACING_PATHS.map((pathData) => samplePath(pathData, 18));
  const sourceBounds = measureBounds(sampledPaths);
  const sourceCenterX = (sourceBounds.minX + sourceBounds.maxX) / 2;
  const sourceCenterY = (sourceBounds.minY + sourceBounds.maxY) / 2;
  const sourceWidth = sourceBounds.maxX - sourceBounds.minX;
  const sourceHeight = sourceBounds.maxY - sourceBounds.minY;

  const onSetup = (sceneInstance: Pluton2D<SceneParams>) => {
    scene = sceneInstance;

    const geometry = sceneInstance.geometry.group();
    const dimensions = sceneInstance.dimensions.group();
    const fillIds = LAYER_COLORS.map((color) => sceneInstance.addHatchFill(color, 0.22));

    sceneInstance.draw((params) => {
      const scale = params.height / sourceHeight;
      const transformedWidth = sourceWidth * scale;
      const transformedHeight = sourceHeight * scale;
      const left = -transformedWidth / 2;
      const right = transformedWidth / 2;
      const top = transformedHeight / 2;
      const bottom = -transformedHeight / 2;

      for (let pathIndex = 0; pathIndex < sampledPaths.length; pathIndex++) {
        const sampled = sampledPaths[pathIndex];
        const path = geometry.path({
          className: LAYER_CLASSES[pathIndex],
          fill: fillIds[pathIndex],
        });

        for (let pointIndex = 0; pointIndex < sampled.length; pointIndex++) {
          const sourcePoint = sampled[pointIndex];
          const x = (sourcePoint.x - sourceCenterX) * scale;
          const y = (sourceCenterY - sourcePoint.y) * scale;

          if (pointIndex === 0) {
            path.moveToAbs(x, y);
          } else {
            path.lineToAbs(x, y);
          }
        }

        path.close();
      }

      const construction = geometry.path({ className: "demo-jojo-construction" });
      construction
        .moveToAbs(left - 18, 0)
        .lineToAbs(right + 18, 0)
        .moveToAbs(0, bottom - 18)
        .lineToAbs(0, top + 18);

      const dim = dimensions.dimension({ className: "jojo-dim" });

      dim
        .moveToAbs(left, bottom - 28)
        .tick(0)
        .lineTo(transformedWidth, 0)
        .tick(0)
        .textAt(-transformedWidth / 2, -10, `${Math.round(transformedWidth)} mm`, "middle", "jojo-dim");

      dim
        .moveToAbs(right + 30, bottom)
        .tick(-Math.PI / 2)
        .lineTo(0, transformedHeight)
        .tick(Math.PI / 2)
        .textAt(10, -transformedHeight / 2, `${Math.round(transformedHeight)} mm`, "start", "jojo-dim");

      const note = dimensions.dimension({ className: "jojo-note" });
      note
        .moveToAbs(0, 0)
        .textAtAbs(0, top + 26, "MENACING SYMBOL", "middle", "jojo-note")
        .textAtAbs(0, top + 40, "TRACED FROM SOURCE VECTOR", "middle", "jojo-note");
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
      <input type="range" bind:value={height} min={180} max={340} step={2} />
    </label>
    <span class="value">{height}</span>
  </div>
</ExampleLayout>

<style>
  :global(.pluton-root .pluton-geometry path.demo-jojo-layer-a) {
    stroke: rgba(113, 48, 104, 0.95);
    stroke-width: 1.08;
  }

  :global(.pluton-root .pluton-geometry path.demo-jojo-layer-b) {
    stroke: rgba(50, 23, 71, 0.95);
    stroke-width: 1.08;
  }

  :global(.pluton-root .pluton-geometry path.demo-jojo-layer-c) {
    stroke: rgba(9, 11, 68, 0.95);
    stroke-width: 1.08;
  }

  :global(.pluton-root .pluton-geometry path.demo-jojo-construction) {
    --hatch-fill-override: none;
    stroke: rgba(100, 116, 139, 0.58);
    stroke-dasharray: 0.32em;
    stroke-width: 0.9;
  }

  :global(.pluton-root .pluton-dimensions .pluton-dim-stroke.jojo-dim) {
    stroke: rgba(78, 94, 96, 0.9);
  }

  :global(.pluton-root .pluton-dimensions .pluton-dim-filled.jojo-dim) {
    fill: rgba(78, 94, 96, 0.9);
  }

  :global(.pluton-root .pluton-dimensions text.jojo-dim) {
    fill: rgba(78, 94, 96, 0.95);
    font-size: 10px;
    letter-spacing: 0.03em;
  }

  :global(.pluton-root .pluton-dimensions text.jojo-note) {
    fill: rgba(73, 27, 110, 0.9);
    font-size: 10px;
    letter-spacing: 0.08em;
    font-weight: 500;
  }
</style>
