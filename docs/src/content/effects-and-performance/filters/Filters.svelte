<script lang="ts">
  import { Pluton2D } from "pluton-2d";
  import ExampleLayout from "@views/examples/components/ExampleLayout.svelte";

  type Params = { size: number; points: number; innerRadiusRatio: number };

  let size = $state(120);
  let points = $state(5);
  let innerRadiusRatio = $state(0.38);
  let displacementScale = $state(2.75);
  let displacementFrequency = $state(0.1);
  let displacementOctaves = $state(1);
  let maskFrequency = $state(0.03);
  let maskOctaves = $state(1);
  let maskScale = $state(1.6);
  let scene: Pluton2D<Params> | null = null;

  const onSetup = (sceneInstance: Pluton2D<Params>) => {
    scene = sceneInstance;
    const geometryGroup = scene.geometry.group();
    const dimensionsGroup = scene.dimensions.group();
    scene.enableFilter(true);

    const ROSE = "#e11d48";
    const roseFillId = scene.addHatchFill(ROSE);
    const roseStroke = ROSE;
    const dimensionsOffset = 28;
    const starStartAngle = Math.PI / 2;

    scene.draw((p) => {
      const { size: outerRadius, points, innerRadiusRatio } = p;
      const innerRadius = outerRadius * innerRadiusRatio;
      const pointCount = Math.max(3, Math.floor(points));
      const step = Math.PI / pointCount;

      const path = geometryGroup.path({ stroke: roseStroke, fill: roseFillId });
      const startX = outerRadius * Math.cos(starStartAngle);
      const startY = outerRadius * Math.sin(starStartAngle);

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

      path.close();

      dimensionsGroup
        .dimension()
        .moveToAbs(-outerRadius, outerRadius + dimensionsOffset)
        .arrow(Math.PI)
        .lineTo(outerRadius * 2, 0)
        .arrow(0)
        .textAt(-outerRadius, 10, `${outerRadius * 2}mm`);

      dimensionsGroup
        .dimension()
        .moveToAbs(outerRadius + dimensionsOffset, -outerRadius)
        .arrow(-Math.PI / 2)
        .lineTo(0, outerRadius * 2)
        .arrow(Math.PI / 2)
        .textAt(10, -outerRadius, `${outerRadius * 2}mm`, "start");
    });
  };

  $effect(() => {
    if (!scene) return;
    Object.assign(scene.params, { size, points, innerRadiusRatio });
  });

  $effect(() => {
    if (!scene) return;
    scene.setDisplacementScale(displacementScale);
    scene.setDisplacementFrequency(displacementFrequency);
    scene.setDisplacementOctaves(displacementOctaves);
    scene.setMaskFrequency(maskFrequency);
    scene.setMaskOctaves(maskOctaves);
    scene.setMaskScale(maskScale);
  });
</script>

<ExampleLayout
  initialParams={{ size, points, innerRadiusRatio }}
  {onSetup}
  initialToggles={{ filterOn: true, maskOn: true }}
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
        Displacement scale
        <input
          type="range"
          bind:value={displacementScale}
          min={0}
          max={10}
          step={0.05}
        />
      </label>
      <span class="value">{displacementScale.toFixed(2)}</span>
    </div>
    <div class="demo-control">
      <label>
        Displacement frequency
        <input
          type="range"
          bind:value={displacementFrequency}
          min={0}
          max={1}
          step={0.01}
        />
      </label>
      <span class="value">{displacementFrequency.toFixed(2)}</span>
    </div>
    <div class="demo-control">
      <label>
        Displacement octaves
        <input
          type="range"
          bind:value={displacementOctaves}
          min={1}
          max={8}
          step={1}
        />
      </label>
      <span class="value">{displacementOctaves}</span>
    </div>
    <div class="demo-control">
      <label>
        Mask scale
        <input
          type="range"
          bind:value={maskScale}
          min={0.1}
          max={3}
          step={0.05}
        />
      </label>
      <span class="value">{maskScale.toFixed(2)}</span>
    </div>
    <div class="demo-control">
      <label>
        Mask frequency
        <input
          type="range"
          bind:value={maskFrequency}
          min={0}
          max={0.5}
          step={0.005}
        />
      </label>
      <span class="value">{maskFrequency.toFixed(2)}</span>
    </div>
    <div class="demo-control">
      <label>
        Mask octaves
        <input type="range" bind:value={maskOctaves} min={1} max={6} step={1} />
      </label>
      <span class="value">{maskOctaves}</span>
    </div>
  {/snippet}
</ExampleLayout>
