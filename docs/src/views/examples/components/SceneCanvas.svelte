<script lang="ts" generics="P extends Record<string, unknown>">
  import { onDestroy, onMount } from "svelte";
  import { Pluton2D } from "pluton-2d";

  let {
    initialParams,
    onSetup,
    panOn,
    zoomOn,
    gridOn,
    axesOn,
    hatchOn,
    filterOn,
    scene = $bindable<Pluton2D<P> | null>(null),
  }: {
    initialParams: P;
    onSetup: (scene: Pluton2D<P>) => void;
    panOn: boolean;
    zoomOn: boolean;
    gridOn: boolean;
    axesOn: boolean;
    hatchOn: boolean;
    filterOn: boolean;
    scene?: Pluton2D<P> | null;
  } = $props();

  let svgEl: SVGSVGElement | undefined = $state();

  onMount(() => {
    if (!svgEl) return;
    scene = new Pluton2D(svgEl, initialParams);
    onSetup(scene);
  });

  onDestroy(() => {
    scene?.dispose();
    scene = null;
  });

  $effect(() => {
    if (!scene) return;
    scene.enablePan(panOn);
    scene.enableZoom(zoomOn);
    scene.enableFilter(filterOn);
    scene.enableGrid(gridOn);
    scene.enableAxes(axesOn);
    scene.enableHatchFill(hatchOn);
  });
</script>

<div class="example-canvas-area">
  <div class="demo-frame">
    <svg bind:this={svgEl}></svg>
  </div>
</div>

<style>
  .example-canvas-area {
    flex: 1;
    display: flex;
    justify-content: flex-start;
    min-width: 0;
    min-height: 0;
    padding: 0.1rem 0 0.25rem;
  }

  .example-canvas-area .demo-frame {
    aspect-ratio: 4 / 3;
    width: 95%;
    height: 100%;
    flex: none;
    margin: 0 0;
    border: none;
    border-radius: var(--radius);
    background: radial-gradient(
      120% 94% at 50% 50%,
      color-mix(in oklab, var(--canvas-bg) 94%, white) 0%,
      color-mix(in oklab, var(--canvas-bg) 74%, transparent) 68%,
      transparent 100%
    );
    overflow: visible;
  }

  .example-canvas-area .demo-frame::before,
  .example-canvas-area .demo-frame::after {
    display: none;
  }

  :global(.example-canvas-area .demo-frame svg) {
    clip-path: none;
  }

  @media (max-width: 1024px) {
    .example-canvas-area {
      min-height: 0;
      flex: none;
    }

    .example-canvas-area .demo-frame {
      width: min(100%, 600px, calc((100svh - 280px) * 4 / 3));
      max-height: calc(100svh - 280px);
    }
  }

  @media (max-width: 768px) {
    .example-canvas-area .demo-frame {
      width: min(100%, 520px);
      max-width: 520px;
      max-height: none;
      aspect-ratio: 4 / 3;
    }
  }
</style>
