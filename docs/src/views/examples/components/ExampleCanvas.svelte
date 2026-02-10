<script lang="ts" generics="P extends Record<string, unknown>">
  import { onDestroy, onMount } from "svelte";
  import { Pluton2D } from "pluton-2d";
  import type { Snippet } from "svelte";
  import { BREAKPOINTS } from "../../../utils/breakpoints";

  let {
    initialParams,
    onSetup,
    drawing,
    mobileScale = 0.7,
    tabletScale = 0.85,
    scene = $bindable(),
  }: {
    initialParams: P;
    onSetup: (scene: Pluton2D<P>) => void;
    drawing?: Snippet<[Pluton2D<P> | null]>;
    mobileScale?: number;
    tabletScale?: number;
    scene?: Pluton2D<P> | null;
  } = $props();

  let svgEl: SVGSVGElement | undefined = $state();

  onMount(() => {
    if (!svgEl) return;
    scene = new Pluton2D(svgEl, { params: initialParams });
    onSetup(scene);

    // Responsive scaling with matchMedia
    const mobileQuery = window.matchMedia(`(max-width: ${BREAKPOINTS.mobile}px)`);
    const tabletQuery = window.matchMedia(
      `(min-width: ${BREAKPOINTS.mobile + 1}px) and (max-width: ${BREAKPOINTS.desktop}px)`,
    );

    const updateViewScale = () => {
      if (!scene) return;

      let scale = 1.0; // desktop default
      if (mobileQuery.matches) {
        scale = mobileScale;
      } else if (tabletQuery.matches) {
        scale = tabletScale;
      }

      scene.setViewScale(scale);
    };

    updateViewScale();

    const mobileListener = () => updateViewScale();
    const tabletListener = () => updateViewScale();

    mobileQuery.addEventListener("change", mobileListener);
    tabletQuery.addEventListener("change", tabletListener);

    return () => {
      mobileQuery.removeEventListener("change", mobileListener);
      tabletQuery.removeEventListener("change", tabletListener);
    };
  });

  onDestroy(() => {
    scene?.dispose();
    scene = null;
  });
</script>

<div class="example-canvas-area">
  <div class="demo-frame">
    <svg bind:this={svgEl}></svg>
    {@render drawing?.(scene)}
  </div>
</div>

<style>
  .example-canvas-area {
    --canvas-max-width: 900px;
    flex: 1;
    display: flex;
    justify-content: center;
    min-width: 0;
    min-height: 0;
    padding: var(--space-1) 0 var(--space-1);
    max-width: var(--canvas-max-width);
  }

  .example-canvas-area .demo-frame {
    aspect-ratio: 4 / 3;
    width: 100%;
    max-width: var(--canvas-max-width);
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

  @media (max-width: 768px) {
    .example-canvas-area {
      width: 100%;
      justify-content: center;
      flex: none;
      max-width: none;
    }

    .example-canvas-area .demo-frame {
      width: 100%;
      max-width: 100%;
    }
  }
</style>
