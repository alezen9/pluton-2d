<script lang="ts">
  import { Pluton2D } from "pluton-2d";
  import ExampleLayout from "@examples/components/ExampleLayout.svelte";

  type SceneParams = {
    outerRadius: number;
    toothCount: number;
    toothDepth: number;
    boreRadius: number;
    boltCircleRadius: number;
    boltCount: number;
    boltHoleDiameter: number;
  };

  type Point = { x: number; y: number };

  type GeometryPathBuilder = {
    moveToAbs: (x: number, y: number) => GeometryPathBuilder;
    lineToAbs: (x: number, y: number) => GeometryPathBuilder;
    cubicToAbs: (
      c1x: number,
      c1y: number,
      c2x: number,
      c2y: number,
      x: number,
      y: number,
    ) => GeometryPathBuilder;
    smoothCubicToAbs: (c2x: number, c2y: number, x: number, y: number) => GeometryPathBuilder;
    close: () => GeometryPathBuilder;
  };

  let outerRadius = $state(188);
  let toothCount = $state(22);
  let toothDepth = $state(20);
  let boreRadius = $state(36);
  let boltCircleRadius = $state(84);
  let boltCount = $state(6);
  let boltHoleDiameter = $state(14);

  let scene: Pluton2D<SceneParams> | null = null;

  const appendCircle = (path: GeometryPathBuilder, cx: number, cy: number, r: number) => {
    const handleOffset = r * 0.5522847498;
    path
      .moveToAbs(cx - r, cy)
      .cubicToAbs(cx - r, cy + handleOffset, cx - handleOffset, cy + r, cx, cy + r)
      .smoothCubicToAbs(cx + r, cy + handleOffset, cx + r, cy)
      .smoothCubicToAbs(cx + handleOffset, cy - r, cx, cy - r)
      .smoothCubicToAbs(cx - r, cy - handleOffset, cx - r, cy)
      .close();
  };

  const appendClosedPath = (path: GeometryPathBuilder, points: Point[]) => {
    if (points.length === 0) return;

    path.moveToAbs(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      path.lineToAbs(points[i].x, points[i].y);
    }
    path.close();
  };

  const onSetup = (sceneInstance: Pluton2D<SceneParams>) => {
    scene = sceneInstance;

    const geometry = sceneInstance.geometry.group();
    const dimensions = sceneInstance.dimensions.group();

    const plateFillId = sceneInstance.addHatchFill("#0f766e", 0.18);
    const boltFillId = sceneInstance.addHatchFill("#7f1d1d", 0.16);

    sceneInstance.draw((params) => {
      const toothCountValue = Math.max(10, Math.round(params.toothCount));
      const outerRadiusValue = params.outerRadius;
      const safeRootR = Math.max(params.boreRadius + params.boltHoleDiameter * 1.3, outerRadiusValue - params.toothDepth);
      const rootRadiusValue = Math.min(outerRadiusValue - 8, safeRootR);
      const holeCount = Math.max(3, Math.round(params.boltCount));
      const holeRadius = params.boltHoleDiameter / 2;
      const boltCircleRadiusValue = Math.max(rootRadiusValue * 0.28, Math.min(params.boltCircleRadius, rootRadiusValue - holeRadius - 10));

      const profilePoints: Point[] = [];
      const step = Math.PI / toothCountValue;
      const start = -Math.PI / 2;
      for (let i = 0; i < toothCountValue * 2; i++) {
        const angle = start + i * step;
        const r = i % 2 === 0 ? outerRadiusValue : rootRadiusValue;
        profilePoints.push({ x: Math.cos(angle) * r, y: Math.sin(angle) * r });
      }

      appendClosedPath(
        geometry.path({ className: "demo-sprocket-plate", fill: plateFillId }),
        profilePoints,
      );

      const boltPath = geometry.path({ className: "demo-sprocket-bolts", fill: boltFillId });
      for (let i = 0; i < holeCount; i++) {
        const a = (i / holeCount) * Math.PI * 2;
        appendCircle(boltPath, Math.cos(a) * boltCircleRadiusValue, Math.sin(a) * boltCircleRadiusValue, holeRadius);
      }

      appendCircle(geometry.path({ className: "demo-sprocket-bore" }), 0, 0, params.boreRadius);

      const construction = geometry.path({ className: "demo-sprocket-construction" });
      appendCircle(construction, 0, 0, outerRadiusValue);
      appendCircle(construction, 0, 0, rootRadiusValue);
      appendCircle(construction, 0, 0, boltCircleRadiusValue);
      construction
        .moveToAbs(-outerRadiusValue * 1.08, 0)
        .lineToAbs(outerRadiusValue * 1.08, 0)
        .moveToAbs(0, -outerRadiusValue * 1.08)
        .lineToAbs(0, outerRadiusValue * 1.08);

      const dim = dimensions.dimension({ className: "sprocket-dim" });

      dim
        .moveToAbs(-outerRadiusValue, outerRadiusValue + 34)
        .tick(0)
        .lineTo(outerRadiusValue * 2, 0)
        .tick(0)
        .textAt(-outerRadiusValue, -12, `${Math.round(outerRadiusValue * 2)} mm`, "middle", "sprocket-dim");

      dim
        .moveToAbs(outerRadiusValue + 44, -boltCircleRadiusValue)
        .tick(-Math.PI / 2)
        .lineTo(0, boltCircleRadiusValue * 2)
        .tick(Math.PI / 2)
        .textAt(12, -boltCircleRadiusValue, `${Math.round(boltCircleRadiusValue * 2)} mm PCD`, "start", "sprocket-dim");

      dim
        .moveToAbs(outerRadiusValue + 82, -params.boreRadius)
        .tick(-Math.PI / 2)
        .lineTo(0, params.boreRadius * 2)
        .tick(Math.PI / 2)
        .textAt(12, -params.boreRadius, `${Math.round(params.boreRadius * 2)} mm BORE`, "start", "sprocket-dim");

      const note = dimensions.dimension({ className: "sprocket-note" });
      note
        .moveToAbs(0, 0)
        .textAtAbs(0, -outerRadiusValue - 38, `${toothCountValue} TOOTH PLATE`, "middle", "sprocket-note")
        .textAtAbs(0, -outerRadiusValue - 54, `${holeCount} X Ø${Math.round(params.boltHoleDiameter)} BOLTS`, "middle", "sprocket-note");
    });
  };

  $effect(() => {
    if (!scene) return;

    Object.assign(scene.params, {
      outerRadius,
      toothCount,
      toothDepth,
      boreRadius,
      boltCircleRadius,
      boltCount,
      boltHoleDiameter,
    });
  });
</script>

<ExampleLayout
  initialParams={{
    outerRadius,
    toothCount,
    toothDepth,
    boreRadius,
    boltCircleRadius,
    boltCount,
    boltHoleDiameter,
  }}
  {onSetup}
>
  {#snippet params()}
    <div class="demo-control">
      <label>
        Outer R
        <input type="range" bind:value={outerRadius} min={120} max={260} step={2} />
      </label>
      <span class="value">{outerRadius}</span>
    </div>
    <div class="demo-control">
      <label>
        Teeth
        <input type="range" bind:value={toothCount} min={12} max={36} step={1} />
      </label>
      <span class="value">{toothCount}</span>
    </div>
    <div class="demo-control">
      <label>
        Tooth Depth
        <input type="range" bind:value={toothDepth} min={8} max={36} step={1} />
      </label>
      <span class="value">{toothDepth}</span>
    </div>
    <div class="demo-control">
      <label>
        Bore R
        <input type="range" bind:value={boreRadius} min={18} max={74} step={1} />
      </label>
      <span class="value">{boreRadius}</span>
    </div>
    <div class="demo-control">
      <label>
        Bolt Circle R
        <input type="range" bind:value={boltCircleRadius} min={42} max={130} step={1} />
      </label>
      <span class="value">{boltCircleRadius}</span>
    </div>
    <div class="demo-control">
      <label>
        Bolt Count
        <input type="range" bind:value={boltCount} min={3} max={10} step={1} />
      </label>
      <span class="value">{boltCount}</span>
    </div>
  {/snippet}
</ExampleLayout>

<style>
  :global(.pluton-root .pluton-geometry path.demo-sprocket-plate) {
    stroke: rgba(8, 86, 78, 0.95);
    stroke-width: 1.2;
  }

  :global(.pluton-root .pluton-geometry path.demo-sprocket-bolts) {
    stroke: rgba(127, 29, 29, 0.88);
    stroke-width: 0.95;
  }

  :global(.pluton-root .pluton-geometry path.demo-sprocket-bore) {
    --hatch-fill-override: none;
    stroke: rgba(30, 41, 59, 0.9);
    stroke-width: 1.1;
  }

  :global(.pluton-root .pluton-geometry path.demo-sprocket-construction) {
    --hatch-fill-override: none;
    stroke: rgba(100, 116, 139, 0.65);
    stroke-dasharray: 0.32em;
    stroke-width: 0.92;
  }

  :global(.pluton-root .pluton-dimensions .pluton-dim-stroke.sprocket-dim) {
    stroke: rgba(78, 94, 96, 0.9);
  }

  :global(.pluton-root .pluton-dimensions .pluton-dim-filled.sprocket-dim) {
    fill: rgba(78, 94, 96, 0.9);
  }

  :global(.pluton-root .pluton-dimensions text.sprocket-dim) {
    fill: rgba(78, 94, 96, 0.95);
    font-size: 10px;
    letter-spacing: 0.03em;
  }

  :global(.pluton-root .pluton-dimensions text.sprocket-note) {
    fill: rgba(47, 83, 88, 0.9);
    font-size: 10px;
    letter-spacing: 0.07em;
    font-weight: 500;
  }
</style>
