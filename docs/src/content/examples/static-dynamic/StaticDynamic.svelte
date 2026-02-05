<script lang="ts">
  import { Pluton2D } from "pluton-2d";
  import ExampleLayout from "@components/ExampleLayout.svelte";

  type Params = { size: number };

  let size = $state(140);
  let scene: Pluton2D<Params> | null = null;

  const onSetup = (s: Pluton2D<Params>) => {
    scene = s;

    const staticGroup = scene.geometry.group();
    staticGroup.setDrawUsage("static");

    const dynamicGroup = scene.geometry.group();

    const orangeFillId = scene.addHatchFill("#f97316");
    const tealFillId = scene.addHatchFill("#0f766e");

    scene.draw((p) => {
      const half = p.size / 2;
      const offset = 90;

      staticGroup.path({ className: "demo-static", fill: orangeFillId })
        .moveToAbs(-offset - half, -half)
        .lineTo(p.size, 0).lineTo(0, p.size).lineTo(-p.size, 0)
        .close();

      dynamicGroup.path({ className: "demo-dynamic", fill: tealFillId })
        .moveToAbs(offset - half, -half)
        .lineTo(p.size, 0).lineTo(0, p.size).lineTo(-p.size, 0)
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
      <span class="legend-item"><span class="legend-swatch static"></span><span class="legend-label static">Static</span></span>
      <span class="legend-item"><span class="legend-swatch dynamic"></span><span class="legend-label dynamic">Dynamic</span></span>
    </div>
  {/snippet}
</ExampleLayout>
