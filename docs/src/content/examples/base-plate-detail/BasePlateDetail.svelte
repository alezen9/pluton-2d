<script lang="ts">
  import { Pluton2D } from "pluton-2d";
  import ExampleLayout from "@examples/components/ExampleLayout.svelte";

  type SceneParams = {
    columnWidth: number;
    columnHeight: number;
    plateWidth: number;
    plateDepth: number;
    plateThickness: number;
    boltOffsetX: number;
    boltOffsetY: number;
    boltDiameter: number;
    cornerRadius: number;
    groutThickness: number;
  };

  type GeometryPathBuilder = {
    moveToAbs: (x: number, y: number) => GeometryPathBuilder;
    lineToAbs: (x: number, y: number) => GeometryPathBuilder;
    lineTo: (dx: number, dy: number) => GeometryPathBuilder;
    cubicToAbs: (
      c1x: number,
      c1y: number,
      c2x: number,
      c2y: number,
      x: number,
      y: number,
    ) => GeometryPathBuilder;
    smoothCubicToAbs: (c2x: number, c2y: number, x: number, y: number) => GeometryPathBuilder;
    arcToAbs: (
      x: number,
      y: number,
      r: number,
      clockwise?: boolean,
      largeArc?: boolean,
    ) => GeometryPathBuilder;
    arcTo: (
      dx: number,
      dy: number,
      r: number,
      clockwise?: boolean,
      largeArc?: boolean,
    ) => GeometryPathBuilder;
    close: () => GeometryPathBuilder;
  };

  let columnWidth = $state(120);
  let columnHeight = $state(220);
  let plateWidth = $state(230);
  let plateDepth = $state(180);
  let plateThickness = $state(24);
  let boltOffsetX = $state(72);
  let boltOffsetY = $state(52);
  let boltDiameter = $state(20);
  let cornerRadius = $state(14);
  let groutThickness = $state(14);
  let scene: Pluton2D<SceneParams> | null = null;

  const appendRectangle = (path: GeometryPathBuilder, x0: number, y0: number, x1: number, y1: number) => {
    path.moveToAbs(x0, y0).lineToAbs(x1, y0).lineToAbs(x1, y1).lineToAbs(x0, y1).close();
  };

  const appendCircle = (path: GeometryPathBuilder, cx: number, cy: number, r: number) => {
    const handleOffset = r * 0.5522847498;
    path
      .moveToAbs(cx - r, cy)
      .cubicToAbs(cx - r, cy + handleOffset, cx - handleOffset, cy + r, cx, cy + r)
      .smoothCubicToAbs(cx + r, cy + handleOffset, cx + r, cy)
      .smoothCubicToAbs(cx + handleOffset, cy - r, cx, cy - r)
      .smoothCubicToAbs(cx - r, cy - handleOffset, cx - r, cy)
      .close();
  };

  const appendRoundedRectangle = (
    path: GeometryPathBuilder,
    cx: number,
    cy: number,
    w: number,
    h: number,
    r: number,
  ) => {
    const left = cx - w / 2;
    const right = cx + w / 2;
    const top = cy + h / 2;
    const bottom = cy - h / 2;
    const rr = Math.max(0, Math.min(r, w / 2, h / 2));

    path
      .moveToAbs(left + rr, top)
      .lineToAbs(right - rr, top)
      .arcToAbs(right, top - rr, rr, true)
      .lineToAbs(right, bottom + rr)
      .arcToAbs(right - rr, bottom, rr, true)
      .lineToAbs(left + rr, bottom)
      .arcToAbs(left, bottom + rr, rr, true)
      .lineToAbs(left, top - rr)
      .arcToAbs(left + rr, top, rr, true)
      .close();
  };

  const onSetup = (sceneInstance: Pluton2D<SceneParams>) => {
    scene = sceneInstance;
    const geometry = sceneInstance.geometry.group();
    const dimensions = sceneInstance.dimensions.group();

    const columnFillId = sceneInstance.addHatchFill("#0f766e", 0.2);
    const plateFillId = sceneInstance.addHatchFill("#475569", 0.15);
    const concreteFillId = sceneInstance.addHatchFill("#94a3b8", 0.1);
    const boltFillId = sceneInstance.addHatchFill("#7f1d1d", 0.14);

    sceneInstance.draw((params) => {
      const columnWidthValue = params.columnWidth;
      const columnHeightValue = params.columnHeight;
      const plateWidthValue = Math.max(params.plateWidth, columnWidthValue + 60);
      const plateDepthValue = params.plateDepth;
      const plateThicknessValue = params.plateThickness;
      const boltOffsetXValue = Math.min(params.boltOffsetX, plateWidthValue * 0.38);
      const boltOffsetYValue = Math.min(params.boltOffsetY, plateDepthValue * 0.38);
      const boltR = params.boltDiameter / 2;
      const cornerR = params.cornerRadius;
      const groutThicknessValue = params.groutThickness;

      const elevationCenterX = -235;
      const planCenterX = 235;
      const planCenterY = 34;

      const plateTop = -44;
      const plateBottom = plateTop - plateThicknessValue;
      const columnBottom = plateTop;
      const columnTop = columnBottom + columnHeightValue;

      const concreteTop = plateBottom - groutThicknessValue;
      const concreteBottom = concreteTop - 70;
      const planTopDimY = planCenterY + plateDepthValue / 2 + 28;
      const planLeftDimX = planCenterX - plateWidthValue / 2 - 34;
      const boltXDimY = planCenterY - plateDepthValue / 2 - 22;
      const boltYDimX = planCenterX + plateWidthValue / 2 + 30;
      const columnDimY = columnTop + 22;
      const plateDimX = elevationCenterX + plateWidthValue / 2 + 34;
      const groutDimX = elevationCenterX - plateWidthValue * 0.66;
      appendRectangle(
        geometry.path({ className: "demo-base-concrete", fill: concreteFillId }),
        elevationCenterX - plateWidthValue * 0.6,
        concreteBottom,
        elevationCenterX + plateWidthValue * 0.6,
        concreteTop,
      );

      geometry
        .path({ className: "demo-base-grout" })
        .moveToAbs(elevationCenterX - plateWidthValue * 0.56, concreteTop)
        .lineToAbs(elevationCenterX + plateWidthValue * 0.56, concreteTop);

      appendRoundedRectangle(
        geometry.path({ className: "demo-base-plate", fill: plateFillId }),
        elevationCenterX,
        (plateTop + plateBottom) / 2,
        plateWidthValue,
        plateThicknessValue,
        Math.min(cornerR * 0.45, plateThicknessValue * 0.3),
      );

      appendRectangle(
        geometry.path({ className: "demo-base-column", fill: columnFillId }),
        elevationCenterX - columnWidthValue / 2,
        columnBottom,
        elevationCenterX + columnWidthValue / 2,
        columnTop,
      );
      const rodW = Math.max(8, boltR * 0.88);
      const rodBottom = concreteBottom + 10;
      const rodTop = plateTop + 26;
      const nutH = Math.max(8, rodW * 0.62);
      const washerH = Math.max(4, rodW * 0.26);
      const rodPath = geometry.path({ className: "demo-base-bolt", fill: boltFillId });

      for (const x of [-boltOffsetXValue, boltOffsetXValue]) {
        const cx = elevationCenterX + x;

        appendRectangle(rodPath, cx - rodW / 2, rodBottom, cx + rodW / 2, rodTop);
        appendRectangle(
          rodPath,
          cx - rodW * 0.82,
          plateTop + 3,
          cx + rodW * 0.82,
          plateTop + 3 + washerH,
        );
        appendRectangle(
          rodPath,
          cx - rodW * 0.72,
          plateTop + 3 + washerH,
          cx + rodW * 0.72,
          plateTop + 3 + washerH + nutH,
        );
      }
      const weld = geometry.path({ className: "demo-base-weld" });
      const weldSize = Math.max(9, columnWidthValue * 0.08);
      weld
        .moveToAbs(elevationCenterX - columnWidthValue / 2, plateTop)
        .lineTo(weldSize, 0)
        .lineTo(0, weldSize)
        .close()
        .moveToAbs(elevationCenterX + columnWidthValue / 2, plateTop)
        .lineTo(-weldSize, 0)
        .lineTo(0, weldSize)
        .close();
      appendRoundedRectangle(
        geometry.path({ className: "demo-base-plate", fill: plateFillId }),
        planCenterX,
        planCenterY,
        plateWidthValue,
        plateDepthValue,
        cornerR,
      );

      appendRectangle(
        geometry.path({ className: "demo-base-column", fill: columnFillId }),
        planCenterX - columnWidthValue / 2,
        planCenterY - columnWidthValue / 2,
        planCenterX + columnWidthValue / 2,
        planCenterY + columnWidthValue / 2,
      );

      const holes = geometry.path({ className: "demo-base-hole", fill: boltFillId });
      for (const sx of [-1, 1]) {
        for (const sy of [-1, 1]) {
          appendCircle(holes, planCenterX + sx * boltOffsetXValue, planCenterY + sy * boltOffsetYValue, boltR);
        }
      }
      geometry
        .path({ className: "demo-base-centerline" })
        .moveToAbs(planCenterX - plateWidthValue * 0.52, planCenterY)
        .lineToAbs(planCenterX + plateWidthValue * 0.52, planCenterY)
        .moveToAbs(planCenterX, planCenterY - plateDepthValue * 0.52)
        .lineToAbs(planCenterX, planCenterY + plateDepthValue * 0.52);
      const dim = dimensions.dimension({ className: "base-dim" });

      dim
        .moveToAbs(planCenterX - plateWidthValue / 2, planTopDimY)
        .tick(0)
        .lineTo(plateWidthValue, 0)
        .tick(0)
        .textAt(-plateWidthValue / 2, -14, `${Math.round(plateWidthValue)} mm`, "middle", "base-dim");

      dim
        .moveToAbs(planLeftDimX, planCenterY - plateDepthValue / 2)
        .tick(-Math.PI / 2)
        .lineTo(0, plateDepthValue)
        .tick(Math.PI / 2)
        .textAt(-14, -plateDepthValue / 2, `${Math.round(plateDepthValue)} mm`, "end", "base-dim");

      dim
        .moveToAbs(planCenterX - boltOffsetXValue, boltXDimY)
        .tick(0)
        .lineTo(2 * boltOffsetXValue, 0)
        .tick(0)
        .textAt(-boltOffsetXValue, -12, `${Math.round(2 * boltOffsetXValue)} mm`, "middle", "base-dim");

      dim
        .moveToAbs(boltYDimX, planCenterY - boltOffsetYValue)
        .tick(-Math.PI / 2)
        .lineTo(0, 2 * boltOffsetYValue)
        .tick(Math.PI / 2)
        .textAt(12, -boltOffsetYValue, `${Math.round(2 * boltOffsetYValue)} mm`, "start", "base-dim");

      dim
        .moveToAbs(elevationCenterX - columnWidthValue / 2, columnDimY)
        .tick(0)
        .lineTo(columnWidthValue, 0)
        .tick(0)
        .textAt(-columnWidthValue / 2, -12, `${Math.round(columnWidthValue)} mm`, "middle", "base-dim");

      dim
        .moveToAbs(plateDimX, plateBottom)
        .tick(-Math.PI / 2)
        .lineTo(0, plateThicknessValue)
        .tick(Math.PI / 2)
        .textAt(11, -plateThicknessValue / 2, `${Math.round(plateThicknessValue)} mm`, "start", "base-dim");

      dim
        .moveToAbs(groutDimX, plateBottom)
        .tick(-Math.PI / 2)
        .lineTo(0, -groutThicknessValue)
        .tick(Math.PI / 2)
        .textAt(-10, groutThicknessValue / 2, `${Math.round(groutThicknessValue)} mm`, "end", "base-dim");

      const note = dimensions.dimension({ className: "base-note" });
      note
        .moveToAbs(0, 0)
        .textAtAbs(elevationCenterX, columnTop + 34, "FRONT ELEVATION", "middle", "base-note")
        .textAtAbs(planCenterX, planCenterY + plateDepthValue / 2 + 44, "PLAN VIEW", "middle", "base-note");
    });
  };

  $effect(() => {
    if (!scene) return;
    Object.assign(scene.params, {
      columnWidth,
      columnHeight,
      plateWidth,
      plateDepth,
      plateThickness,
      boltOffsetX,
      boltOffsetY,
      boltDiameter,
      cornerRadius,
      groutThickness,
    });
  });
</script>

<ExampleLayout
  initialParams={{
    columnWidth,
    columnHeight,
    plateWidth,
    plateDepth,
    plateThickness,
    boltOffsetX,
    boltOffsetY,
    boltDiameter,
    cornerRadius,
    groutThickness,
  }}
  {onSetup}
>
  {#snippet params()}
    <div class="demo-control">
      <label>
        Column
        <input type="range" bind:value={columnWidth} min={80} max={180} step={1} />
      </label>
      <span class="value">{columnWidth}</span>
    </div>
    <div class="demo-control">
      <label>
        Plate W
        <input type="range" bind:value={plateWidth} min={170} max={320} step={1} />
      </label>
      <span class="value">{plateWidth}</span>
    </div>
    <div class="demo-control">
      <label>
        Plate D
        <input type="range" bind:value={plateDepth} min={130} max={260} step={1} />
      </label>
      <span class="value">{plateDepth}</span>
    </div>
    <div class="demo-control">
      <label>
        Plate t
        <input type="range" bind:value={plateThickness} min={12} max={45} step={1} />
      </label>
      <span class="value">{plateThickness}</span>
    </div>
    <div class="demo-control">
      <label>
        Bolt Dia
        <input type="range" bind:value={boltDiameter} min={12} max={30} step={1} />
      </label>
      <span class="value">{boltDiameter}</span>
    </div>
    <div class="demo-control">
      <label>
        Corner R
        <input type="range" bind:value={cornerRadius} min={0} max={30} step={1} />
      </label>
      <span class="value">{cornerRadius}</span>
    </div>
  {/snippet}
</ExampleLayout>

<style>
  :global(.pluton-root .pluton-geometry path.demo-base-column) {
    stroke: #0f766e;
    stroke-width: 1.2;
  }

  :global(.pluton-root .pluton-geometry path.demo-base-plate) {
    stroke: #334155;
    stroke-width: 1.2;
  }

  :global(.pluton-root .pluton-geometry path.demo-base-bolt) {
    stroke: #6b1d1d;
    stroke-width: 0.95;
  }

  :global(.pluton-root .pluton-geometry path.demo-base-hole) {
    stroke: #7f1d1d;
    stroke-width: 0.95;
  }

  :global(.pluton-root .pluton-geometry path.demo-base-weld) {
    --hatch-fill-override: rgba(180, 83, 9, 0.45);
    stroke: rgba(146, 64, 14, 0.85);
    stroke-width: 0.95;
  }

  :global(.pluton-root .pluton-geometry path.demo-base-centerline) {
    --hatch-fill-override: none;
    stroke: rgba(20, 83, 45, 0.64);
    stroke-dasharray: 0.32em;
    stroke-width: 0.92;
  }

  :global(.pluton-root .pluton-geometry path.demo-base-grout) {
    --hatch-fill-override: none;
    stroke: rgba(71, 85, 105, 0.78);
    stroke-dasharray: 0.32em;
    stroke-width: 0.92;
  }

  :global(.pluton-root .pluton-geometry path.demo-base-concrete) {
    stroke: rgba(100, 116, 139, 0.9);
    stroke-width: 0.95;
  }

  :global(.pluton-root .pluton-dimensions .pluton-dim-stroke.base-dim) {
    stroke: rgba(78, 94, 96, 0.9);
  }

  :global(.pluton-root .pluton-dimensions .pluton-dim-filled.base-dim) {
    fill: rgba(78, 94, 96, 0.9);
  }

  :global(.pluton-root .pluton-dimensions text.base-dim) {
    fill: rgba(78, 94, 96, 0.95);
    font-size: 10px;
    letter-spacing: 0.03em;
  }

  :global(.pluton-root .pluton-dimensions text.base-note) {
    fill: rgba(47, 83, 88, 0.9);
    font-size: 10px;
    letter-spacing: 0.07em;
    font-weight: 500;
  }
</style>
