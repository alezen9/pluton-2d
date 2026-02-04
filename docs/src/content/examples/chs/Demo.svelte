<script>
  import { onMount, onDestroy } from "svelte";
  import { Pluton2D } from "pluton-2d";
  import ExampleShell from "../../../components/ExampleShell.svelte";

  let svgEl;
  let scene;
  let radius = $state(110);
  let thickness = $state(12);

  onMount(() => {
    scene = new Pluton2D(svgEl, { radius, thickness });
    const geom = scene.geometry.group();
    const dims = scene.dimensions.group();

    scene.draw((p) => {
      const { radius: r, thickness: t } = p;
      const ir = r - t;

      const path = geom.path();

      path
        .moveToAbs(-r, 0)
        .arcTo(r, r, r, true)
        .arcTo(r, -r, r, true)
        .arcTo(-r, -r, r, true)
        .arcTo(-r, r, r, true);

      path
        .moveToAbs(-ir, 0)
        .arcTo(ir, ir, ir, true)
        .arcTo(ir, -ir, ir, true)
        .arcTo(-ir, -ir, ir, true)
        .arcTo(-ir, ir, ir, true);

      const dim = dims.dimension();
      const angle = Math.PI / 4;
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle);

      dim.moveToAbs(0, 0).centerMark(20);

      dim
        .moveToAbs(0, 0)
        .lineToAbs(x, y)
        .arrowFilled(angle)
        .textAtAbs(x / 2 - 10, y / 2, `R${r}mm`, "end");

      dim
        .moveToAbs(-r - 25, 0)
        .tick(-Math.PI / 2)
        .lineTo(0, -t)
        .tick(Math.PI / 2)
        .textAt(-10, t / 2, `${t}mm`, "end");
    });
  });

  $effect(() => {
    if (!scene) return;
    Object.assign(scene.params, { radius, thickness });
  });

  onDestroy(() => { scene?.dispose(); });
</script>

<ExampleShell {scene} bind:svgEl>
  <div class="demo-control">
    <label>Radius</label>
    <input type="range" bind:value={radius} min={50} max={200} step={1} />
    <span class="value">{radius}</span>
  </div>
  <div class="demo-control">
    <label>Wall</label>
    <input type="range" bind:value={thickness} min={3} max={50} step={1} />
    <span class="value">{thickness}</span>
  </div>
</ExampleShell>
