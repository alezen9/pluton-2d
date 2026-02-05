<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { Pluton2D } from "pluton-2d";

  type Point = { x: number; y: number };
  type PathLike = {
    moveToAbs: (x: number, y: number) => PathLike;
    lineToAbs: (x: number, y: number) => PathLike;
    close: () => PathLike;
  };

  let svgEl: SVGSVGElement | undefined = $state();
  let scene: Pluton2D<Record<string, never>> | null = null;

  const drawClosedPath = (path: PathLike, points: Point[]) => {
    if (points.length === 0) return;
    path.moveToAbs(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      path.lineToAbs(points[i].x, points[i].y);
    }
    path.close();
  };

  onMount(() => {
    if (!svgEl) return;

    scene = new Pluton2D(svgEl, {});
    scene.enableAxes(false);
    scene.enablePan(false);
    scene.enableZoom(false);
    scene.enableFilter(true);

    const geom = scene.geometry.group();
    geom.setDrawUsage("static");
    const dims = scene.dimensions.group();
    dims.setDrawUsage("static");

    // Beam profile in front view
    const width = 220;
    const height = 280;
    const flangeThickness = 38;
    const webThickness = 54;

    // Extrusion vector for isometric depth
    const depthX = 96;
    const depthY = 58;

    const cx = -20;
    const cy = -12;
    const halfW = width / 2;
    const halfH = height / 2;
    const halfWeb = webThickness / 2;

    const left = cx - halfW;
    const right = cx + halfW;
    const bottom = cy - halfH;
    const top = cy + halfH;
    const flangeInnerBottom = bottom + flangeThickness;
    const flangeInnerTop = top - flangeThickness;

    const front: Point[] = [
      { x: left, y: bottom },
      { x: right, y: bottom },
      { x: right, y: flangeInnerBottom },
      { x: cx + halfWeb, y: flangeInnerBottom },
      { x: cx + halfWeb, y: flangeInnerTop },
      { x: right, y: flangeInnerTop },
      { x: right, y: top },
      { x: left, y: top },
      { x: left, y: flangeInnerTop },
      { x: cx - halfWeb, y: flangeInnerTop },
      { x: cx - halfWeb, y: flangeInnerBottom },
      { x: left, y: flangeInnerBottom },
    ];

    const back = front.map((p) => ({ x: p.x + depthX, y: p.y + depthY }));

    const connectorIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

    scene.draw(() => {
      const frontFace = geom.path({
        className: "home-iso-front",
        fill: "url(#pluton-pattern-fill-hatch-45)",
        fillRule: "evenodd",
      });
      drawClosedPath(frontFace, front);

      const backFace = geom.path({ className: "home-iso-back" });
      drawClosedPath(backFace, back);

      const connectors = geom.path({ className: "home-iso-connect" });
      for (const index of connectorIndices) {
        connectors
          .moveToAbs(front[index].x, front[index].y)
          .lineToAbs(back[index].x, back[index].y);
      }

      const dim = dims.dimension({ className: "home-iso-dim" });

      // Width
      dim
        .moveToAbs(left, bottom - 40)
        .tick(0)
        .lineTo(width, 0)
        .tick(0)
        .textAt(-width / 2, -14, `${width} mm`, "middle", "home-iso-dim");

      // Height
      dim
        .moveToAbs(left - 42, bottom)
        .tick(-Math.PI / 2)
        .lineTo(0, height)
        .tick(Math.PI / 2)
        .textAt(-18, -height / 2, `${height} mm`, "end", "home-iso-dim");

      // Web thickness
      dim
        .moveToAbs(cx - halfWeb, cy)
        .tick(0)
        .lineTo(-34, 0)
        .moveToAbs(cx + halfWeb, cy)
        .tick(Math.PI)
        .lineTo(46, 0)
        .textAt(10, 0, `${webThickness} mm`, "start", "home-iso-dim");
    });

    scene.resetCamera();
  });

  onDestroy(() => {
    scene?.dispose();
  });
</script>

<div class="home-showcase">
  <div class="home-showcase-frame demo-frame">
    <svg bind:this={svgEl}></svg>
  </div>
</div>

<style>
  .home-showcase {
    --home-iso-front: #3d8f82;
    --home-iso-back: rgba(61, 143, 130, 0.48);
    --home-iso-connect: rgba(61, 143, 130, 0.34);
    --home-iso-dim: rgb(103, 118, 115);
    --home-iso-dim-text: var(--home-iso-dim);
    width: min(100%, 64svh);
    max-width: 660px;
    aspect-ratio: 1 / 1;
    margin: 0 auto;
  }

  .home-showcase-frame {
    width: 100%;
    height: 100%;
  }

  .home-showcase-frame.demo-frame {
    aspect-ratio: 1 / 1;
    height: 100%;
    border: none;
    border-radius: 0;
    background: transparent;
  }

  .home-showcase-frame.demo-frame::before,
  .home-showcase-frame.demo-frame::after {
    display: none;
  }

  :global(.home-showcase-frame.demo-frame svg) {
    clip-path: none;
  }

  :global(.pluton-root .pluton-geometry path.home-iso-front) {
    stroke: var(--home-iso-front);
    stroke-width: 1.25;
  }

  :global(.pluton-root .pluton-geometry path.home-iso-back) {
    stroke: var(--home-iso-back);
    stroke-dasharray: 0.25em;
  }

  :global(.pluton-root .pluton-geometry path.home-iso-connect) {
    stroke: var(--home-iso-connect);
    stroke-dasharray: 0.25em;
  }

  :global(.pluton-root .pluton-dimensions .pluton-dim-stroke.home-iso-dim) {
    stroke: var(--home-iso-dim);
  }

  :global(.pluton-root .pluton-dimensions .pluton-dim-filled.home-iso-dim) {
    fill: var(--home-iso-dim);
  }

  :global(.pluton-root .pluton-dimensions text.home-iso-dim) {
    fill: var(--home-iso-dim-text);
    font-size: 10px;
    letter-spacing: 0.03em;
  }

  @media (max-width: 920px) {
    .home-showcase {
      width: min(100%, 520px);
    }
  }

  @media (max-width: 640px) {
    .home-showcase {
      width: min(100%, 460px);
    }
  }
</style>
