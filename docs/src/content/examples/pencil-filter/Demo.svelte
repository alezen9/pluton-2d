<script>
  import { onMount, onDestroy } from "svelte";
  import { Pluton2D } from "pluton-2d";
  import ExampleShell from "../../../components/ExampleShell.svelte";

  let svgEl;
  let scene;
  let size = $state(120);

  onMount(() => {
    scene = new Pluton2D(svgEl, { size });
    scene.enableFilter(true);
    const geom = scene.geometry.group();

    scene.draw((p) => {
      const star = geom.path();
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
  });

  $effect(() => {
    if (!scene) return;
    scene.params.size = size;
  });

  onDestroy(() => { scene?.dispose(); });
</script>

<ExampleShell {scene} bind:svgEl initialFilterOn={true}>
  <div class="demo-control">
    <label>Size</label>
    <input type="range" bind:value={size} min={40} max={160} step={1} />
    <span class="value">{size}</span>
  </div>
</ExampleShell>
