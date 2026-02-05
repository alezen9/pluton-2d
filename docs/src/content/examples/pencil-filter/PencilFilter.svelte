<script lang="ts">
  import { Pluton2D } from "pluton-2d";
  import ExampleLayout from "@components/ExampleLayout.svelte";

  type Params = { size: number };

  let size = $state(120);
  let scene: Pluton2D<Params> | null = null;

  const onSetup = (s: Pluton2D<Params>) => {
    scene = s;
    scene.enableFilter(true);
    const geom = scene.geometry.group();
    const roseFill = scene.addHatchFill("#e11d48");

    scene.draw((p) => {
      const star = geom.path({ className: "demo-rose", fill: roseFill });
      const points = 5;
      const outerR = p.size;
      const innerR = p.size * 0.4;

      for (let i = 0; i < points * 2; i++) {
        const angle = (i * Math.PI) / points - Math.PI / 2;
        const r = i % 2 === 0 ? outerR : innerR;
        const x = r * Math.cos(angle);
        const y = r * Math.sin(angle);
        if (i === 0) star.moveToAbs(x, y);
        else star.lineToAbs(x, y);
      }
      star.close();
    });
  };

  $effect(() => {
    if (!scene) return;
    scene.params.size = size;
  });
</script>

<ExampleLayout initialParams={{ size }} {onSetup} initialFilterOn={true}>
  {#snippet params()}
    <div class="demo-control">
      <label>
        Size
        <input type="range" bind:value={size} min={40} max={160} step={1} />
      </label>
      <span class="value">{size}</span>
    </div>
  {/snippet}
</ExampleLayout>
