<script lang="ts">
  import { Pluton2D } from "pluton-2d";
  import ExampleLayout from "@examples/components/ExampleLayout.svelte";

  type Params = { size: number };

  let size = $state(150);
  let scene: Pluton2D<Params> | null = null;

  const onSetup = (s: Pluton2D<Params>) => {
    scene = s;
    const geom = scene.geometry.group();

    const blueFillId = scene.addHatchFill("#2563eb");
    const tealFillId = scene.addHatchFill("#0f766e");
    const orangeFillId = scene.addHatchFill("#ea580c");

    scene.draw((p) => {
      const sz = p.size, half = sz / 2, gap = sz * 1.2;

      geom.path({ className: "demo-blue", fill: blueFillId })
        .moveToAbs(-gap, half)
        .lineToAbs(-gap + half, -half)
        .lineToAbs(-gap - half, -half)
        .close();

      geom.path({ className: "demo-teal", fill: tealFillId })
        .moveToAbs(-half, -half)
        .lineTo(sz, 0).lineTo(0, sz).lineTo(-sz, 0)
        .close();

      geom.path({ className: "demo-orange", fill: orangeFillId })
        .moveToAbs(gap, half)
        .lineToAbs(gap + half, 0)
        .lineToAbs(gap, -half)
        .lineToAbs(gap - half, 0)
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
        <input type="range" bind:value={size} min={60} max={200} step={1} />
      </label>
      <span class="value">{size}</span>
    </div>
  {/snippet}
</ExampleLayout>
