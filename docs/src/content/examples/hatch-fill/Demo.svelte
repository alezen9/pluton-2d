<script>
  import { onMount, onDestroy } from "svelte";
  import { Pluton2D } from "pluton-2d";
  import ExampleShell from "../../../components/ExampleShell.svelte";

  let svgEl;
  let scene;
  let size = $state(130);

  onMount(() => {
    scene = new Pluton2D(svgEl, { size });
    scene.enableHatchFill(true);
    const geom = scene.geometry.group();

    scene.draw((p) => {
      const s = p.size, half = s / 2, gap = s * 1.4;

      geom.path()
        .moveToAbs(-gap / 2 - half, -half)
        .lineTo(s, 0).lineTo(0, s).lineTo(-s, 0)
        .close();

      geom.path()
        .moveToAbs(gap / 2, half)
        .lineToAbs(gap / 2 + half, -half)
        .lineToAbs(gap / 2 - half, -half)
        .close();
    });
  });

  $effect(() => {
    if (!scene) return;
    scene.params.size = size;
  });

  onDestroy(() => { scene?.dispose(); });
</script>

<ExampleShell {scene} bind:svgEl initialHatchOn={true}>
  <div class="demo-control">
    <label>Size</label>
    <input type="range" bind:value={size} min={40} max={180} step={1} />
    <span class="value">{size}</span>
  </div>
</ExampleShell>
