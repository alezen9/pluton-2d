<script lang="ts">
  import { Pluton2D } from "pluton-2d";
  import ExampleLayout from "@examples/components/ExampleLayout.svelte";

  type Params = { size: number; points: number; innerRadiusRatio: number };

  let size = $state(120);
  let points = $state(5);
  let innerRadiusRatio = $state(0.38);
  let filterIntensity = $state(1.25);
  let scene: Pluton2D<Params> | null = null;

  const onSetup = (sceneInstance: Pluton2D<Params>) => {
    scene = sceneInstance;
    const geometryGroup = scene.geometry.group();
    scene.enableFilter(true);
    scene.setFilterIntensity(filterIntensity); // reactive state

    const ROSE = "#e11d48";
    const roseFillId = scene.addHatchFill(ROSE);
    const roseStroke = ROSE;

    const starStartAngle = Math.PI / 2;
    scene.draw((p) => {
      const { size, points, innerRadiusRatio } = p;
      const path = geometryGroup.path({
        stroke: roseStroke,
        fill: roseFillId,
      });
      const pointCount = Math.max(3, Math.floor(points));
      const step = Math.PI / pointCount;
      const outerRadius = size;
      const innerRadius = size * innerRadiusRatio;
      const startX = outerRadius * Math.cos(starStartAngle);
      const startY = outerRadius * Math.sin(starStartAngle);

      // outer point 1
      path.moveToAbs(startX, startY);

      let previousX = startX;
      let previousY = startY;

      for (let vertexIndex = 1; vertexIndex < pointCount * 2; vertexIndex++) {
        const isOuterPoint = vertexIndex % 2 === 0;
        const pointRadius = isOuterPoint ? outerRadius : innerRadius;
        const pointAngle = starStartAngle + step * vertexIndex;
        const pointX = pointRadius * Math.cos(pointAngle);
        const pointY = pointRadius * Math.sin(pointAngle);

        path.lineTo(pointX - previousX, pointY - previousY);

        previousX = pointX;
        previousY = pointY;
      }

      // close the star
      path.close();
    });
  };

  $effect(() => {
    if (!scene) return;
    Object.assign(scene.params, { size, points, innerRadiusRatio });
  });

  $effect(() => {
    if (!scene) return;
    scene.setFilterIntensity(filterIntensity);
  });
</script>

<ExampleLayout
  initialParams={{ size, points, innerRadiusRatio }}
  {onSetup}
  initialToggles={{ filterOn: true }}
>
  {#snippet controls()}
    <div class="demo-control">
      <label>
        Size
        <input type="range" bind:value={size} min={40} max={160} step={1} />
      </label>
      <span class="value">{size}</span>
    </div>
    <div class="demo-control">
      <label>
        Points
        <input type="range" bind:value={points} min={3} max={12} step={1} />
      </label>
      <span class="value">{points}</span>
    </div>
    <div class="demo-control">
      <label>
        Inner radius ratio
        <input
          type="range"
          bind:value={innerRadiusRatio}
          min={0}
          max={1}
          step={0.01}
        />
      </label>
      <span class="value">{innerRadiusRatio.toFixed(2)}</span>
    </div>
    <div class="demo-control">
      <label>
        Filter intensity
        <input
          type="range"
          bind:value={filterIntensity}
          min={0}
          max={10}
          step={0.05}
        />
      </label>
      <span class="value">{filterIntensity.toFixed(2)}</span>
    </div>
  {/snippet}
</ExampleLayout>
