<script lang="ts">
  import { Pluton2D } from "pluton-2d";
  import ExampleLayout from "@views/examples/components/ExampleLayout.svelte";

  type Params = { width: number; height: number };

  const initialWidth = 240;
  const initialHeight = 210;

  let width = $state(initialWidth);
  let height = $state(initialHeight);
  let scene: Pluton2D<Params> | null = null;

  const onSetup = (sceneInstance: Pluton2D<Params>) => {
    scene = sceneInstance;
    const geometryGroup = scene.geometry.group();
    const dimensionsGroup = scene.dimensions.group();

    const YELLOW = "#ffd020";
    const hatFillId = scene.addHatchFill(YELLOW, 0.5);
    const RED = "#ff0000";
    const bandFillId = scene.addHatchFill(RED, 0.5);
    const BLACK = "#000000";
    const blackFillId = scene.addHatchFill(BLACK, 0.75);

    const dimensionOffset = 50;

    scene.draw((p) => {
      const { width, height } = p;
      const scaleX = width / initialWidth;
      const scaleY = height / initialHeight;

      geometryGroup.scale(scaleX, scaleY);

      const hat = geometryGroup.path({
        fill: hatFillId,
      });
      hat
        // top hat
        .moveToAbs(-60, 35)
        .arcTo(120, 0, 67.5, true)
        .close()
        // bottom hat
        .moveToAbs(-90, 10)
        .arcTo(0, -5, 2.5)
        .lineTo(180, 0)
        .arcTo(0, 5, 2.5)
        .close();

      const band = geometryGroup.path({
        fill: bandFillId,
      });
      band
        .moveToAbs(-60, 35)
        .arcTo(-5, -25, 67.5, false)
        .lineTo(130, 0)
        .arcTo(-5, 25, 67.5, false)
        .close();

      const face = geometryGroup.path({ fill: "none" });
      face
        // upper face
        .moveToAbs(-65, 5)
        .arcTo(130, 0, 66)
        // jaw
        .moveToAbs(-30, -42)
        .cubicTo(-60, -100, 120, -100, 60, 0)
        // teeth first arc
        .moveToAbs(-38, -58)
        .arcTo(76, 0, 70, false)
        // teeth second arc
        .moveToAbs(-42.5, -75)
        .arcTo(85, 0, 70, false)
        // teeth separators
        .moveToAbs(0, -50)
        .lineTo(0, -39)
        .moveToAbs(-15, -47.5)
        .lineTo(-10, -37.5)
        .moveToAbs(15, -47.5)
        .lineTo(10, -37.5);

      const bones = geometryGroup.path({ fill: "none" });
      bones
        // top right
        .moveToAbs(64, 20)
        .lineTo(30, 30)
        .arcTo(10, 20, 15, false, true)
        .arcTo(-20, -10, 15, false, true)
        .lineTo(-25, -25)
        // top left
        .moveToAbs(-64, 20)
        .lineTo(-30, 30)
        .arcTo(-10, 20, 15, true, true)
        .arcTo(20, -10, 15, true, true)
        .lineTo(25, -25)
        // bottom left
        .moveToAbs(-33, -47)
        .lineTo(-40, -40)
        .arcTo(-10, -20, 15, false, true)
        .arcTo(25, 10, 15, false, true)
        .lineTo(16, 16)
        // bottom right
        .moveToAbs(33, -47)
        .lineTo(40, -40)
        .arcTo(10, -20, 15, true, true)
        .arcTo(-25, 10, 15, true, true)
        .lineTo(-16, 16);

      const eyesAndNose = geometryGroup.path({
        fill: blackFillId,
      });
      eyesAndNose
        // nose
        .moveToAbs(-6, -40)
        .cubicTo(0, 6, 12, 6, 12, 0)
        .cubicTo(0, -6, -12, -6, -12, 0)
        // left eye
        .moveToAbs(-45, -15)
        .cubicTo(0, 15, 30, 15, 30, 0)
        .cubicTo(0, -20, -30, -20, -30, 0)
        // right eye
        .moveToAbs(45, -15)
        .cubicTo(0, 15, -30, 15, -30, 0)
        .cubicTo(0, -20, 30, -20, 30, 0);

      const dimensions = dimensionsGroup.dimension();
      dimensions
        // width
        .moveToAbs(-width / 2, -height / 2 - dimensionOffset)
        .tick(0)
        .lineTo(width, 0)
        .tick(0)
        .textAt(-width / 2, -11, `${width} mm`, "middle")

        // height
        .moveToAbs(width / 2 + dimensionOffset, -height / 2)
        .tick(-Math.PI / 2)
        .lineTo(0, height)
        .tick(Math.PI / 2)
        .textAt(11, -height / 2, `${height} mm`, "start")

        // title
        .moveToAbs(0, 0)
        .textAtAbs(
          0,
          200,
          `"おれは助けてもらわねェと生きていけねェ自信がある!!!" - Monkey D. Luffy`,
          "middle",
          "title",
        );
    });
  };

  $effect(() => {
    if (!scene) return;
    Object.assign(scene.params, {
      width,
      height,
    });
  });
</script>

<ExampleLayout initialParams={{ width, height }} {onSetup}>
  {#snippet controls()}
    <div class="demo-control">
      <label>
        Width
        <input type="range" bind:value={width} min={220} max={700} step={1} />
      </label>
      <span class="value">{width}</span>
    </div>
    <div class="demo-control">
      <label>
        Height
        <input type="range" bind:value={height} min={180} max={620} step={1} />
      </label>
      <span class="value">{height}</span>
    </div>
  {/snippet}
</ExampleLayout>

<!-- <style>
  :global(svg) {
    background-color: rgba(0, 0, 0, 0.85);
  }

  :global(.pluton-root) {
    --pluton-grid-minor-stroke: rgba(213, 213, 213, 0.025);
    --pluton-grid-major-stroke: rgba(255, 255, 255, 0.12);
    --pluton-grid-stroke-width: 0.5;
    --pluton-axis-color: rgba(172, 172, 172, 0.2);
    --pluton-dim-color: rgba(204, 204, 204, 0.75);
    --pluton-dim-text-color: rgba(204, 204, 204, 0.75);
  }
</style> -->
