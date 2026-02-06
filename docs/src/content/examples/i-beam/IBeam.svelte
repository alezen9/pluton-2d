<script lang="ts">
  import { Pluton2D } from "pluton-2d";
  import ExampleLayout from "@examples/components/ExampleLayout.svelte";

  type Params = { width: number; height: number; flangeThickness: number; webThickness: number; filletRadius: number };

  let width = $state(200);
  let height = $state(300);
  let flangeThickness = $state(40);
  let webThickness = $state(20);
  let filletRadius = $state(12);
  let scene: Pluton2D<Params> | null = null;

  const onSetup = (s: Pluton2D<Params>) => {
    scene = s;
    const geom = scene.geometry.group();
    const dims = scene.dimensions.group();
    const amberFillId = scene.addHatchFill("#d97706");

    scene.draw((p) => {
      const fw = p.width;
      const ft = p.flangeThickness;
      const wt = p.webThickness;
      const h = p.height;
      const r = p.filletRadius;

      const path = geom.path({ className: "demo-amber", fill: amberFillId });
      path
        .moveToAbs(0, 0)
        .lineTo(fw / 2, 0)
        .lineTo(0, ft)
        .lineTo(-fw / 2 + wt / 2 + r, 0)
        .arcTo(-r, r, r, true)
        .lineTo(0, h - 2 * ft - 2 * r)
        .arcTo(r, r, r, true)
        .lineTo(fw / 2 - wt / 2 - r, 0)
        .lineTo(0, ft)
        .lineTo(-fw, 0)
        .lineTo(0, -ft)
        .lineTo(fw / 2 - wt / 2 - r, 0)
        .arcTo(r, -r, r, true)
        .lineTo(0, -h + 2 * ft + 2 * r)
        .arcTo(-r, -r, r, true)
        .lineTo(-fw / 2 + wt / 2 + r, 0)
        .lineTo(0, -ft)
        .lineTo(fw / 2, 0)
        .close();

      geom.translate(0, -h / 2);

      const dim = dims.dimension();

      dim
        .moveToAbs(-wt / 2, (h / 2 - ft) / 2)
        .tick(0)
        .lineTo(-30, 0)
        .moveToAbs(wt / 2, (h / 2 - ft) / 2)
        .tick(Math.PI)
        .lineTo(50, 0)
        .textAt(10, 0, `${wt}mm`, "start");

      dim
        .moveToAbs(-fw / 2, -h / 2 - 20)
        .tick(0)
        .lineTo(fw, 0)
        .tick(0)
        .textAt(-fw / 2, -16, `${fw}mm`, "middle");

      dim
        .moveToAbs(fw / 2 + 40, -h / 2)
        .tick(-Math.PI / 2)
        .lineTo(0, h)
        .tick(Math.PI / 2)
        .textAt(18, -h / 2, `${h}mm`, "start");

      if (r > 0) {
        dim
          .moveToAbs(-wt / 2 - r, ft + r)
          .lineTo(-20, 20)
          .textAt(-5, 5, `R${r}mm`, "start");
      }
    });
  };

  $effect(() => {
    if (!scene) return;
    Object.assign(scene.params, { width, height, flangeThickness, webThickness, filletRadius });
  });
</script>

<ExampleLayout initialParams={{ width, height, flangeThickness, webThickness, filletRadius }} {onSetup}>
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
        <input type="range" bind:value={height} min={100} max={450} step={1} />
      </label>
      <span class="value">{height}</span>
    </div>
    <div class="demo-control">
      <label>
        Flange
        <input type="range" bind:value={flangeThickness} min={10} max={80} step={1} />
      </label>
      <span class="value">{flangeThickness}</span>
    </div>
    <div class="demo-control">
      <label>
        Web
        <input type="range" bind:value={webThickness} min={5} max={50} step={1} />
      </label>
      <span class="value">{webThickness}</span>
    </div>
    <div class="demo-control">
      <label>
        Fillet
        <input type="range" bind:value={filletRadius} min={0} max={30} step={1} />
      </label>
      <span class="value">{filletRadius}</span>
    </div>
  {/snippet}
</ExampleLayout>
