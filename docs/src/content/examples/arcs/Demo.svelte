<script>
  import { onMount, onDestroy } from "svelte";
  import { Pluton2D } from "pluton-2d";
  import ExampleShell from "../../../components/ExampleShell.svelte";

  let svgEl;
  let scene;
  let radius = $state(120);
  let innerRadius = $state(80);

  onMount(() => {
    scene = new Pluton2D(svgEl, { radius, innerRadius });
    const geom = scene.geometry.group();

    scene.draw((p) => {
      const r = p.radius;
      const ir = p.innerRadius;

      const donut = geom.path();
      donut
        .moveToAbs(-r, 0)
        .arcTo(r, r, r, true)
        .arcTo(r, -r, r, true)
        .arcTo(-r, -r, r, true)
        .arcTo(-r, r, r, true)
        .close();

      donut
        .moveToAbs(0, ir)
        .arcToAbs(-ir, 0, ir, false)
        .arcToAbs(0, -ir, ir, false)
        .arcToAbs(ir, 0, ir, false)
        .arcToAbs(0, ir, ir, false)
        .close();
    });
  });

  $effect(() => {
    if (!scene) return;
    Object.assign(scene.params, { radius, innerRadius });
  });

  onDestroy(() => { scene?.dispose(); });
</script>

<ExampleShell {scene} bind:svgEl>
  <div class="demo-control">
    <label>Outer</label>
    <input type="range" bind:value={radius} min={40} max={200} step={1} />
    <span class="value">{radius}</span>
  </div>
  <div class="demo-control">
    <label>Inner</label>
    <input type="range" bind:value={innerRadius} min={20} max={180} step={1} />
    <span class="value">{innerRadius}</span>
  </div>
</ExampleShell>
