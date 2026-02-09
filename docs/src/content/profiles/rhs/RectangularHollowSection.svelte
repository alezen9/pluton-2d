<script lang="ts">
  import { Pluton2D } from "pluton-2d";
  import ExampleLayout from "@examples/components/ExampleLayout.svelte";

  type Params = {
    width: number;
    height: number;
    thickness: number;
    outerRadius: number;
    innerRadius: number;
  };

  let width = $state(200);
  let height = $state(250);
  let thickness = $state(15);
  let outerRadius = $state(10);
  let innerRadius = $state(10);
  let scene: Pluton2D<Params> | null = null;

  const onSetup = (sceneInstance: Pluton2D<Params>) => {
    scene = sceneInstance;
    const geometryGroup = scene.geometry.group();
    const dimensionsGroup = scene.dimensions.group();

    const BLUE = "#2563eb";
    const blueFillId = scene.addHatchFill(BLUE);
    const blueStroke = BLUE;

    const dimensionOverflow = 15;
    const dimensionOffset = 30;

    scene.draw((p) => {
      const {
        width: outerWidth,
        height: outerHeight,
        thickness,
        innerRadius,
        outerRadius,
      } = p;

      const innerWidth = outerWidth - 2 * thickness;
      const innerHeight = outerHeight - 2 * thickness;

      const path = geometryGroup.path({ stroke: blueStroke, fill: blueFillId });

      path
        // outer rectangle
        .moveToAbs(-outerWidth / 2, 0)
        .lineTo(0, outerHeight / 2 - outerRadius)
        .arcTo(outerRadius, outerRadius, outerRadius, true)
        .lineTo(outerWidth - outerRadius * 2, 0)
        .arcTo(outerRadius, -outerRadius, outerRadius, true)
        .lineTo(0, -(outerHeight - outerRadius * 2))
        .arcTo(-outerRadius, -outerRadius, outerRadius, true)
        .lineTo(-(outerWidth - outerRadius * 2), 0)
        .arcTo(-outerRadius, outerRadius, outerRadius, true)
        .lineTo(0, outerHeight / 2 - outerRadius)
        // inner rectangle
        .moveToAbs(-innerWidth / 2, 0)
        .lineTo(0, innerHeight / 2 - innerRadius)
        .arcTo(innerRadius, innerRadius, innerRadius, true)
        .lineTo(innerWidth - innerRadius * 2, 0)
        .arcTo(innerRadius, -innerRadius, innerRadius, true)
        .lineTo(0, -(innerHeight - innerRadius * 2))
        .arcTo(-innerRadius, -innerRadius, innerRadius, true)
        .lineTo(-(innerWidth - innerRadius * 2), 0)
        .arcTo(-innerRadius, innerRadius, innerRadius, true)
        .lineTo(0, innerHeight / 2 - innerRadius)
        .close();

      const dimensions = dimensionsGroup.dimension();

      // width
      dimensions
        .moveToAbs(-outerWidth / 2, -outerHeight / 2 - dimensionOffset)
        .tick(0)
        .lineTo(outerWidth, 0)
        .tick(0)
        .textAt(-outerWidth / 2, -15, `${outerWidth}mm`, "middle");

      // height
      dimensions
        .moveToAbs(outerWidth / 2 + dimensionOffset, -outerHeight / 2)
        .tick(-Math.PI / 2)
        .lineTo(0, outerHeight)
        .tick(Math.PI / 2)
        .textAt(10, -outerHeight / 2, `${outerHeight}mm`, "start");

      // thickness
      dimensions
        .moveToAbs(-outerWidth / 2 - dimensionOverflow, 15)
        .lineTo(dimensionOverflow, 0)
        .tick(0)
        .moveTo(thickness, 0)
        .tick(0)
        .lineTo(dimensionOverflow * 2, 0)
        .textAt(5, 0, `${thickness}mm`, "start");
    });
  };

  $effect(() => {
    if (!scene) return;
    Object.assign(scene.params, {
      width,
      height,
      thickness,
      outerRadius,
      innerRadius,
    });
  });
</script>

<ExampleLayout
  initialParams={{ width, height, thickness, outerRadius, innerRadius }}
  {onSetup}
>
  {#snippet controls()}
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
        Wall thickness
        <input type="range" bind:value={thickness} min={3} max={50} step={1} />
      </label>
      <span class="value">{thickness}</span>
    </div>
    <div class="demo-control">
      <label>
        Outer radius
        <input
          type="range"
          bind:value={outerRadius}
          min={0}
          max={30}
          step={1}
        />
      </label>
      <span class="value">{outerRadius}</span>
    </div>
    <div class="demo-control">
      <label>
        Inner radius
        <input
          type="range"
          bind:value={innerRadius}
          min={0}
          max={30}
          step={1}
        />
      </label>
      <span class="value">{innerRadius}</span>
    </div>
  {/snippet}
</ExampleLayout>
