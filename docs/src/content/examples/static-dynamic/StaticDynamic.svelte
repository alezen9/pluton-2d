<script lang="ts">
  import { Pluton2D } from "pluton-2d";
  import ExampleLayout from "@examples/components/ExampleLayout.svelte";

  type Params = { size: number };
  const SHAPE_HORIZONTAL_OFFSET = 100;

  let size = $state(140);
  let scene: Pluton2D<Params> | null = null;

  const onSetup = (sceneInstance: Pluton2D<Params>) => {
    scene = sceneInstance;
    const ORANGE = "#f97316";
    const TEAL = "#0f766e";

    const staticGroup = scene.geometry.group();
    staticGroup.setDrawUsage("static");

    const dynamicGroup = scene.geometry.group();

    const orangeFillId = scene.addHatchFill(ORANGE);
    const orangeStroke = ORANGE;
    const tealFillId = scene.addHatchFill(TEAL);
    const tealStroke = TEAL;

    scene.draw((p) => {
      const { size } = p;

      staticGroup
        .path({ stroke: orangeStroke, fill: orangeFillId })
        .moveToAbs(-size / 2 - SHAPE_HORIZONTAL_OFFSET, -size / 2)
        .lineTo(size, 0)
        .lineTo(0, size)
        .lineTo(-size, 0)
        .close();

      dynamicGroup
        .path({ stroke: tealStroke, fill: tealFillId })
        .moveToAbs(-size / 2 + SHAPE_HORIZONTAL_OFFSET, -size / 2)
        .lineTo(size, 0)
        .lineTo(0, size)
        .lineTo(-size, 0)
        .close();
    });
  };

  $effect(() => {
    if (!scene) return;
    scene.params.size = size;
  });
</script>

<ExampleLayout initialParams={{ size }} {onSetup}>
  {#snippet params()}
    <div class="demo-control">
      <label>
        Size
        <input type="range" bind:value={size} min={40} max={200} step={1} />
      </label>
      <span class="value">{size}</span>
    </div>
    <div class="legend">
      <span class="legend-item">
        <span class="legend-swatch static"></span>
        <span class="legend-label static">Static</span>
      </span>
      <span class="legend-item">
        <span class="legend-swatch dynamic"></span>
        <span class="legend-label dynamic">Dynamic</span>
      </span>
    </div>
  {/snippet}
</ExampleLayout>
