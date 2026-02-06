<script lang="ts">
  import { Pluton2D } from "pluton-2d";
  import ExampleLayout from "@examples/components/ExampleLayout.svelte";

  type Params = { radius: number; thickness: number };
  const CIRCLE_HANDLE_FACTOR = 0.5522847498;

  let radius = $state(110);
  let thickness = $state(12);
  let scene: Pluton2D<Params> | null = null;

  const onSetup = (s: Pluton2D<Params>) => {
    scene = s;
    const geom = scene.geometry.group();
    const dims = scene.dimensions.group();
    const tealFillId = scene.addHatchFill("#0f766e");

    scene.draw((p) => {
      const { radius: r, thickness: t } = p;
      const ir = r - t;

      const path = geom.path({ className: "demo-teal", fill: tealFillId });
      const appendCircle = (radiusValue: number) => {
        const handleOffset = radiusValue * CIRCLE_HANDLE_FACTOR;
        path
          .moveToAbs(-radiusValue, 0)
          .cubicToAbs(-radiusValue, handleOffset, -handleOffset, radiusValue, 0, radiusValue)
          .smoothCubicToAbs(radiusValue, handleOffset, radiusValue, 0)
          .smoothCubicToAbs(handleOffset, -radiusValue, 0, -radiusValue)
          .smoothCubicToAbs(-radiusValue, -handleOffset, -radiusValue, 0);
      };

      appendCircle(r);
      appendCircle(ir);

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
  };

  $effect(() => {
    if (!scene) return;
    Object.assign(scene.params, { radius, thickness });
  });
</script>

<ExampleLayout initialParams={{ radius, thickness }} {onSetup}>
  {#snippet params()}
    <div class="demo-control">
      <label>
        Radius
        <input type="range" bind:value={radius} min={50} max={200} step={1} />
      </label>
      <span class="value">{radius}</span>
    </div>
    <div class="demo-control">
      <label>
        Wall
        <input type="range" bind:value={thickness} min={3} max={50} step={1} />
      </label>
      <span class="value">{thickness}</span>
    </div>
  {/snippet}
</ExampleLayout>
