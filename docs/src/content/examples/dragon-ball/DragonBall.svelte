<script lang="ts">
  import { Pluton2D } from "pluton-2d";
  import ExampleLayout from "@examples/components/ExampleLayout.svelte";

  type SceneParams = { radius: number; starSize: number; specular: number };

  type GeometryPathBuilder = {
    moveToAbs: (x: number, y: number) => GeometryPathBuilder;
    lineToAbs: (x: number, y: number) => GeometryPathBuilder;
    cubicToAbs: (
      c1x: number,
      c1y: number,
      c2x: number,
      c2y: number,
      x: number,
      y: number,
    ) => GeometryPathBuilder;
    smoothCubicToAbs: (c2x: number, c2y: number, x: number, y: number) => GeometryPathBuilder;
    close: () => GeometryPathBuilder;
  };

  let radius = $state(120);
  let starSize = $state(16);
  let specular = $state(0.8);
  let scene: Pluton2D<SceneParams> | null = null;

  const onSetup = (sceneInstance: Pluton2D<SceneParams>) => {
    scene = sceneInstance;

    const geometry = sceneInstance.geometry.group();
    const dimensions = sceneInstance.dimensions.group();

    const sphereFillId = sceneInstance.addHatchFill("#fb923c", 0.3);
    const starFillId = sceneInstance.addHatchFill("#b91c1c", 0.5);

    const appendCircle = (
      path: GeometryPathBuilder,
      centerX: number,
      centerY: number,
      circleRadius: number,
    ) => {
      const handleOffset = circleRadius * 0.5522847498;
      path
        .moveToAbs(centerX - circleRadius, centerY)
        .cubicToAbs(
          centerX - circleRadius,
          centerY + handleOffset,
          centerX - handleOffset,
          centerY + circleRadius,
          centerX,
          centerY + circleRadius,
        )
        .smoothCubicToAbs(
          centerX + circleRadius,
          centerY + handleOffset,
          centerX + circleRadius,
          centerY,
        )
        .smoothCubicToAbs(
          centerX + handleOffset,
          centerY - circleRadius,
          centerX,
          centerY - circleRadius,
        )
        .smoothCubicToAbs(
          centerX - circleRadius,
          centerY - handleOffset,
          centerX - circleRadius,
          centerY,
        )
        .close();
    };

    sceneInstance.draw((params) => {
      const sphereRadius = params.radius;
      const starOuterRadius = params.starSize;
      const starInnerRadius = starOuterRadius * 0.44;
      const starCenterOffset = sphereRadius * 0.42;

      const spherePath = geometry.path({ className: "demo-dragon-sphere", fill: sphereFillId });
      appendCircle(spherePath, 0, 0, sphereRadius);

      const constructionPath = geometry.path({ className: "demo-dragon-construction" });
      constructionPath
        .moveToAbs(-sphereRadius * 1.08, 0)
        .lineToAbs(sphereRadius * 1.08, 0)
        .moveToAbs(0, -sphereRadius * 1.08)
        .lineToAbs(0, sphereRadius * 1.08);

      const starPath = geometry.path({ className: "demo-dragon-stars", fill: starFillId });
      const starCenters = [
        { x: 0, y: -starCenterOffset },
        { x: starCenterOffset, y: 0 },
        { x: 0, y: starCenterOffset },
        { x: -starCenterOffset, y: 0 },
      ];

      for (const starCenter of starCenters) {
        for (let pointIndex = 0; pointIndex < 10; pointIndex++) {
          const pointAngle = -Math.PI / 2 + (pointIndex * Math.PI) / 5;
          const pointRadius = pointIndex % 2 === 0 ? starOuterRadius : starInnerRadius;
          const pointX = starCenter.x + Math.cos(pointAngle) * pointRadius;
          const pointY = starCenter.y + Math.sin(pointAngle) * pointRadius;

          if (pointIndex === 0) {
            starPath.moveToAbs(pointX, pointY);
          } else {
            starPath.lineToAbs(pointX, pointY);
          }
        }
        starPath.close();
      }

      const dimensionPath = dimensions.dimension({ className: "dragon-dim" });
      dimensionPath
        .moveToAbs(-sphereRadius, sphereRadius + 24)
        .tick(0)
        .lineTo(2 * sphereRadius, 0)
        .tick(0)
        .textAt(
          -sphereRadius,
          -11,
          `${Math.round(2 * sphereRadius)} mm`,
          "middle",
          "dragon-dim",
        );

      dimensionPath
        .moveToAbs(sphereRadius + 34, -starCenterOffset)
        .tick(-Math.PI / 2)
        .lineTo(0, 2 * starCenterOffset)
        .tick(Math.PI / 2)
        .textAt(
          11,
          -starCenterOffset,
          `${Math.round(2 * starCenterOffset)} mm`,
          "start",
          "dragon-dim",
        );

      const notePath = dimensions.dimension({ className: "dragon-note" });
      notePath
        .moveToAbs(0, 0)
        .textAtAbs(0, -sphereRadius - 34, "FOUR STAR SPHERE", "middle", "dragon-note")
        .textAtAbs(0, -sphereRadius - 50, "CONSTRUCTION VIEW", "middle", "dragon-note");

      if (params.specular > 0) {
        const highlightRadius = sphereRadius * 0.36 * params.specular;
        const highlightInnerRadius = highlightRadius * 0.78;
        const highlightCenterX = -sphereRadius * 0.34;
        const highlightCenterY = -sphereRadius * 0.34;

        const highlightPath = geometry.path({ className: "demo-dragon-specular" });
        appendCircle(highlightPath, highlightCenterX, highlightCenterY, highlightRadius);
        appendCircle(
          highlightPath,
          highlightCenterX + highlightRadius * 0.48,
          highlightCenterY + highlightRadius * 0.2,
          highlightInnerRadius,
        );
      }
    });
  };

  $effect(() => {
    if (!scene) return;
    Object.assign(scene.params, { radius, starSize, specular });
  });
</script>

<ExampleLayout initialParams={{ radius, starSize, specular }} {onSetup}>
  {#snippet params()}
    <div class="demo-control">
      <label>
        Radius
        <input type="range" bind:value={radius} min={70} max={180} step={1} />
      </label>
      <span class="value">{radius}</span>
    </div>
    <div class="demo-control">
      <label>
        Star Size
        <input type="range" bind:value={starSize} min={8} max={28} step={1} />
      </label>
      <span class="value">{starSize}</span>
    </div>
    <div class="demo-control">
      <label>
        Specular
        <input type="range" bind:value={specular} min={0} max={1} step={0.05} />
      </label>
      <span class="value">{specular.toFixed(2)}</span>
    </div>
  {/snippet}
</ExampleLayout>

<style>
  :global(.pluton-root .pluton-geometry path.demo-dragon-sphere) {
    stroke: #d4651d;
    stroke-width: 1.25;
  }

  :global(.pluton-root .pluton-geometry path.demo-dragon-stars) {
    stroke: #8f1212;
    stroke-width: 0.98;
  }

  :global(.pluton-root .pluton-geometry path.demo-dragon-specular) {
    --hatch-fill-override: rgba(255, 255, 255, 0.34);
    stroke: rgba(255, 255, 255, 0.52);
    stroke-width: 0.88;
  }

  :global(.pluton-root .pluton-geometry path.demo-dragon-construction) {
    --hatch-fill-override: none;
    stroke: rgba(100, 116, 139, 0.62);
    stroke-dasharray: 0.32em;
    stroke-width: 0.92;
  }

  :global(.pluton-root .pluton-dimensions .pluton-dim-stroke.dragon-dim) {
    stroke: rgba(78, 94, 96, 0.9);
  }

  :global(.pluton-root .pluton-dimensions .pluton-dim-filled.dragon-dim) {
    fill: rgba(78, 94, 96, 0.9);
  }

  :global(.pluton-root .pluton-dimensions text.dragon-dim) {
    fill: rgba(78, 94, 96, 0.95);
    font-size: 10px;
    letter-spacing: 0.03em;
  }

  :global(.pluton-root .pluton-dimensions text.dragon-note) {
    fill: rgba(47, 83, 88, 0.9);
    font-size: 10px;
    letter-spacing: 0.07em;
    font-weight: 500;
  }
</style>
