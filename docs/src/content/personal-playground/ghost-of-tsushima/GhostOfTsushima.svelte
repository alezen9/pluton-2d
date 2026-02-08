<script lang="ts">
  import type { Pluton2D } from "pluton-2d";
  import ExampleLayout from "@examples/components/ExampleLayout.svelte";

  type Params = { radius: number };

  const initialRadius = 120;
  let radius = $state(initialRadius);
  let scene: Pluton2D<Params> | null = null;

  const onSetup = (sceneInstance: Pluton2D<Params>) => {
    scene = sceneInstance;
    const geometryGroup = scene.geometry.group();
    const dimensionsGroup = scene.dimensions.group();

    const BLACK = "#000";
    const blackFillId = scene.addHatchFill(BLACK, 0.5);

    const RED = "#a40000";
    const redFillId = scene.addHatchFill(RED, 0.5);
    const redStroke = RED;

    const dimensionsOffset = 30;

    scene.draw((p) => {
      const { radius } = p;

      const scaleFactor = radius / initialRadius;
      geometryGroup.scale(scaleFactor, scaleFactor);

      const thickness = initialRadius / 5;
      const outerRadius = initialRadius;
      const innerRadius = initialRadius - thickness;

      const ringPath = geometryGroup.path({
        fill: blackFillId,
      });

      ringPath
        // outer circle
        .moveToAbs(-outerRadius, 0)
        .arcTo(outerRadius * 2, 0, outerRadius, true)
        .arcTo(-outerRadius * 2, 0, outerRadius, true)
        // inner circle
        .moveToAbs(-innerRadius, 0)
        .arcTo(innerRadius * 2, 0, innerRadius, true)
        .arcTo(-innerRadius * 2, 0, innerRadius, true)
        .close();

      const polygonsPath = geometryGroup.path({
        stroke: redStroke,
        fill: redFillId,
      });

      const baseWidth = (initialRadius / 2.5) * 2;

      polygonsPath
        // bottom triangle
        .moveToAbs(-baseWidth / 2, (-baseWidth / 2) * 0.75)
        .lineTo(baseWidth / 2, baseWidth / 2)
        .lineTo(baseWidth / 2, -baseWidth / 2)
        .lineTo(-baseWidth, 0)
        // top triangle
        .moveToAbs(-baseWidth / 2, 0)
        .lineTo(baseWidth / 2, baseWidth / 2)
        .lineTo(baseWidth / 2, -baseWidth / 2)
        .lineTo((-baseWidth / 2) * 0.6, 0)
        .lineTo((-baseWidth / 2) * 0.4, (baseWidth / 2) * 0.4)
        .lineTo((-baseWidth / 2) * 0.4, (-baseWidth / 2) * 0.4)
        .close();

      const dimensions = dimensionsGroup.dimension();
      dimensions
        .moveToAbs(radius + dimensionsOffset, -radius)
        .tick(Math.PI / 2)
        .lineTo(0, radius * 2)
        .tick(Math.PI / 2)
        .textAt(5, -radius, `Ø ${radius}mm`, "start")

        // title
        .moveToAbs(0, 0)
        .textAtAbs(
          0,
          200,
          `"Honor died on the beach" - Jin Sakai`,
          "middle",
          "title",
        );
    });
  };

  $effect(() => {
    if (!scene) return;
    Object.assign(scene.params, {
      radius,
    });
  });
</script>

<ExampleLayout initialParams={{ radius }} {onSetup}>
  <div class="demo-control">
    <label>
      Radius
      <input type="range" bind:value={radius} min={60} max={160} step={2} />
    </label>
    <span class="value">{radius}</span>
  </div>
</ExampleLayout>
