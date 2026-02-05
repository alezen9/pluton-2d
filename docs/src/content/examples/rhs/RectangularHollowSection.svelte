<script lang="ts">
  import { Pluton2D } from "pluton-2d";
  import ExampleLayout from "@components/ExampleLayout.svelte";

  type Params = { width: number; height: number; thickness: number; outerRadius: number; innerRadius: number };

  let width = $state(200);
  let height = $state(250);
  let thickness = $state(15);
  let outerRadius = $state(10);
  let innerRadius = $state(10);
  let scene: Pluton2D<Params> | null = null;

  const onSetup = (s: Pluton2D<Params>) => {
    scene = s;
    const geom = scene.geometry.group();
    const dims = scene.dimensions.group();
    const blueFillId = scene.addHatchFill("#2563eb");

    scene.draw((p) => {
      const { width: w, height: h, thickness: t, outerRadius: ro, innerRadius: ri } = p;
      const iw = w - 2 * t;
      const ih = h - 2 * t;

      const path = geom.path({ className: "demo-blue", fill: blueFillId });

      path
        .moveToAbs(-w / 2 + ro, -h / 2)
        .lineTo(w - 2 * ro, 0)
        .arcTo(ro, ro, ro, false)
        .lineTo(0, h - 2 * ro)
        .arcTo(-ro, ro, ro, false)
        .lineTo(-w + 2 * ro, 0)
        .arcTo(-ro, -ro, ro, false)
        .lineTo(0, -h + 2 * ro)
        .arcTo(ro, -ro, ro, false)
        .close();

      path
        .moveToAbs(-iw / 2 + ri, -ih / 2)
        .lineTo(iw - 2 * ri, 0)
        .arcTo(ri, ri, ri, false)
        .lineTo(0, ih - 2 * ri)
        .arcTo(-ri, ri, ri, false)
        .lineTo(-iw + 2 * ri, 0)
        .arcTo(-ri, -ri, ri, false)
        .lineTo(0, -ih + 2 * ri)
        .arcTo(ri, -ri, ri, false)
        .close();

      const dim = dims.dimension();

      dim
        .moveToAbs(-w / 2, -h / 2 - 20)
        .tick(0)
        .lineTo(w, 0)
        .tick(0)
        .textAt(-w / 2, -16, `${w}mm`, "middle");

      dim
        .moveToAbs(w / 2 + 40, -h / 2)
        .tick(-Math.PI / 2)
        .lineTo(0, h)
        .tick(Math.PI / 2)
        .textAt(5, -h / 2, `${h}mm`, "start");

      dim
        .moveToAbs(-w / 2, 20)
        .tick(0)
        .lineTo(-30, 0)
        .moveToAbs(-w / 2 + t, 20)
        .tick(Math.PI)
        .lineTo(50, 0)
        .textAt(5, 0, `${t}mm`, "start");

      if (ro > 0) {
        dim
          .moveToAbs(w / 2 - ro, -h / 2)
          .lineTo(15, -15)
          .textAt(3, -3, `R${ro}mm`, "start");
      }

      if (ri > 0) {
        dim
          .moveToAbs(iw / 2 - ri, -ih / 2)
          .lineTo(12, -12)
          .textAt(3, -3, `r${ri}mm`, "start");
      }
    });
  };

  $effect(() => {
    if (!scene) return;
    Object.assign(scene.params, { width, height, thickness, outerRadius, innerRadius });
  });
</script>

<ExampleLayout initialParams={{ width, height, thickness, outerRadius, innerRadius }} {onSetup}>
  {#snippet params()}
    <div class="demo-control">
      <label>
        Width
        <input type="range" bind:value={width} min={50} max={350} step={1} />
      </label>
      <span class="value">{width}</span>
    </div>
    <div class="demo-control">
      <label>
        Height
        <input type="range" bind:value={height} min={50} max={350} step={1} />
      </label>
      <span class="value">{height}</span>
    </div>
    <div class="demo-control">
      <label>
        Wall
        <input type="range" bind:value={thickness} min={3} max={50} step={1} />
      </label>
      <span class="value">{thickness}</span>
    </div>
    <div class="demo-control">
      <label>
        Outer R
        <input type="range" bind:value={outerRadius} min={0} max={30} step={1} />
      </label>
      <span class="value">{outerRadius}</span>
    </div>
    <div class="demo-control">
      <label>
        Inner R
        <input type="range" bind:value={innerRadius} min={0} max={30} step={1} />
      </label>
      <span class="value">{innerRadius}</span>
    </div>
  {/snippet}
</ExampleLayout>
