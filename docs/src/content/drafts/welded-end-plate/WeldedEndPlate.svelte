<script lang="ts">
  import { Pluton2D } from "pluton-2d";
  import ExampleLayout from "@examples/components/ExampleLayout.svelte";

  type SceneParams = {
    beamDepth: number;
    flangeWidth: number;
    plateThickness: number;
    boltRows: number;
    boltPitch: number;
    boltGauge: number;
    boltDiameter: number;
    edgeDistance: number;
    weldSize: number;
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

  const ELEVATION_ORIGIN_X = -170;
  const BEAM_LENGTH = 210;
  const SUPPORT_GAP_TO_PLATE = 22;
  const SUPPORT_THICKNESS = 34;
  const END_VIEW_CENTER_X = 190;
  const END_VIEW_CENTER_Y = 0;
  const END_VIEW_PLATE_CORNER_RADIUS = 10;
  const MIN_WELD_SIZE = 6;

  let beamDepth = $state(240);
  let flangeWidth = $state(160);
  let plateThickness = $state(20);
  let boltRows = $state(4);
  let boltPitch = $state(58);
  let boltGauge = $state(92);
  let boltDiameter = $state(20);
  let edgeDistance = $state(34);
  let weldSize = $state(10);

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

    if (rr === 0) {
      appendRectangle(path, left, bottom, right, top);
      return;
    }

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

    const steelFillId = sceneInstance.addHatchFill("#0f766e", 0.14);
    const plateFillId = sceneInstance.addHatchFill("#334155", 0.18);
    const boltFillId = sceneInstance.addHatchFill("#7f1d1d", 0.15);

    sceneInstance.draw((params) => {
      const beamDepthValue = params.beamDepth;
      const flangeWidthValue = params.flangeWidth;
      const plateThicknessValue = params.plateThickness;
      const boltRowCount = Math.max(2, Math.round(params.boltRows));
      const boltRadius = params.boltDiameter / 2;
      const edgeDistanceValue = params.edgeDistance;
      const flangeThicknessValue = Math.max(12, beamDepthValue * 0.11);
      const webThicknessValue = Math.max(10, Math.min(20, flangeWidthValue * 0.15));
      const elevationOriginX = ELEVATION_ORIGIN_X;
      const beamLength = BEAM_LENGTH;
      const beamStartX = elevationOriginX - beamLength;
      const beamEndX = elevationOriginX;
      const plateLeft = beamEndX;
      const plateRight = plateLeft + plateThicknessValue;
      const gapToSupport = SUPPORT_GAP_TO_PLATE;
      const supportT = SUPPORT_THICKNESS;
      const supportLeft = plateRight + gapToSupport;
      const supportRight = supportLeft + supportT;

      const minPlateH = beamDepthValue + 86;
      const targetPlateH = 2 * edgeDistanceValue + (boltRowCount - 1) * params.boltPitch + params.boltDiameter + 16;
      const plateHeight = Math.max(minPlateH, targetPlateH);
      const halfPlateH = plateHeight / 2;

      const maxPitch = boltRowCount > 1 ? (plateHeight - 2 * edgeDistanceValue - params.boltDiameter) / (boltRowCount - 1) : 0;
      const pitch = boltRowCount > 1 ? Math.max(34, Math.min(params.boltPitch, maxPitch)) : 0;
      const boltYTop = ((boltRowCount - 1) * pitch) / 2;

      const plateWidth = Math.max(flangeWidthValue + 96, 2 * edgeDistanceValue + params.boltGauge + params.boltDiameter + 16);
      const gauge = Math.max(36, Math.min(params.boltGauge, plateWidth - 2 * edgeDistanceValue - params.boltDiameter));

      const elevBoltX = plateLeft + plateThicknessValue / 2;
      const elevAnchorX = supportLeft + supportT / 2;

      appendRectangle(
        geometry.path({ className: "demo-weld-support", fill: steelFillId }),
        supportLeft,
        -halfPlateH - 34,
        supportRight,
        halfPlateH + 34,
      );

      const beamPath = geometry.path({ className: "demo-weld-beam", fill: steelFillId });
      appendRectangle(beamPath, beamStartX, beamDepthValue / 2 - flangeThicknessValue, beamEndX, beamDepthValue / 2);
      appendRectangle(beamPath, beamStartX, -beamDepthValue / 2, beamEndX, -beamDepthValue / 2 + flangeThicknessValue);
      appendRectangle(beamPath, beamStartX, -webThicknessValue / 2, beamEndX, webThicknessValue / 2);

      appendRectangle(
        geometry.path({ className: "demo-weld-plate", fill: plateFillId }),
        plateLeft,
        -halfPlateH,
        plateRight,
        halfPlateH,
      );

      const bolts = geometry.path({ className: "demo-weld-bolts", fill: boltFillId });
      const boltLinks = geometry.path({ className: "demo-weld-bolt-links" });
      for (let i = 0; i < boltRowCount; i++) {
        const y = boltYTop - i * pitch;
        appendCircle(bolts, elevBoltX, y, boltRadius * 0.88);
        appendCircle(bolts, elevAnchorX, y, boltRadius * 0.78);
        boltLinks.moveToAbs(plateRight, y).lineToAbs(supportLeft, y);
      }

      const weld = geometry.path({ className: "demo-weld-symbol" });
      const w = Math.max(MIN_WELD_SIZE, params.weldSize);
      weld
        .moveToAbs(beamEndX, beamDepthValue / 2 - flangeThicknessValue)
        .lineTo(w, 0)
        .lineTo(0, -w)
        .close()
        .moveToAbs(beamEndX, -beamDepthValue / 2 + flangeThicknessValue)
        .lineTo(w, 0)
        .lineTo(0, w)
        .close();

      const endViewCenterX = END_VIEW_CENTER_X;
      const endViewCenterY = END_VIEW_CENTER_Y;

      appendRoundedRectangle(
        geometry.path({ className: "demo-weld-plate", fill: plateFillId }),
        endViewCenterX,
        endViewCenterY,
        plateWidth,
        plateHeight,
        END_VIEW_PLATE_CORNER_RADIUS,
      );

      const beamEndPath = geometry.path({ className: "demo-weld-beam", fill: steelFillId });
      appendRectangle(
        beamEndPath,
        endViewCenterX - flangeWidthValue / 2,
        endViewCenterY + beamDepthValue / 2 - flangeThicknessValue,
        endViewCenterX + flangeWidthValue / 2,
        endViewCenterY + beamDepthValue / 2,
      );
      appendRectangle(
        beamEndPath,
        endViewCenterX - flangeWidthValue / 2,
        endViewCenterY - beamDepthValue / 2,
        endViewCenterX + flangeWidthValue / 2,
        endViewCenterY - beamDepthValue / 2 + flangeThicknessValue,
      );
      appendRectangle(
        beamEndPath,
        endViewCenterX - webThicknessValue / 2,
        endViewCenterY - beamDepthValue / 2 + flangeThicknessValue,
        endViewCenterX + webThicknessValue / 2,
        endViewCenterY + beamDepthValue / 2 - flangeThicknessValue,
      );

      const endBolts = geometry.path({ className: "demo-weld-bolts", fill: boltFillId });
      for (const sx of [-1, 1]) {
        for (let i = 0; i < boltRowCount; i++) {
          const y = endViewCenterY + boltYTop - i * pitch;
          const x = endViewCenterX + (sx * gauge) / 2;
          appendCircle(endBolts, x, y, boltRadius);
        }
      }

      geometry
        .path({ className: "demo-weld-centerline" })
        .moveToAbs(endViewCenterX - plateWidth * 0.55, endViewCenterY)
        .lineToAbs(endViewCenterX + plateWidth * 0.55, endViewCenterY)
        .moveToAbs(endViewCenterX, endViewCenterY - plateHeight * 0.55)
        .lineToAbs(endViewCenterX, endViewCenterY + plateHeight * 0.55);

      const dim = dimensions.dimension({ className: "weld-dim" });

      dim
        .moveToAbs(beamStartX - 24, -beamDepthValue / 2)
        .tick(-Math.PI / 2)
        .lineTo(0, beamDepthValue)
        .tick(Math.PI / 2)
        .textAt(12, -beamDepthValue / 2 - 24, `${Math.round(beamDepthValue)} mm`, "start", "weld-dim");

      dim
        .moveToAbs(plateLeft, halfPlateH + 22)
        .tick(0)
        .lineTo(plateThicknessValue, 0)
        .tick(0)
        .textAt(-plateThicknessValue / 2, -10, `${Math.round(plateThicknessValue)} mm`, "middle", "weld-dim");

      dim
        .moveToAbs(endViewCenterX - gauge / 2, endViewCenterY + halfPlateH + 24)
        .tick(0)
        .lineTo(gauge, 0)
        .tick(0)
        .textAt(-gauge / 2, -10, `${Math.round(gauge)} mm`, "middle", "weld-dim");

      if (boltRowCount > 1) {
        const stack = (boltRowCount - 1) * pitch;
        dim
          .moveToAbs(endViewCenterX + plateWidth / 2 + 30, endViewCenterY - boltYTop)
          .tick(-Math.PI / 2)
          .lineTo(0, stack)
          .tick(Math.PI / 2)
          .textAt(12, -stack / 2, `${Math.round(stack)} mm`, "start", "weld-dim");
      }

      dim
        .moveToAbs(endViewCenterX - plateWidth / 2 - 34, endViewCenterY - plateHeight / 2)
        .tick(-Math.PI / 2)
        .lineTo(0, plateHeight)
        .tick(Math.PI / 2)
        .textAt(-12, -plateHeight / 2, `${Math.round(plateHeight)} mm`, "end", "weld-dim");

      const note = dimensions.dimension({ className: "weld-note" });
      note
        .moveToAbs(0, 0)
        .textAtAbs(elevationOriginX - 70, halfPlateH + 42, "ELEVATION", "middle", "weld-note")
        .textAtAbs(endViewCenterX, halfPlateH + 42, "END VIEW", "middle", "weld-note")
        .textAtAbs(beamEndX + 16, beamDepthValue / 2 - flangeThicknessValue - 18, `a${Math.round(w)} WELD`, "start", "weld-note");
    });
  };

  $effect(() => {
    if (!scene) return;

    Object.assign(scene.params, {
      beamDepth,
      flangeWidth,
      plateThickness,
      boltRows,
      boltPitch,
      boltGauge,
      boltDiameter,
      edgeDistance,
      weldSize,
    });
  });
</script>

<ExampleLayout
  initialParams={{
    beamDepth,
    flangeWidth,
    plateThickness,
    boltRows,
    boltPitch,
    boltGauge,
    boltDiameter,
    edgeDistance,
    weldSize,
  }}
  {onSetup}
>
  <div class="demo-control">
    <label>
      Beam Depth
      <input type="range" bind:value={beamDepth} min={180} max={420} step={2} />
    </label>
    <span class="value">{beamDepth}</span>
  </div>
  <div class="demo-control">
    <label>
      Flange Width
      <input type="range" bind:value={flangeWidth} min={120} max={260} step={2} />
    </label>
    <span class="value">{flangeWidth}</span>
  </div>
  <div class="demo-control">
    <label>
      Plate t
      <input type="range" bind:value={plateThickness} min={12} max={38} step={1} />
    </label>
    <span class="value">{plateThickness}</span>
  </div>
  <div class="demo-control">
    <label>
      Bolt Rows
      <input type="range" bind:value={boltRows} min={2} max={6} step={1} />
    </label>
    <span class="value">{boltRows}</span>
  </div>
  <div class="demo-control">
    <label>
      Bolt Pitch
      <input type="range" bind:value={boltPitch} min={40} max={110} step={1} />
    </label>
    <span class="value">{boltPitch}</span>
  </div>
  <div class="demo-control">
    <label>
      Bolt Gauge
      <input type="range" bind:value={boltGauge} min={70} max={180} step={1} />
    </label>
    <span class="value">{boltGauge}</span>
  </div>
</ExampleLayout>

<style>
  :global(.pluton-root .pluton-geometry path.demo-weld-support) {
    stroke: rgba(8, 86, 78, 0.9);
    stroke-width: 1.2;
  }

  :global(.pluton-root .pluton-geometry path.demo-weld-beam) {
    stroke: rgba(8, 86, 78, 0.94);
    stroke-width: 1.2;
  }

  :global(.pluton-root .pluton-geometry path.demo-weld-plate) {
    stroke: rgba(51, 65, 85, 0.92);
    stroke-width: 1.2;
  }

  :global(.pluton-root .pluton-geometry path.demo-weld-bolts) {
    stroke: rgba(127, 29, 29, 0.88);
    stroke-width: 0.95;
  }

  :global(.pluton-root .pluton-geometry path.demo-weld-bolt-links) {
    fill: none;
    stroke: rgba(100, 116, 139, 0.72);
    stroke-dasharray: 0.32em;
    stroke-width: 0.92;
  }

  :global(.pluton-root .pluton-geometry path.demo-weld-symbol) {
    fill: rgba(180, 83, 9, 0.45);
    stroke: rgba(146, 64, 14, 0.85);
    stroke-width: 0.95;
  }

  :global(.pluton-root .pluton-geometry path.demo-weld-centerline) {
    fill: none;
    stroke: rgba(20, 83, 45, 0.64);
    stroke-dasharray: 0.32em;
    stroke-width: 0.92;
  }

  :global(.pluton-root .pluton-dimensions .pluton-dim-stroke.weld-dim) {
    stroke: rgba(78, 94, 96, 0.9);
  }

  :global(.pluton-root .pluton-dimensions .pluton-dim-filled.weld-dim) {
    fill: rgba(78, 94, 96, 0.9);
  }

  :global(.pluton-root .pluton-dimensions text.weld-dim) {
    fill: rgba(78, 94, 96, 0.95);
    font-size: 10px;
    letter-spacing: 0.03em;
  }

  :global(.pluton-root .pluton-dimensions text.weld-note) {
    fill: rgba(47, 83, 88, 0.9);
    font-size: 10px;
    letter-spacing: 0.07em;
    font-weight: 500;
  }
</style>
