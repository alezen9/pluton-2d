<script lang="ts">
  import { Pluton2D } from "pluton-2d";
  import ExampleLayout from "@views/examples/components/ExampleLayout.svelte";

  type Params = { width: number; height: number };

  const initialWidth = 212;
  const initialHeight = 140;

  let width = $state(initialWidth);
  let height = $state(initialHeight);

  let scene: Pluton2D<Params> | null = null;

  const onSetup = (sceneInstance: Pluton2D<Params>) => {
    scene = sceneInstance;

    const contourGroup = scene.geometry.group();
    const cloudGroup = scene.geometry.group();
    const dimensionsGroup = scene.dimensions.group();

    const AKATSUKI_RED = "#b30703";
    const redFillId = scene.addHatchFill(AKATSUKI_RED, 0.5);

    const dimensionOffset = 30;

    scene.draw((p) => {
      const { width, height } = p;
      const scaleX = width / initialWidth;
      const scaleY = height / initialHeight;

      contourGroup.scale(scaleX, scaleY);
      cloudGroup.scale(scaleX, scaleY);

      const contour = contourGroup.path({
        fill: "none",
      });
      contour
        .moveToAbs(-102, -2)
        .quadTo(15, -50, 51, -46)
        .cubicTo(10, -23, 40, -25, 55, -10)
        .cubicTo(10, -15, 50, -15, 57, 17)
        .cubicTo(50, 10, 50, 80, 0, 90)
        .cubicTo(-10, 25, -50, 30, -68, 7)
        .cubicTo(-40, 0, -40, -35, -40, -35)
        .cubicTo(-20, 0, -25, -38, -55, -22)
        .close();

      const cloud = cloudGroup.path({
        stroke: "none",
        fill: redFillId,
      });
      cloud
        .moveToAbs(-95, -8)
        .quadTo(15, -40, 43, -35)
        .cubicTo(0, 30, 33, 30, 38, 10)
        .cubicTo(1, -5, -3, -3, -3, -2)
        .cubicTo(0, 15, -30, 20, -30, -8)
        .cubicTo(10, -25, 40, -25, 50, -6)
        .cubicTo(10, -20, 50, -15, 52, 10)
        .cubicTo(-25, 15, -15, 50, 7, 40)
        .cubicTo(4, -3, 2, -5, 0, -4)
        .cubicTo(-22, 10, -22, -25, -3, -33)
        .cubicTo(45, 10, 45, 70, -2, 80)
        .cubicTo(-10, 30, -50, 25, -60, 5)
        .cubicTo(-10, -25, 40, -40, 30, -5)
        .cubicTo(-1, 2, 3, 4, 3, 1)
        .cubicTo(10, -45, -50, -25, -37, 5)
        .cubicTo(-35, 0, -35, -35, -35, -35)
        .cubicTo(-25, 0, -25, -35, -53, -23)
        .close();

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
          `"…世界に痛みを。神羅天征！" - Pain`,
          "middle",
          "title",
        );
    });
  };
  $effect(() => {
    if (!scene) return;
    Object.assign(scene.params, { width, height });
  });
</script>

<ExampleLayout initialParams={{ width, height }} {onSetup}>
  {#snippet controls()}
    <div class="demo-control">
      <label>
        Width
        <input type="range" bind:value={width} min={100} max={400} step={1} />
      </label>
      <span class="value">{width}</span>
    </div>
    <div class="demo-control">
      <label>
        Height
        <input type="range" bind:value={height} min={50} max={300} step={1} />
      </label>
      <span class="value">{height}</span>
    </div>
  {/snippet}
</ExampleLayout>
