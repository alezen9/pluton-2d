<script lang="ts">
  import { Pluton2D } from "pluton-2d";
  import ExampleLayout from "@examples/components/ExampleLayout.svelte";

  type SceneParams = {
    roomWidth: number;
    roomDepth: number;
    wallThickness: number;
    doorWidth: number;
    windowWidth: number;
    windowOffset: number;
  };

  type GeometryPathBuilder = {
    moveToAbs: (x: number, y: number) => GeometryPathBuilder;
    lineToAbs: (x: number, y: number) => GeometryPathBuilder;
    close: () => GeometryPathBuilder;
  };

  let roomWidth = $state(560);
  let roomDepth = $state(430);
  let wallThickness = $state(26);
  let doorWidth = $state(94);
  let windowWidth = $state(150);
  let windowOffset = $state(0);

  let scene: Pluton2D<SceneParams> | null = null;

  const appendRectangle = (path: GeometryPathBuilder, x0: number, y0: number, x1: number, y1: number) => {
    path.moveToAbs(x0, y0).lineToAbs(x1, y0).lineToAbs(x1, y1).lineToAbs(x0, y1).close();
  };

  const appendArc = (
    path: GeometryPathBuilder,
    cx: number,
    cy: number,
    r: number,
    startAngle: number,
    endAngle: number,
    segments = 16,
  ) => {
    const step = (endAngle - startAngle) / segments;
    path.moveToAbs(cx + Math.cos(startAngle) * r, cy + Math.sin(startAngle) * r);
    for (let i = 1; i <= segments; i++) {
      const a = startAngle + i * step;
      path.lineToAbs(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    }
  };

  const onSetup = (sceneInstance: Pluton2D<SceneParams>) => {
    scene = sceneInstance;

    const geometry = sceneInstance.geometry.group();
    const dimensions = sceneInstance.dimensions.group();

    const furnitureFillId = sceneInstance.addHatchFill("#475569", 0.12);

    sceneInstance.draw((params) => {
      const roomWidthValue = params.roomWidth;
      const roomDepthValue = params.roomDepth;
      const wallThicknessValue = Math.max(16, Math.min(params.wallThickness, 46));

      const outerLeftX = -roomWidthValue / 2;
      const outerRightX = roomWidthValue / 2;
      const outerBottomY = -roomDepthValue / 2;
      const outerTopY = roomDepthValue / 2;

      const innerLeftX = outerLeftX + wallThicknessValue;
      const innerRightX = outerRightX - wallThicknessValue;
      const innerBottomY = outerBottomY + wallThicknessValue;
      const innerTopY = outerTopY - wallThicknessValue;

      const clearRoomWidth = innerRightX - innerLeftX;
      const clearRoomDepth = innerTopY - innerBottomY;

      const doorWidthValue = Math.max(68, Math.min(params.doorWidth, clearRoomWidth - 80));
      const doorLeft = Math.min(innerRightX - 28 - doorWidthValue, innerLeftX + 48);
      const doorRight = doorLeft + doorWidthValue;

      const maxWindowOffset = Math.max(0, (clearRoomWidth - params.windowWidth - 40) / 2);
      const windowCenter = Math.max(-maxWindowOffset, Math.min(params.windowOffset, maxWindowOffset));
      const windowWidthValue = Math.max(70, Math.min(params.windowWidth, clearRoomWidth - 40));
      const windowLeftX = windowCenter - windowWidthValue / 2;
      const windowRightX = windowCenter + windowWidthValue / 2;

      const walls = geometry.path({ className: "demo-room-walls" });

      walls.moveToAbs(outerLeftX, outerBottomY).lineToAbs(doorLeft, outerBottomY);
      walls.moveToAbs(doorRight, outerBottomY).lineToAbs(outerRightX, outerBottomY);
      walls.moveToAbs(outerRightX, outerBottomY).lineToAbs(outerRightX, outerTopY);
      walls.moveToAbs(outerRightX, outerTopY).lineToAbs(windowRightX, outerTopY);
      walls.moveToAbs(windowLeftX, outerTopY).lineToAbs(outerLeftX, outerTopY);
      walls.moveToAbs(outerLeftX, outerTopY).lineToAbs(outerLeftX, outerBottomY);

      walls.moveToAbs(innerLeftX, innerBottomY).lineToAbs(doorLeft, innerBottomY);
      walls.moveToAbs(doorRight, innerBottomY).lineToAbs(innerRightX, innerBottomY);
      walls.moveToAbs(innerRightX, innerBottomY).lineToAbs(innerRightX, innerTopY);
      walls.moveToAbs(innerRightX, innerTopY).lineToAbs(windowRightX, innerTopY);
      walls.moveToAbs(windowLeftX, innerTopY).lineToAbs(innerLeftX, innerTopY);
      walls.moveToAbs(innerLeftX, innerTopY).lineToAbs(innerLeftX, innerBottomY);

      walls.moveToAbs(doorLeft, outerBottomY).lineToAbs(doorLeft, innerBottomY);
      walls.moveToAbs(doorRight, outerBottomY).lineToAbs(doorRight, innerBottomY);
      walls.moveToAbs(windowLeftX, innerTopY).lineToAbs(windowLeftX, outerTopY);
      walls.moveToAbs(windowRightX, innerTopY).lineToAbs(windowRightX, outerTopY);

      const windowPath = geometry.path({ className: "demo-room-window" });
      const yW1 = outerTopY - wallThicknessValue * 0.34;
      const yW2 = outerTopY - wallThicknessValue * 0.66;
      windowPath
        .moveToAbs(windowLeftX, yW1)
        .lineToAbs(windowRightX, yW1)
        .moveToAbs(windowLeftX, yW2)
        .lineToAbs(windowRightX, yW2);

      const doorPath = geometry.path({ className: "demo-room-door" });
      const hingeX = doorLeft;
      const hingeY = innerBottomY;
      doorPath
        .moveToAbs(hingeX, hingeY)
        .lineToAbs(hingeX + doorWidthValue, hingeY)
        .moveToAbs(hingeX, hingeY)
        .lineToAbs(hingeX, hingeY + doorWidthValue);
      appendArc(doorPath, hingeX, hingeY, doorWidthValue, 0, Math.PI / 2, 14);

      const furniture = geometry.path({ className: "demo-room-furniture", fill: furnitureFillId });
      const tableW = Math.max(120, clearRoomWidth * 0.42);
      const tableD = Math.max(72, clearRoomDepth * 0.26);
      appendRectangle(furniture, -tableW / 2, -tableD / 2 + 20, tableW / 2, tableD / 2 + 20);

      const dim = dimensions.dimension({ className: "room-dim" });

      dim
        .moveToAbs(outerLeftX, outerTopY + 30)
        .tick(0)
        .lineTo(roomWidthValue, 0)
        .tick(0)
        .textAt(-roomWidthValue / 2, -12, `${Math.round(roomWidthValue)} mm`, "middle", "room-dim");

      dim
        .moveToAbs(outerLeftX - 34, outerBottomY)
        .tick(-Math.PI / 2)
        .lineTo(0, roomDepthValue)
        .tick(Math.PI / 2)
        .textAt(-12, -roomDepthValue / 2, `${Math.round(roomDepthValue)} mm`, "end", "room-dim");

      dim
        .moveToAbs(innerLeftX, outerBottomY - 26)
        .tick(0)
        .lineTo(clearRoomWidth, 0)
        .tick(0)
        .textAt(-clearRoomWidth / 2, -10, `${Math.round(clearRoomWidth)} mm clear`, "middle", "room-dim");

      dim
        .moveToAbs(outerRightX + 34, innerBottomY)
        .tick(-Math.PI / 2)
        .lineTo(0, clearRoomDepth)
        .tick(Math.PI / 2)
        .textAt(12, -clearRoomDepth / 2, `${Math.round(clearRoomDepth)} mm clear`, "start", "room-dim");

      dim
        .moveToAbs(doorLeft, outerBottomY - 48)
        .tick(0)
        .lineTo(doorWidthValue, 0)
        .tick(0)
        .textAt(-doorWidthValue / 2, -10, `${Math.round(doorWidthValue)} mm door`, "middle", "room-dim");

      dim
        .moveToAbs(windowLeftX, outerTopY + 56)
        .tick(0)
        .lineTo(windowWidthValue, 0)
        .tick(0)
        .textAt(-windowWidthValue / 2, -10, `${Math.round(windowWidthValue)} mm window`, "middle", "room-dim");

      const note = dimensions.dimension({ className: "room-note" });
      note
        .moveToAbs(0, 0)
        .textAtAbs(0, outerBottomY - 72, "ROOM MODULE PLAN", "middle", "room-note")
        .textAtAbs(0, outerBottomY - 88, `${Math.round(wallThicknessValue)} mm WALL`, "middle", "room-note");
    });
  };

  $effect(() => {
    if (!scene) return;

    Object.assign(scene.params, {
      roomWidth,
      roomDepth,
      wallThickness,
      doorWidth,
      windowWidth,
      windowOffset,
    });
  });
</script>

<ExampleLayout
  initialParams={{
    roomWidth,
    roomDepth,
    wallThickness,
    doorWidth,
    windowWidth,
    windowOffset,
  }}
  {onSetup}
>
  {#snippet params()}
    <div class="demo-control">
      <label>
        Width
        <input type="range" bind:value={roomWidth} min={380} max={860} step={4} />
      </label>
      <span class="value">{roomWidth}</span>
    </div>
    <div class="demo-control">
      <label>
        Depth
        <input type="range" bind:value={roomDepth} min={300} max={680} step={4} />
      </label>
      <span class="value">{roomDepth}</span>
    </div>
    <div class="demo-control">
      <label>
        Wall t
        <input type="range" bind:value={wallThickness} min={16} max={46} step={1} />
      </label>
      <span class="value">{wallThickness}</span>
    </div>
    <div class="demo-control">
      <label>
        Door
        <input type="range" bind:value={doorWidth} min={68} max={140} step={1} />
      </label>
      <span class="value">{doorWidth}</span>
    </div>
    <div class="demo-control">
      <label>
        Window
        <input type="range" bind:value={windowWidth} min={80} max={240} step={1} />
      </label>
      <span class="value">{windowWidth}</span>
    </div>
    <div class="demo-control">
      <label>
        Window Offset
        <input type="range" bind:value={windowOffset} min={-160} max={160} step={1} />
      </label>
      <span class="value">{windowOffset}</span>
    </div>
  {/snippet}
</ExampleLayout>

<style>
  :global(.pluton-root .pluton-geometry path.demo-room-walls) {
    --hatch-fill-override: none;
    stroke: rgba(8, 86, 78, 0.94);
    stroke-width: 1.25;
  }

  :global(.pluton-root .pluton-geometry path.demo-room-window) {
    --hatch-fill-override: none;
    stroke: rgba(51, 65, 85, 0.88);
    stroke-width: 1;
  }

  :global(.pluton-root .pluton-geometry path.demo-room-door) {
    --hatch-fill-override: none;
    stroke: rgba(127, 29, 29, 0.8);
    stroke-width: 1;
  }

  :global(.pluton-root .pluton-geometry path.demo-room-furniture) {
    stroke: rgba(71, 85, 105, 0.86);
    stroke-width: 0.95;
  }

  :global(.pluton-root .pluton-dimensions .pluton-dim-stroke.room-dim) {
    stroke: rgba(78, 94, 96, 0.9);
  }

  :global(.pluton-root .pluton-dimensions .pluton-dim-filled.room-dim) {
    fill: rgba(78, 94, 96, 0.9);
  }

  :global(.pluton-root .pluton-dimensions text.room-dim) {
    fill: rgba(78, 94, 96, 0.95);
    font-size: 10px;
    letter-spacing: 0.03em;
  }

  :global(.pluton-root .pluton-dimensions text.room-note) {
    fill: rgba(47, 83, 88, 0.9);
    font-size: 10px;
    letter-spacing: 0.07em;
    font-weight: 500;
  }
</style>
