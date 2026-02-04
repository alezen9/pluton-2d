<script>
  import { onMount, onDestroy } from "svelte";
  import { Pluton2D } from "pluton-2d";
  import ExampleShell from "../../../components/ExampleShell.svelte";

  let svgEl;
  let scene;
  let size = $state(150);

  onMount(() => {
    scene = new Pluton2D(svgEl, { size });
    const geom = scene.geometry.group();

    scene.draw((p) => {
      const s = p.size, half = s / 2, gap = s * 1.2;

      geom.path()
        .moveToAbs(-gap, half)
        .lineToAbs(-gap + half, -half)
        .lineToAbs(-gap - half, -half)
        .close();

      geom.path()
        .moveToAbs(-half, -half)
        .lineTo(s, 0).lineTo(0, s).lineTo(-s, 0)
        .close();

      geom.path()
        .moveToAbs(gap, half)
        .lineToAbs(gap + half, 0)
        .lineToAbs(gap, -half)
        .lineToAbs(gap - half, 0)
        .close();
    });
  });

  $effect(() => {
    if (!scene) return;
    scene.params.size = size;
  });

  onDestroy(() => { scene?.dispose(); });
</script>

<ExampleShell {scene} bind:svgEl>
  <div class="demo-control">
    <label>Size</label>
    <input type="range" bind:value={size} min={60} max={200} step={1} />
    <span class="value">{size}</span>
  </div>
</ExampleShell>
