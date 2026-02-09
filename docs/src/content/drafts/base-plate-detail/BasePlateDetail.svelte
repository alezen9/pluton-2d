<script lang="ts">
  import { Pluton2D } from "pluton-2d";
  import ExampleLayout from "@examples/components/ExampleLayout.svelte";

  type Params = {
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
  let scene: Pluton2D<Params> | null = null;

  const onSetup = (sceneInstance: Pluton2D<Params>) => {
    scene = sceneInstance;
    const geometryGroup = scene.geometry.group();
    const dimensionsGroup = scene.dimensions.group();

    const TEAL = "#0f766e";
    const SLATE = "#475569";
    const GRAY = "#64748b";
    const RED = "#7f1d1d";
    const ORANGE = "#92400e";
    const GREEN = "#14532d";

    const columnStroke = TEAL;
    const plateStroke = SLATE;
    const concreteStroke = GRAY;
    const boltStroke = RED;
    const weldStroke = ORANGE;
    const groutStroke = SLATE;
    const centerlineStroke = GREEN;

    const columnFillId = scene.addHatchFill(TEAL, 0.2);
    const plateFillId = scene.addHatchFill(SLATE, 0.15);
    const concreteFillId = scene.addHatchFill(GRAY, 0.1);
    const boltFillId = scene.addHatchFill(RED, 0.14);
    const weldFillId = scene.addHatchFill(ORANGE, 0.2);

    const elevationCenterX = -210;
    const planCenterX = 210;
    const planCenterY = 34;
    const plateTopY = -44;

    const columnToPlateWidthClearance = 60;
    const concreteDepth = 70;
    const concreteHalfWidthFactor = 0.6;
    const groutLineHalfWidthFactor = 0.56;
    const boltOffsetLimitFactor = 0.38;

    const frontPlateRadiusFactor = 0.45;
    const frontPlateRadiusThicknessFactor = 0.3;
    const minimumCornerRadius = 0.0001;

    const anchorBottomClearance = 10;
    const anchorTopExtension = 26;
    const washerTopOffset = 3;
    const rodWidthMin = 8;
    const rodWidthFactor = 0.88;
    const washerWidthFactor = 0.82;
    const nutWidthFactor = 0.72;
    const washerHeightMin = 4;
    const washerHeightFactor = 0.26;
    const nutHeightMin = 8;
    const nutHeightFactor = 0.62;

    const weldSizeMin = 9;
    const weldSizeFactor = 0.08;

    const centerlineExtensionFactor = 0.52;

    const planTopDimensionOffset = 28;
    const planLeftDimensionOffset = 34;
    const boltXDimensionOffset = 22;
    const boltYDimensionOffset = 30;
    const columnDimensionOffset = 22;
    const plateThicknessDimensionOffset = 34;
    const groutDimensionFactor = 0.66;

    const planWidthTextOffsetY = -14;
    const planDepthTextOffsetX = -14;
    const boltXTextOffsetY = -12;
    const boltYTextOffsetX = 12;
    const columnTextOffsetY = -12;
    const plateThicknessTextOffsetX = 11;
    const groutTextOffsetX = -10;

    const viewLabelOffsetY = 42;

    type PathBuilder = ReturnType<typeof geometryGroup.path>;

    const drawRoundedRectangle = (
      path: PathBuilder,
      leftX: number,
      rightX: number,
      topY: number,
      bottomY: number,
      radius: number,
    ) => {
      const safeRadius = Math.max(
        minimumCornerRadius,
        Math.min(radius, (rightX - leftX) / 2, (topY - bottomY) / 2),
      );

      path
        .moveToAbs(leftX + safeRadius, topY)
        .lineToAbs(rightX - safeRadius, topY)
        .arcToAbs(rightX, topY - safeRadius, safeRadius, true)
        .lineToAbs(rightX, bottomY + safeRadius)
        .arcToAbs(rightX - safeRadius, bottomY, safeRadius, true)
        .lineToAbs(leftX + safeRadius, bottomY)
        .arcToAbs(leftX, bottomY + safeRadius, safeRadius, true)
        .lineToAbs(leftX, topY - safeRadius)
        .arcToAbs(leftX + safeRadius, topY, safeRadius, true)
        .close();
    };

    const drawFrontConcrete = (
      plateWidthValue: number,
      concreteBottomY: number,
      concreteTopY: number,
    ) => {
      geometryGroup
        .path({ stroke: concreteStroke, fill: concreteFillId })
        .moveToAbs(
          elevationCenterX - plateWidthValue * concreteHalfWidthFactor,
          concreteBottomY,
        )
        .lineToAbs(
          elevationCenterX + plateWidthValue * concreteHalfWidthFactor,
          concreteBottomY,
        )
        .lineToAbs(
          elevationCenterX + plateWidthValue * concreteHalfWidthFactor,
          concreteTopY,
        )
        .lineToAbs(
          elevationCenterX - plateWidthValue * concreteHalfWidthFactor,
          concreteTopY,
        )
        .close();
    };

    const drawGroutLine = (plateWidthValue: number, concreteTopY: number) => {
      geometryGroup
        .path({ stroke: groutStroke })
        .moveToAbs(
          elevationCenterX - plateWidthValue * groutLineHalfWidthFactor,
          concreteTopY,
        )
        .lineToAbs(
          elevationCenterX + plateWidthValue * groutLineHalfWidthFactor,
          concreteTopY,
        );
    };

    const drawFrontPlate = (
      plateWidthValue: number,
      plateThicknessValue: number,
      plateBottomY: number,
      cornerRadiusValue: number,
    ) => {
      const leftX = elevationCenterX - plateWidthValue / 2;
      const rightX = elevationCenterX + plateWidthValue / 2;
      const radius = Math.min(
        cornerRadiusValue * frontPlateRadiusFactor,
        plateThicknessValue * frontPlateRadiusThicknessFactor,
        plateWidthValue / 2,
        plateThicknessValue / 2,
      );

      drawRoundedRectangle(
        geometryGroup.path({ stroke: plateStroke, fill: plateFillId }),
        leftX,
        rightX,
        plateTopY,
        plateBottomY,
        radius,
      );
    };

    const drawFrontColumn = (columnWidthValue: number, columnTopY: number) => {
      geometryGroup
        .path({ stroke: columnStroke, fill: columnFillId })
        .moveToAbs(elevationCenterX - columnWidthValue / 2, plateTopY)
        .lineToAbs(elevationCenterX + columnWidthValue / 2, plateTopY)
        .lineToAbs(elevationCenterX + columnWidthValue / 2, columnTopY)
        .lineToAbs(elevationCenterX - columnWidthValue / 2, columnTopY)
        .close();
    };

    const drawAnchors = (
      boltOffsetXValue: number,
      boltRadius: number,
      concreteBottomY: number,
    ) => {
      const rodWidth = Math.max(rodWidthMin, boltRadius * rodWidthFactor);
      const rodBottomY = concreteBottomY + anchorBottomClearance;
      const rodTopY = plateTopY + anchorTopExtension;
      const washerHeight = Math.max(washerHeightMin, rodWidth * washerHeightFactor);
      const nutHeight = Math.max(nutHeightMin, rodWidth * nutHeightFactor);
      const leftBoltCenterX = elevationCenterX - boltOffsetXValue;
      const rightBoltCenterX = elevationCenterX + boltOffsetXValue;

      geometryGroup
        .path({ stroke: boltStroke, fill: boltFillId })
        .moveToAbs(leftBoltCenterX - rodWidth / 2, rodBottomY)
        .lineToAbs(leftBoltCenterX + rodWidth / 2, rodBottomY)
        .lineToAbs(leftBoltCenterX + rodWidth / 2, rodTopY)
        .lineToAbs(leftBoltCenterX - rodWidth / 2, rodTopY)
        .close()
        .moveToAbs(leftBoltCenterX - rodWidth * washerWidthFactor, plateTopY + washerTopOffset)
        .lineToAbs(leftBoltCenterX + rodWidth * washerWidthFactor, plateTopY + washerTopOffset)
        .lineToAbs(
          leftBoltCenterX + rodWidth * washerWidthFactor,
          plateTopY + washerTopOffset + washerHeight,
        )
        .lineToAbs(
          leftBoltCenterX - rodWidth * washerWidthFactor,
          plateTopY + washerTopOffset + washerHeight,
        )
        .close()
        .moveToAbs(
          leftBoltCenterX - rodWidth * nutWidthFactor,
          plateTopY + washerTopOffset + washerHeight,
        )
        .lineToAbs(
          leftBoltCenterX + rodWidth * nutWidthFactor,
          plateTopY + washerTopOffset + washerHeight,
        )
        .lineToAbs(
          leftBoltCenterX + rodWidth * nutWidthFactor,
          plateTopY + washerTopOffset + washerHeight + nutHeight,
        )
        .lineToAbs(
          leftBoltCenterX - rodWidth * nutWidthFactor,
          plateTopY + washerTopOffset + washerHeight + nutHeight,
        )
        .close()
        .moveToAbs(rightBoltCenterX - rodWidth / 2, rodBottomY)
        .lineToAbs(rightBoltCenterX + rodWidth / 2, rodBottomY)
        .lineToAbs(rightBoltCenterX + rodWidth / 2, rodTopY)
        .lineToAbs(rightBoltCenterX - rodWidth / 2, rodTopY)
        .close()
        .moveToAbs(rightBoltCenterX - rodWidth * washerWidthFactor, plateTopY + washerTopOffset)
        .lineToAbs(rightBoltCenterX + rodWidth * washerWidthFactor, plateTopY + washerTopOffset)
        .lineToAbs(
          rightBoltCenterX + rodWidth * washerWidthFactor,
          plateTopY + washerTopOffset + washerHeight,
        )
        .lineToAbs(
          rightBoltCenterX - rodWidth * washerWidthFactor,
          plateTopY + washerTopOffset + washerHeight,
        )
        .close()
        .moveToAbs(
          rightBoltCenterX - rodWidth * nutWidthFactor,
          plateTopY + washerTopOffset + washerHeight,
        )
        .lineToAbs(
          rightBoltCenterX + rodWidth * nutWidthFactor,
          plateTopY + washerTopOffset + washerHeight,
        )
        .lineToAbs(
          rightBoltCenterX + rodWidth * nutWidthFactor,
          plateTopY + washerTopOffset + washerHeight + nutHeight,
        )
        .lineToAbs(
          rightBoltCenterX - rodWidth * nutWidthFactor,
          plateTopY + washerTopOffset + washerHeight + nutHeight,
        )
        .close();
    };

    const drawWelds = (columnWidthValue: number) => {
      const weldSize = Math.max(weldSizeMin, columnWidthValue * weldSizeFactor);
      const leftTopX = elevationCenterX - columnWidthValue / 2;
      const rightTopX = elevationCenterX + columnWidthValue / 2;
      const leftBottomX = leftTopX - weldSize;
      const rightBottomX = rightTopX + weldSize;

      geometryGroup
        .path({ stroke: weldStroke, fill: weldFillId })
        .moveToAbs(leftTopX, plateTopY - weldSize)
        .lineToAbs(rightTopX, plateTopY - weldSize)
        .lineToAbs(rightBottomX, plateTopY)
        .lineToAbs(leftBottomX, plateTopY)
        .close();
    };

    const drawPlanPlate = (
      plateWidthValue: number,
      plateDepthValue: number,
      cornerRadiusValue: number,
    ) => {
      const leftX = planCenterX - plateWidthValue / 2;
      const rightX = planCenterX + plateWidthValue / 2;
      const topY = planCenterY + plateDepthValue / 2;
      const bottomY = planCenterY - plateDepthValue / 2;
      const radius = Math.min(cornerRadiusValue, plateWidthValue / 2, plateDepthValue / 2);

      drawRoundedRectangle(
        geometryGroup.path({ stroke: plateStroke, fill: plateFillId }),
        leftX,
        rightX,
        topY,
        bottomY,
        radius,
      );
    };

    const drawPlanColumn = (columnWidthValue: number) => {
      geometryGroup
        .path({ stroke: columnStroke, fill: columnFillId })
        .moveToAbs(planCenterX - columnWidthValue / 2, planCenterY + columnWidthValue / 2)
        .lineToAbs(planCenterX + columnWidthValue / 2, planCenterY + columnWidthValue / 2)
        .lineToAbs(planCenterX + columnWidthValue / 2, planCenterY - columnWidthValue / 2)
        .lineToAbs(planCenterX - columnWidthValue / 2, planCenterY - columnWidthValue / 2)
        .close();
    };

    const drawBoltHoles = (
      boltOffsetXValue: number,
      boltOffsetYValue: number,
      boltRadius: number,
    ) => {
      const topLeftHoleX = planCenterX - boltOffsetXValue;
      const topLeftHoleY = planCenterY + boltOffsetYValue;
      const topRightHoleX = planCenterX + boltOffsetXValue;
      const topRightHoleY = planCenterY + boltOffsetYValue;
      const bottomRightHoleX = planCenterX + boltOffsetXValue;
      const bottomRightHoleY = planCenterY - boltOffsetYValue;
      const bottomLeftHoleX = planCenterX - boltOffsetXValue;
      const bottomLeftHoleY = planCenterY - boltOffsetYValue;

      geometryGroup
        .path({ stroke: boltStroke, fill: boltFillId })
        .moveToAbs(topLeftHoleX - boltRadius, topLeftHoleY)
        .arcToAbs(topLeftHoleX, topLeftHoleY + boltRadius, boltRadius, true)
        .arcToAbs(topLeftHoleX + boltRadius, topLeftHoleY, boltRadius, true)
        .arcToAbs(topLeftHoleX, topLeftHoleY - boltRadius, boltRadius, true)
        .arcToAbs(topLeftHoleX - boltRadius, topLeftHoleY, boltRadius, true)
        .close()
        .moveToAbs(topRightHoleX - boltRadius, topRightHoleY)
        .arcToAbs(topRightHoleX, topRightHoleY + boltRadius, boltRadius, true)
        .arcToAbs(topRightHoleX + boltRadius, topRightHoleY, boltRadius, true)
        .arcToAbs(topRightHoleX, topRightHoleY - boltRadius, boltRadius, true)
        .arcToAbs(topRightHoleX - boltRadius, topRightHoleY, boltRadius, true)
        .close()
        .moveToAbs(bottomRightHoleX - boltRadius, bottomRightHoleY)
        .arcToAbs(bottomRightHoleX, bottomRightHoleY + boltRadius, boltRadius, true)
        .arcToAbs(bottomRightHoleX + boltRadius, bottomRightHoleY, boltRadius, true)
        .arcToAbs(bottomRightHoleX, bottomRightHoleY - boltRadius, boltRadius, true)
        .arcToAbs(bottomRightHoleX - boltRadius, bottomRightHoleY, boltRadius, true)
        .close()
        .moveToAbs(bottomLeftHoleX - boltRadius, bottomLeftHoleY)
        .arcToAbs(bottomLeftHoleX, bottomLeftHoleY + boltRadius, boltRadius, true)
        .arcToAbs(bottomLeftHoleX + boltRadius, bottomLeftHoleY, boltRadius, true)
        .arcToAbs(bottomLeftHoleX, bottomLeftHoleY - boltRadius, boltRadius, true)
        .arcToAbs(bottomLeftHoleX - boltRadius, bottomLeftHoleY, boltRadius, true)
        .close();
    };

    const drawCenterlines = (
      plateWidthValue: number,
      plateDepthValue: number,
    ) => {
      geometryGroup
        .path({ stroke: centerlineStroke })
        .moveToAbs(
          planCenterX - plateWidthValue * centerlineExtensionFactor,
          planCenterY,
        )
        .lineToAbs(
          planCenterX + plateWidthValue * centerlineExtensionFactor,
          planCenterY,
        )
        .moveToAbs(
          planCenterX,
          planCenterY - plateDepthValue * centerlineExtensionFactor,
        )
        .lineToAbs(
          planCenterX,
          planCenterY + plateDepthValue * centerlineExtensionFactor,
        );
    };

    const drawDimensions = (
      plateWidthValue: number,
      plateDepthValue: number,
      boltOffsetXValue: number,
      boltOffsetYValue: number,
      columnWidthValue: number,
      plateThicknessValue: number,
      groutThicknessValue: number,
      plateBottomY: number,
      planTopDimensionY: number,
      planLeftDimensionX: number,
      boltXDimensionY: number,
      boltYDimensionX: number,
      columnDimensionY: number,
      plateThicknessDimensionX: number,
      groutDimensionX: number,
    ) => {
      const dimensions = dimensionsGroup.dimension();

      dimensions
        .moveToAbs(planCenterX - plateWidthValue / 2, planTopDimensionY)
        .tick(0)
        .lineTo(plateWidthValue, 0)
        .tick(0)
        .textAt(
          -plateWidthValue / 2,
          planWidthTextOffsetY,
          `${Math.round(plateWidthValue)} mm`,
          "middle",
        );

      dimensions
        .moveToAbs(planLeftDimensionX, planCenterY - plateDepthValue / 2)
        .tick(-Math.PI / 2)
        .lineTo(0, plateDepthValue)
        .tick(Math.PI / 2)
        .textAt(
          planDepthTextOffsetX,
          -plateDepthValue / 2,
          `${Math.round(plateDepthValue)} mm`,
          "end",
        );

      dimensions
        .moveToAbs(planCenterX - boltOffsetXValue, boltXDimensionY)
        .tick(0)
        .lineTo(2 * boltOffsetXValue, 0)
        .tick(0)
        .textAt(
          -boltOffsetXValue,
          boltXTextOffsetY,
          `${Math.round(2 * boltOffsetXValue)} mm`,
          "middle",
        );

      dimensions
        .moveToAbs(boltYDimensionX, planCenterY - boltOffsetYValue)
        .tick(-Math.PI / 2)
        .lineTo(0, 2 * boltOffsetYValue)
        .tick(Math.PI / 2)
        .textAt(
          boltYTextOffsetX,
          -boltOffsetYValue,
          `${Math.round(2 * boltOffsetYValue)} mm`,
          "start",
        );

      dimensions
        .moveToAbs(elevationCenterX - columnWidthValue / 2, columnDimensionY)
        .tick(0)
        .lineTo(columnWidthValue, 0)
        .tick(0)
        .textAt(
          -columnWidthValue / 2,
          columnTextOffsetY,
          `${Math.round(columnWidthValue)} mm`,
          "middle",
        );

      dimensions
        .moveToAbs(plateThicknessDimensionX, plateBottomY)
        .tick(-Math.PI / 2)
        .lineTo(0, plateThicknessValue)
        .tick(Math.PI / 2)
        .textAt(
          plateThicknessTextOffsetX,
          -plateThicknessValue / 2,
          `${Math.round(plateThicknessValue)} mm`,
          "start",
        );

      dimensions
        .moveToAbs(groutDimensionX, plateBottomY)
        .tick(-Math.PI / 2)
        .lineTo(0, -groutThicknessValue)
        .tick(Math.PI / 2)
        .textAt(
          groutTextOffsetX,
          groutThicknessValue / 2,
          `${Math.round(groutThicknessValue)} mm`,
          "end",
        );
    };

    const drawViewLabels = (
      columnTopY: number,
      plateDepthValue: number,
    ) => {
      const highestGeometryY = Math.max(columnTopY, planCenterY + plateDepthValue / 2);
      const viewLabelY = highestGeometryY + viewLabelOffsetY;

      dimensionsGroup
        .dimension()
        .moveToAbs(0, 0)
        .textAtAbs(elevationCenterX, viewLabelY, "FRONT ELEVATION", "middle")
        .textAtAbs(planCenterX, viewLabelY, "PLAN VIEW", "middle");
    };

    scene.draw((p) => {
      const plateWidthValue = Math.max(
        p.plateWidth,
        p.columnWidth + columnToPlateWidthClearance,
      );
      const plateDepthValue = p.plateDepth;
      const plateThicknessValue = p.plateThickness;
      const boltOffsetXValue = Math.min(
        p.boltOffsetX,
        plateWidthValue * boltOffsetLimitFactor,
      );
      const boltOffsetYValue = Math.min(
        p.boltOffsetY,
        plateDepthValue * boltOffsetLimitFactor,
      );
      const boltRadius = p.boltDiameter / 2;
      const cornerRadiusValue = Math.max(0, p.cornerRadius);
      const groutThicknessValue = p.groutThickness;

      const plateBottomY = plateTopY - plateThicknessValue;
      const columnTopY = plateTopY + p.columnHeight;
      const concreteTopY = plateBottomY - groutThicknessValue;
      const concreteBottomY = concreteTopY - concreteDepth;

      const planTopDimensionY =
        planCenterY + plateDepthValue / 2 + planTopDimensionOffset;
      const planLeftDimensionX =
        planCenterX - plateWidthValue / 2 - planLeftDimensionOffset;
      const boltXDimensionY =
        planCenterY - plateDepthValue / 2 - boltXDimensionOffset;
      const boltYDimensionX =
        planCenterX + plateWidthValue / 2 + boltYDimensionOffset;
      const columnDimensionY = columnTopY + columnDimensionOffset;
      const plateThicknessDimensionX =
        elevationCenterX + plateWidthValue / 2 + plateThicknessDimensionOffset;
      const groutDimensionX = elevationCenterX - plateWidthValue * groutDimensionFactor;

      drawFrontConcrete(plateWidthValue, concreteBottomY, concreteTopY);
      drawGroutLine(plateWidthValue, concreteTopY);
      drawFrontPlate(
        plateWidthValue,
        plateThicknessValue,
        plateBottomY,
        cornerRadiusValue,
      );
      drawFrontColumn(p.columnWidth, columnTopY);
      drawWelds(p.columnWidth);
      drawAnchors(boltOffsetXValue, boltRadius, concreteBottomY);

      drawPlanPlate(plateWidthValue, plateDepthValue, cornerRadiusValue);
      drawPlanColumn(p.columnWidth);
      drawBoltHoles(boltOffsetXValue, boltOffsetYValue, boltRadius);
      drawCenterlines(plateWidthValue, plateDepthValue);

      drawDimensions(
        plateWidthValue,
        plateDepthValue,
        boltOffsetXValue,
        boltOffsetYValue,
        p.columnWidth,
        plateThicknessValue,
        groutThicknessValue,
        plateBottomY,
        planTopDimensionY,
        planLeftDimensionX,
        boltXDimensionY,
        boltYDimensionX,
        columnDimensionY,
        plateThicknessDimensionX,
        groutDimensionX,
      );
      drawViewLabels(columnTopY, plateDepthValue);
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
  {#snippet controls()}
    <div class="demo-control">
      <label>
        Column width
        <input type="range" bind:value={columnWidth} min={80} max={180} step={1} />
      </label>
      <span class="value">{columnWidth}</span>
    </div>
    <div class="demo-control">
      <label>
        Plate width
        <input type="range" bind:value={plateWidth} min={170} max={320} step={1} />
      </label>
      <span class="value">{plateWidth}</span>
    </div>
    <div class="demo-control">
      <label>
        Plate depth
        <input type="range" bind:value={plateDepth} min={130} max={260} step={1} />
      </label>
      <span class="value">{plateDepth}</span>
    </div>
    <div class="demo-control">
      <label>
        Plate thickness
        <input type="range" bind:value={plateThickness} min={12} max={45} step={1} />
      </label>
      <span class="value">{plateThickness}</span>
    </div>
    <div class="demo-control">
      <label>
        Bolt diameter
        <input type="range" bind:value={boltDiameter} min={12} max={30} step={1} />
      </label>
      <span class="value">{boltDiameter}</span>
    </div>
    <div class="demo-control">
      <label>
        Corner radius
        <input type="range" bind:value={cornerRadius} min={0} max={30} step={1} />
      </label>
      <span class="value">{cornerRadius}</span>
    </div>
  {/snippet}
</ExampleLayout>
