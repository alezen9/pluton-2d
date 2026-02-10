<script lang="ts">
  import { Pluton2D } from "pluton-2d";
  import ExampleLayout from "@views/examples/components/ExampleLayout.svelte";

  type Params = {
    width: number;
    height: number;
    flangeThickness: number;
    webThickness: number;
    filletRadius: number;
  };

  let width = $state(200);
  let height = $state(300);
  let flangeThickness = $state(40);
  let webThickness = $state(20);
  let filletRadius = $state(12);
  let scene: Pluton2D<Params> | null = null;

  const onSetup = (sceneInstance: Pluton2D<Params>) => {
    scene = sceneInstance;
    const geometryGroup = scene.geometry.group();
    const dimensionsGroup = scene.dimensions.group();

    const AMBER = "#d97706";
    const amberFillId = scene.addHatchFill(AMBER);
    const amberStroke = AMBER;

    const dimensionOverflow = 15;
    const dimensionOffset = 30;

    scene.draw((p) => {
      const { width, height, flangeThickness, webThickness, filletRadius } = p;

      // i-beam
      const path = geometryGroup.path({
        stroke: amberStroke,
        fill: amberFillId,
      });
      path
        .moveToAbs(0, 0)
        .lineTo(width / 2, 0)
        .lineTo(0, flangeThickness)
        .lineTo(-width / 2 + webThickness / 2 + filletRadius, 0)
        .arcTo(-filletRadius, filletRadius, filletRadius, true)
        .lineTo(0, height - 2 * flangeThickness - 2 * filletRadius)
        .arcTo(filletRadius, filletRadius, filletRadius, true)
        .lineTo(width / 2 - webThickness / 2 - filletRadius, 0)
        .lineTo(0, flangeThickness)
        .lineTo(-width, 0)
        .lineTo(0, -flangeThickness)
        .lineTo(width / 2 - webThickness / 2 - filletRadius, 0)
        .arcTo(filletRadius, -filletRadius, filletRadius, true)
        .lineTo(0, -height + 2 * flangeThickness + 2 * filletRadius)
        .arcTo(-filletRadius, -filletRadius, filletRadius, true)
        .lineTo(-width / 2 + webThickness / 2 + filletRadius, 0)
        .lineTo(0, -flangeThickness)
        .lineTo(width / 2, 0)
        .close();

      geometryGroup.translate(0, -height / 2);

      const dimensions = dimensionsGroup.dimension();
      const webThicknessDimensionPositionY = (height / 2 - flangeThickness) / 2;

      // web thickness dimension
      dimensions
        .moveToAbs(-webThickness / 2, webThicknessDimensionPositionY)
        .tick(0)
        .lineTo(-dimensionOverflow, 0)
        .moveToAbs(webThickness / 2, webThicknessDimensionPositionY)
        .tick(Math.PI)
        .lineTo(dimensionOverflow * 2, 0)
        .textAt(5, 0, `${webThickness}mm`, "start");

      // flange width dimension
      dimensions
        .moveToAbs(-width / 2, -height / 2 - dimensionOffset)
        .tick(0)
        .lineTo(width, 0)
        .tick(0)
        .textAt(-width / 2, -15, `${width}mm`);

      // height dimension
      dimensions
        .moveToAbs(width / 2 + dimensionOffset, -height / 2)
        .tick(-Math.PI / 2)
        .lineTo(0, height)
        .tick(Math.PI / 2)
        .textAt(15, -height / 2, `${height}mm`, "start");

      // fillet radius dimension
      const filletRadiusDimensionDirX = Math.cos(Math.PI / 4);
      const filletRadiusDimensionDirY = Math.sin(Math.PI / 4);
      dimensions
        .moveToAbs(-webThickness / 2, height / 2 - flangeThickness)
        .moveTo(-filletRadius, -filletRadius)
        .moveTo(
          filletRadius * filletRadiusDimensionDirX,
          filletRadius * filletRadiusDimensionDirY,
        )
        .arrowFilled(Math.PI / 4)
        .lineTo(-30, -30)
        .lineTo(-15, 0)
        .textAt(-5, 0, `R ${filletRadius}mm`, "end");
    });
  };

  $effect(() => {
    if (!scene) return;
    Object.assign(scene.params, {
      width,
      height,
      flangeThickness,
      webThickness,
      filletRadius,
    });
  });
</script>

<ExampleLayout
  initialParams={{ width, height, flangeThickness, webThickness, filletRadius }}
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
        <input type="range" bind:value={height} min={100} max={450} step={1} />
      </label>
      <span class="value">{height}</span>
    </div>
    <div class="demo-control">
      <label>
        Flange height
        <input
          type="range"
          bind:value={flangeThickness}
          min={10}
          max={80}
          step={1}
        />
      </label>
      <span class="value">{flangeThickness}</span>
    </div>
    <div class="demo-control">
      <label>
        Web thickness
        <input
          type="range"
          bind:value={webThickness}
          min={5}
          max={50}
          step={1}
        />
      </label>
      <span class="value">{webThickness}</span>
    </div>
    <div class="demo-control">
      <label>
        Fillet radius
        <input
          type="range"
          bind:value={filletRadius}
          min={0}
          max={30}
          step={1}
        />
      </label>
      <span class="value">{filletRadius}</span>
    </div>
  {/snippet}
</ExampleLayout>
