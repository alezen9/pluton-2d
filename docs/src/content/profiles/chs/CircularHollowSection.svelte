<script lang="ts">
  import { Pluton2D } from "pluton-2d";
  import ExampleLayout from "@views/examples/components/ExampleLayout.svelte";

  type Params = { radius: number; thickness: number };
  let radius = $state(110);
  let thickness = $state(24);
  let scene: Pluton2D<Params> | null = null;

  const onSetup = (sceneInstance: Pluton2D<Params>) => {
    scene = sceneInstance;
    const geometryGroup = scene.geometry.group();
    const dimensionsGroup = scene.dimensions.group();
    const TEAL = "#0f766e";
    const tealFillId = scene.addHatchFill(TEAL);
    const tealStroke = TEAL;

    const radiusDimensionAngle = Math.PI / 4; // 45deg
    const centerMarkSize = 15;
    const dimensionOverflow = 15;
    const thicknessDimensionAngle = -Math.PI / 4; // -45deg

    scene.draw((p) => {
      const { radius: outerRadius, thickness } = p;
      const innerRadius = outerRadius - thickness;

      const path = geometryGroup.path({ stroke: tealStroke, fill: tealFillId });

      // a single arcTo can create a circle with the help of a very small displacement (epsilon) and lareArc = true
      // it looks and behaves like a circle but a perfect one can only be produced by 2 or more arcs
      path
        // outer circle
        .moveToAbs(-outerRadius, 0)
        .arcTo(0, -Number.EPSILON, outerRadius, true, true)
        // inner circle
        .moveToAbs(-innerRadius, 0)
        .arcTo(0, -Number.EPSILON, innerRadius, true, true)
        .close();

      const dimensions = dimensionsGroup.dimension();
      const radiusDirX = Math.cos(radiusDimensionAngle);
      const radiusDirY = Math.sin(radiusDimensionAngle);

      // radius dimension
      dimensions
        .centerMark(centerMarkSize)
        .lineTo(outerRadius * radiusDirX, outerRadius * radiusDirY)
        .arrowFilled(radiusDimensionAngle)
        .moveToAbs(
          (innerRadius / 2) * radiusDirX,
          (innerRadius / 2) * radiusDirY,
        )
        .textAt(-5, 5, `R ${outerRadius}mm`, "end");

      // wall thickness dimension
      const thicknessDirX = Math.cos(thicknessDimensionAngle);
      const thicknessDirY = Math.sin(thicknessDimensionAngle);
      dimensions
        .moveToAbs(
          (innerRadius - dimensionOverflow) * thicknessDirX,
          (innerRadius - dimensionOverflow) * thicknessDirY,
        )
        .lineTo(
          dimensionOverflow * thicknessDirX,
          dimensionOverflow * thicknessDirY,
        )
        .tick(thicknessDimensionAngle)
        .moveTo(thickness * thicknessDirX, thickness * thicknessDirY)
        .tick(thicknessDimensionAngle)
        .lineTo(
          dimensionOverflow * thicknessDirX,
          dimensionOverflow * thicknessDirY,
        )
        .lineTo(dimensionOverflow * 2, 0)
        .textAt(5, 0, `${thickness}mm`, "start");
    });
  };

  $effect(() => {
    if (!scene) return;
    Object.assign(scene.params, { radius, thickness });
  });
</script>

<ExampleLayout initialParams={{ radius, thickness }} {onSetup}>
  {#snippet controls()}
    <div class="demo-control">
      <label>
        Radius
        <input type="range" bind:value={radius} min={50} max={200} step={1} />
      </label>
      <span class="value">{radius}</span>
    </div>
    <div class="demo-control">
      <label>
        Wall thickness
        <input type="range" bind:value={thickness} min={3} max={50} step={1} />
      </label>
      <span class="value">{thickness}</span>
    </div>
  {/snippet}
</ExampleLayout>
