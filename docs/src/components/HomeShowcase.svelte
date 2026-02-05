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
    scene.enableFilter(true)

    const geom = scene.geometry.group();
    const dims = scene.dimensions.group();
    geom.setDrawUsage("static");
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
        .moveToAbs(right + 42, bottom)
        .tick(-Math.PI / 2)
        .lineTo(0, height)
        .tick(Math.PI / 2)
        .textAt(18, -height / 2, `${height} mm`, "start", "home-iso-dim");

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
  });

  onDestroy(() => {
    scene?.dispose();
  });
</script>

<div class="home-showcase">
  <div class="home-showcase-frame demo-frame">
    <svg bind:this={svgEl}></svg>
  </div>
  <p class="home-showcase-hint">Isometric I-beam study with static dimensions.</p>
</div>

<style>
  .home-showcase {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: var(--panel-bg);
    border: 1px solid var(--panel-border);
    border-radius: var(--radius);
    padding: 0.75rem;
    box-shadow: var(--shadow-soft);
  }

  .home-showcase-frame {
    flex: 1;
    min-height: 0;
  }

  .home-showcase-frame.demo-frame {
    aspect-ratio: auto;
    height: 100%;
    border-color: color-mix(in oklab, var(--accent) 35%, transparent);
    background:
      radial-gradient(140% 85% at 15% 10%, rgba(15, 118, 110, 0.1), transparent 60%),
      radial-gradient(80% 70% at 85% 95%, rgba(2, 6, 23, 0.07), transparent 65%),
      linear-gradient(155deg, #fbfbf8 0%, #f0efe8 100%);
  }

  .home-showcase-hint {
    margin: 0.5rem 0 0;
    font-size: 0.78rem;
    color: var(--text-muted);
  }

  :global(.pluton-root .pluton-geometry path.home-iso-front) {
    stroke: #0f766e;
    stroke-width: 1.5;
  }

  :global(.pluton-root .pluton-geometry path.home-iso-back) {
    stroke: rgba(15, 118, 110, 0.56);
    stroke-dasharray: 0.25em;
  }

  :global(.pluton-root .pluton-geometry path.home-iso-connect) {
    stroke: rgba(15, 118, 110, 0.4);
    stroke-dasharray: 0.25em;
  }

  :global(.pluton-root .pluton-dimensions .pluton-dim-stroke.home-iso-dim) {
    stroke: rgba(12, 67, 63, 0.9);
  }

  :global(.pluton-root .pluton-dimensions .pluton-dim-filled.home-iso-dim) {
    fill: rgba(12, 67, 63, 0.9);
  }

  :global(.pluton-root .pluton-dimensions text.home-iso-dim) {
    fill: rgba(12, 67, 63, 0.92);
    font-size: 11px;
    letter-spacing: 0.03em;
  }

  @media (max-width: 768px) {
    .home-showcase {
      padding: 0.6rem;
    }
  }
</style>
