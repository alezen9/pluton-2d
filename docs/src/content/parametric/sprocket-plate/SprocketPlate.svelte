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
  };

  let outerRadius = $state(188);
  let toothCount = $state(22);
  let toothDepth = $state(20);
  let boreRadius = $state(36);
  let boltCircleRadius = $state(84);
  let boltCount = $state(6);

  let scene: Pluton2D<SceneParams> | null = null;

  const boltHoleDiameter = 14;
  const boltHoleRadius = boltHoleDiameter / 2;

  const onSetup = (sceneInstance: Pluton2D<SceneParams>) => {
    scene = sceneInstance;
    const geometry = sceneInstance.geometry.group();
    const dimensions = sceneInstance.dimensions.group();

    const DARK_TEAL = "#0f766e";
    const plateFillId = sceneInstance.addHatchFill(DARK_TEAL, 0.2);
    const plateStroke = DARK_TEAL;

    const CRIMSON = "#7f1d1d";
    const boltFillId = sceneInstance.addHatchFill(CRIMSON, 0.15);
    const boldStroke = CRIMSON;

    scene.draw((p) => {
      const {
        outerRadius,
        boltCircleRadius,
        boltCount,
        boreRadius,
        toothCount,
        toothDepth,
      } = p;
      const rootRadius = outerRadius - toothDepth;

      // plate
      const plate = geometry.path({
        stroke: plateStroke,
        fill: plateFillId,
      });

      const step = Math.PI / toothCount; // half-tooth
      const start = -Math.PI / 2;

      // first point
      plate.moveToAbs(
        Math.cos(start) * outerRadius,
        Math.sin(start) * outerRadius,
      );

      for (let i = 1; i < toothCount * 2; i++) {
        const a = start + i * step;
        const r = i % 2 === 0 ? outerRadius : rootRadius;
        plate.lineToAbs(Math.cos(a) * r, Math.sin(a) * r);
      }

      plate.close();

      // bolts
      const bolts = geometry.path({
        stroke: boldStroke,
        fill: boltFillId,
      });

      for (let i = 0; i < boltCount; i++) {
        const a = (i / boltCount) * Math.PI * 2;
        const cx = Math.cos(a) * boltCircleRadius;
        const cy = Math.sin(a) * boltCircleRadius;

        bolts
          .moveToAbs(cx + boltHoleRadius, cy)
          .arcToAbs(cx - boltHoleRadius, cy, boltHoleRadius, false, true)
          .arcToAbs(cx + boltHoleRadius, cy, boltHoleRadius, false, true)
          .close();
      }

      // bore stroke
      geometry
        .path({ className: "demo-sprocket-bore" })
        .moveToAbs(p.boreRadius, 0)
        .arcToAbs(-p.boreRadius, 0, p.boreRadius, false, true)
        .arcToAbs(p.boreRadius, 0, p.boreRadius, false, true)
        .close();

      // dashed construction helpers
      const construction = geometry.path({
        className: "demo-sprocket-construction",
      });

      construction
        .moveToAbs(outerRadius, 0)
        .arcToAbs(-outerRadius, 0, outerRadius, false, true)
        .arcToAbs(outerRadius, 0, outerRadius, false, true)
        .close();

      construction
        .moveToAbs(rootRadius, 0)
        .arcToAbs(-rootRadius, 0, rootRadius, false, true)
        .arcToAbs(rootRadius, 0, rootRadius, false, true)
        .close();

      construction
        .moveToAbs(boltCircleRadius, 0)
        .arcToAbs(-boltCircleRadius, 0, boltCircleRadius, false, true)
        .arcToAbs(boltCircleRadius, 0, boltCircleRadius, false, true)
        .close();

      // --- dimensions + notes ---
      const dim = dimensions.dimension({ className: "sprocket-dim" });

      dim
        // OD
        .moveToAbs(-outerRadius, outerRadius + 34)
        .tick(0)
        .lineTo(outerRadius * 2, 0)
        .tick(0)
        .textAt(
          -outerRadius,
          -12,
          `${Math.round(outerRadius * 2)} mm`,
          "middle",
          "sprocket-dim",
        )

        // PCD
        .moveToAbs(-outerRadius - 44, -boltCircleRadius)
        .tick(Math.PI / 2)
        .lineTo(0, boltCircleRadius * 2)
        .tick(-Math.PI / 2)
        .textAt(
          -12,
          -boltCircleRadius,
          `${Math.round(boltCircleRadius * 2)} mm PCD`,
          "end",
          "sprocket-dim",
        )

        // BORE
        .moveToAbs(-outerRadius - 82, -p.boreRadius)
        .tick(Math.PI / 2)
        .lineTo(0, p.boreRadius * 2)
        .tick(-Math.PI / 2)
        .textAt(
          -12,
          -p.boreRadius,
          `${Math.round(p.boreRadius * 2)} mm BORE`,
          "end",
          "sprocket-dim",
        );

      dimensions
        .dimension({ className: "sprocket-note" })
        .moveToAbs(0, 0)
        .textAtAbs(
          0,
          -outerRadius - 38,
          `${toothCount} TOOTH PLATE`,
          "middle",
          "sprocket-note",
        )
        .textAtAbs(
          0,
          -outerRadius - 54,
          `${boltCount} X Ø${boltHoleDiameter} BOLTS`,
          "middle",
          "sprocket-note",
        );
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
  }}
  {onSetup}
>
  {#snippet params()}
    <div class="demo-control">
      <label>
        Outer R
        <input
          type="range"
          bind:value={outerRadius}
          min={120}
          max={260}
          step={2}
        />
      </label>
      <span class="value">{outerRadius}</span>
    </div>
    <div class="demo-control">
      <label>
        Teeth
        <input
          type="range"
          bind:value={toothCount}
          min={12}
          max={36}
          step={1}
        />
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
        <input
          type="range"
          bind:value={boreRadius}
          min={18}
          max={74}
          step={1}
        />
      </label>
      <span class="value">{boreRadius}</span>
    </div>
    <div class="demo-control">
      <label>
        Bolt Circle R
        <input
          type="range"
          bind:value={boltCircleRadius}
          min={42}
          max={130}
          step={1}
        />
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
    fill: none;
    stroke: rgba(30, 41, 59, 0.9);
    stroke-width: 1.1;
  }

  :global(.pluton-root .pluton-geometry path.demo-sprocket-construction) {
    fill: none;
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
