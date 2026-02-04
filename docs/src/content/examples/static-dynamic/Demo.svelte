<script>
  import { onMount, onDestroy } from "svelte";
  import { Pluton2D } from "pluton-2d";
  import ExampleShell from "../../../components/ExampleShell.svelte";

  let svgEl;
  let scene;
  let size = $state(140);

  onMount(() => {
    scene = new Pluton2D(svgEl, { size });

    const staticGroup = scene.geometry.group();
    staticGroup.setDrawUsage("static");

    const dynamicGroup = scene.geometry.group();

    scene.draw((p) => {
      const half = p.size / 2;
      const offset = 90;

      staticGroup.path({ className: "demo-static" })
        .moveToAbs(-offset - half, -half)
        .lineTo(p.size, 0).lineTo(0, p.size).lineTo(-p.size, 0)
        .close();

      dynamicGroup.path({ className: "demo-dynamic" })
        .moveToAbs(offset - half, -half)
        .lineTo(p.size, 0).lineTo(0, p.size).lineTo(-p.size, 0)
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
    <input type="range" bind:value={size} min={40} max={200} step={1} />
    <span class="value">{size}</span>
  </div>
  <div class="legend">
    <span class="legend-item"><span class="legend-swatch static"></span><span class="legend-label static">Static</span></span>
    <span class="legend-item"><span class="legend-swatch dynamic"></span><span class="legend-label dynamic">Dynamic</span></span>
  </div>
</ExampleShell>
