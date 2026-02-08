<script lang="ts">
  import { Pluton2D } from "pluton-2d";
  import ExampleLayout from "@examples/components/ExampleLayout.svelte";

  type Params = { radius: number; starSize: number };

  let radius = $state(120);
  let starSize = $state(16);
  let scene: Pluton2D<Params> | null = null;

  const onSetup = (sceneInstance: Pluton2D<Params>) => {
    scene = sceneInstance;
    const geometryGroup = scene.geometry.group();
    const dimensionsGroup = scene.dimensions.group();

    const ORANGE = "#fb923c";
    const DARK_ORANGE = "#d4651d";
    const sphereFillId = scene.addHatchFill(ORANGE, 0.25);
    const sphereStroke = DARK_ORANGE;

    const RED = "#b91c1c";
    const DARK_RED = "#8f1212";
    const starsFillId = scene.addHatchFill(RED, 0.5);
    const starsStroke = DARK_RED;

    const starStartAngle = -Math.PI / 2;
    const starOffsetRatio = 0.4;
    const dimensionOffset = 30;

    const drawStar = (
      path: ReturnType<typeof geometryGroup.path>,
      centerX: number,
      centerY: number,
      outerRadius: number,
      startAngle: number,
    ) => {
      const pointCount = 5;
      const innerRadiusRatio = 0.44;
      const step = Math.PI / pointCount;
      const innerRadius = outerRadius * innerRadiusRatio;
      const startX = centerX + Math.cos(startAngle) * outerRadius;
      const startY = centerY + Math.sin(startAngle) * outerRadius;

      // outer point 1
      path.moveToAbs(startX, startY);
      let previousX = startX;
      let previousY = startY;

      for (let vertexIndex = 1; vertexIndex < pointCount * 2; vertexIndex++) {
        const isOuterPoint = vertexIndex % 2 === 0;
        const pointRadius = isOuterPoint ? outerRadius : innerRadius;
        const pointAngle = startAngle + step * vertexIndex;
        const pointX = centerX + Math.cos(pointAngle) * pointRadius;
        const pointY = centerY + Math.sin(pointAngle) * pointRadius;
        path.lineTo(pointX - previousX, pointY - previousY);
        previousX = pointX;
        previousY = pointY;
      }

      // close the star
      path.close();
    };

    scene.draw((p) => {
      const { radius: sphereRadius, starSize } = p;
      const starOffset = sphereRadius * starOffsetRatio;

      // sphere
      const spherePath = geometryGroup.path({
        stroke: sphereStroke,
        fill: sphereFillId,
      });
      spherePath
        .moveToAbs(-sphereRadius, 0)
        .arcTo(sphereRadius, sphereRadius, sphereRadius, true)
        .arcTo(sphereRadius, -sphereRadius, sphereRadius, true)
        .arcTo(-sphereRadius, -sphereRadius, sphereRadius, true)
        .arcTo(-sphereRadius, sphereRadius, sphereRadius, true)
        .close();

      // four stars
      const starsPath = geometryGroup.path({
        stroke: starsStroke,
        fill: starsFillId,
      });
      drawStar(starsPath, 0, -starOffset, starSize, starStartAngle);
      drawStar(starsPath, starOffset, 0, starSize, starStartAngle);
      drawStar(starsPath, 0, starOffset, starSize, starStartAngle);
      drawStar(starsPath, -starOffset, 0, starSize, starStartAngle);

      const dimensions = dimensionsGroup.dimension();
      dimensions
        // diameter
        .moveToAbs(-sphereRadius, -sphereRadius - dimensionOffset)
        .tick(0)
        .lineTo(2 * sphereRadius, 0)
        .tick(0)
        .textAt(-sphereRadius, -15, `${Math.round(2 * sphereRadius)} mm`)

        // title
        .moveToAbs(0, 0)
        .textAtAbs(
          0,
          200,
          `"Ka...me...ha...me...haaaaaaaa!" - Goku`,
          "middle",
          "title",
        );
    });
  };

  $effect(() => {
    if (!scene) return;
    Object.assign(scene.params, { radius, starSize });
  });
</script>

<ExampleLayout initialParams={{ radius, starSize }} {onSetup}>
  {#snippet params()}
    <div class="demo-control">
      <label>
        Sphere radius
        <input type="range" bind:value={radius} min={70} max={180} step={1} />
      </label>
      <span class="value">{radius}</span>
    </div>
    <div class="demo-control">
      <label>
        Star size
        <input type="range" bind:value={starSize} min={8} max={28} step={1} />
      </label>
      <span class="value">{starSize}</span>
    </div>
  {/snippet}
</ExampleLayout>

<style>
  :global(.pluton-root .pluton-dimensions text.dragon-title) {
    font-size: 10px;
    letter-spacing: 0.07em;
    font-weight: 500;
  }
</style>
