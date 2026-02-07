<script lang="ts">
  import { Pluton2D } from "pluton-2d";
  import ExampleLayout from "@examples/components/ExampleLayout.svelte";

  type SceneParams = {
    span: number;
    rise: number;
    panels: number;
    nodePlateRadius: number;
    camber: number;
  };

  type Point = { x: number; y: number };

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

  let span = $state(840);
  let rise = $state(190);
  let panels = $state(8);
  let nodePlateRadius = $state(8);
  let camber = $state(18);
  let scene: Pluton2D<SceneParams> | null = null;

  const appendCircle = (
    path: GeometryPathBuilder,
    centerX: number,
    centerY: number,
    radiusValue: number,
  ) => {
    const handleOffset = radiusValue * 0.5522847498;
    path
      .moveToAbs(centerX - radiusValue, centerY)
      .cubicToAbs(
        centerX - radiusValue,
        centerY + handleOffset,
        centerX - handleOffset,
        centerY + radiusValue,
        centerX,
        centerY + radiusValue,
      )
      .smoothCubicToAbs(
        centerX + radiusValue,
        centerY + handleOffset,
        centerX + radiusValue,
        centerY,
      )
      .smoothCubicToAbs(
        centerX + handleOffset,
        centerY - radiusValue,
        centerX,
        centerY - radiusValue,
      )
      .smoothCubicToAbs(
        centerX - radiusValue,
        centerY - handleOffset,
        centerX - radiusValue,
        centerY,
      )
      .close();
  };

  const onSetup = (sceneInstance: Pluton2D<SceneParams>) => {
    scene = sceneInstance;
    const geometry = sceneInstance.geometry.group();
    const dimensions = sceneInstance.dimensions.group();

    const nodeFillId = sceneInstance.addHatchFill("#0f766e", 0.16);

    sceneInstance.draw((params) => {
      const panelCount = Math.max(6, Math.round(params.panels / 2) * 2);
      const trussSpan = params.span;
      const halfTrussSpan = trussSpan / 2;
      const panelLength = trussSpan / panelCount;
      const endTopChordHeight = params.rise * 0.2;
      const bottomChordNodes: Point[] = [];
      const topChordNodes: Point[] = [];

      for (let i = 0; i <= panelCount; i++) {
        const nodeX = -halfTrussSpan + i * panelLength;
        const normalizedPosition = i / panelCount;
        const crownFactor = 4 * normalizedPosition * (1 - normalizedPosition);
        const bottomNodeY = params.camber * 0.22 * crownFactor;
        const topNodeY = endTopChordHeight + (params.rise - endTopChordHeight) * crownFactor;

        bottomChordNodes.push({ x: nodeX, y: bottomNodeY });
        topChordNodes.push({ x: nodeX, y: topNodeY });
      }

      const chordPath = geometry.path({ className: "demo-truss-chord" });
      chordPath.moveToAbs(bottomChordNodes[0].x, bottomChordNodes[0].y);
      for (let i = 1; i <= panelCount; i++) {
        chordPath.lineToAbs(bottomChordNodes[i].x, bottomChordNodes[i].y);
      }

      chordPath.moveToAbs(topChordNodes[0].x, topChordNodes[0].y);
      for (let i = 1; i <= panelCount; i++) {
        chordPath.lineToAbs(topChordNodes[i].x, topChordNodes[i].y);
      }

      chordPath
        .moveToAbs(bottomChordNodes[0].x, bottomChordNodes[0].y)
        .lineToAbs(topChordNodes[0].x, topChordNodes[0].y)
        .moveToAbs(bottomChordNodes[panelCount].x, bottomChordNodes[panelCount].y)
        .lineToAbs(topChordNodes[panelCount].x, topChordNodes[panelCount].y);

      const webPath = geometry.path({ className: "demo-truss-web" });

      for (let i = 1; i < panelCount; i++) {
        webPath
          .moveToAbs(bottomChordNodes[i].x, bottomChordNodes[i].y)
          .lineToAbs(topChordNodes[i].x, topChordNodes[i].y);
      }

      for (let i = 0; i < panelCount; i++) {
        if (i < panelCount / 2) {
          webPath
            .moveToAbs(bottomChordNodes[i].x, bottomChordNodes[i].y)
            .lineToAbs(topChordNodes[i + 1].x, topChordNodes[i + 1].y);
        } else {
          webPath
            .moveToAbs(topChordNodes[i].x, topChordNodes[i].y)
            .lineToAbs(bottomChordNodes[i + 1].x, bottomChordNodes[i + 1].y);
        }
      }

      const nodesPath = geometry.path({ className: "demo-truss-nodes", fill: nodeFillId });
      const nodePlateRadiusValue = params.nodePlateRadius;
      for (let i = 0; i <= panelCount; i++) {
        appendCircle(nodesPath, bottomChordNodes[i].x, bottomChordNodes[i].y, nodePlateRadiusValue);
        appendCircle(nodesPath, topChordNodes[i].x, topChordNodes[i].y, nodePlateRadiusValue);
      }

      const highestTopNodeY = Math.max(...topChordNodes.map((node) => node.y));
      const rightSupportY = bottomChordNodes[panelCount].y;
      const lowestBottomNodeY = Math.min(...bottomChordNodes.map((node) => node.y));

      const dimensionPath = dimensions.dimension({ className: "truss-dim" });

      dimensionPath
        .moveToAbs(-halfTrussSpan, lowestBottomNodeY - 42)
        .tick(0)
        .lineTo(trussSpan, 0)
        .tick(0)
        .textAt(-trussSpan / 2, -12, `${Math.round(trussSpan)} mm`, "middle", "truss-dim");

      dimensionPath
        .moveToAbs(-halfTrussSpan, lowestBottomNodeY - 22)
        .tick(0)
        .lineTo(panelLength, 0)
        .tick(0)
        .textAt(-panelLength / 2, -10, `${Math.round(panelLength)} mm`, "middle", "truss-dim");

      dimensionPath
        .moveToAbs(halfTrussSpan + 30, rightSupportY)
        .tick(-Math.PI / 2)
        .lineTo(0, highestTopNodeY - rightSupportY)
        .tick(Math.PI / 2)
        .textAt(
          12,
          -(highestTopNodeY - rightSupportY) / 2,
          `${Math.round(highestTopNodeY - rightSupportY)} mm`,
          "start",
          "truss-dim",
        );

      const notePath = dimensions.dimension({ className: "truss-note" });
      notePath
        .moveToAbs(0, 0)
        .textAtAbs(0, highestTopNodeY + 24, "PRATT TRUSS ELEVATION", "middle", "truss-note")
        .textAtAbs(-halfTrussSpan, lowestBottomNodeY - 52, `${panelCount} PANELS`, "start", "truss-note");
    });
  };

  $effect(() => {
    if (!scene) return;

    Object.assign(scene.params, {
      span,
      rise,
      panels,
      nodePlateRadius,
      camber,
    });
  });
</script>

<ExampleLayout initialParams={{ span, rise, panels, nodePlateRadius, camber }} {onSetup}>
  {#snippet params()}
    <div class="demo-control">
      <label>
        Span
        <input type="range" bind:value={span} min={680} max={1400} step={10} />
      </label>
      <span class="value">{span}</span>
    </div>
    <div class="demo-control">
      <label>
        Rise
        <input type="range" bind:value={rise} min={140} max={320} step={2} />
      </label>
      <span class="value">{rise}</span>
    </div>
    <div class="demo-control">
      <label>
        Panels
        <input type="range" bind:value={panels} min={6} max={16} step={2} />
      </label>
      <span class="value">{panels}</span>
    </div>
    <div class="demo-control">
      <label>
        Node Plate
        <input type="range" bind:value={nodePlateRadius} min={5} max={14} step={1} />
      </label>
      <span class="value">{nodePlateRadius}</span>
    </div>
    <div class="demo-control">
      <label>
        Camber
        <input type="range" bind:value={camber} min={0} max={40} step={1} />
      </label>
      <span class="value">{camber}</span>
    </div>
  {/snippet}
</ExampleLayout>

<style>
  :global(.pluton-root .pluton-geometry path.demo-truss-chord) {
    --hatch-fill-override: none;
    stroke: rgba(15, 118, 110, 0.92);
    stroke-width: 1.35;
  }

  :global(.pluton-root .pluton-geometry path.demo-truss-web) {
    --hatch-fill-override: none;
    stroke: rgba(71, 85, 105, 0.9);
    stroke-width: 0.98;
  }

  :global(.pluton-root .pluton-geometry path.demo-truss-nodes) {
    stroke: rgba(8, 86, 78, 0.95);
    stroke-width: 0.95;
  }

  :global(.pluton-root .pluton-dimensions .pluton-dim-stroke.truss-dim) {
    stroke: rgba(78, 94, 96, 0.9);
  }

  :global(.pluton-root .pluton-dimensions .pluton-dim-filled.truss-dim) {
    fill: rgba(78, 94, 96, 0.9);
  }

  :global(.pluton-root .pluton-dimensions text.truss-dim) {
    fill: rgba(78, 94, 96, 0.95);
    font-size: 10px;
    letter-spacing: 0.03em;
  }

  :global(.pluton-root .pluton-dimensions text.truss-note) {
    fill: rgba(47, 83, 88, 0.9);
    font-size: 10px;
    letter-spacing: 0.07em;
    font-weight: 500;
  }
</style>
