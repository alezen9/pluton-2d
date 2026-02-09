<script lang="ts" generics="P extends Record<string, unknown>">
  import { onDestroy, onMount } from "svelte";
  import { Pluton2D } from "pluton-2d";
  import type { Snippet } from "svelte";

  type InitialToggles = {
    panOn: boolean;
    zoomOn: boolean;
    gridOn: boolean;
    axesOn: boolean;
    hatchOn: boolean;
    filterOn: boolean;
  };

  let {
    initialParams,
    onSetup,
    drawing,
    controls,
    children,
    initialToggles = {},
  }: {
    initialParams: P;
    onSetup: (scene: Pluton2D<P>) => void;
    drawing?: Snippet<[Pluton2D<P> | null]>;
    controls?: Snippet;
    children?: Snippet;
    initialToggles?: Partial<InitialToggles>;
  } = $props();

  const getInitialToggle = (key: keyof InitialToggles, fallback: boolean) =>
    initialToggles[key] ?? fallback;

  let scene: Pluton2D<P> | null = $state(null);
  let svgEl: SVGSVGElement | undefined = $state();

  let panOn = $state(getInitialToggle("panOn", true));
  let zoomOn = $state(getInitialToggle("zoomOn", true));
  let gridOn = $state(getInitialToggle("gridOn", true));
  let axesOn = $state(getInitialToggle("axesOn", true));
  let hatchOn = $state(getInitialToggle("hatchOn", true));
  let filterOn = $state(getInitialToggle("filterOn", false));

  const resetCamera = () => scene?.resetCamera();

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
    scene.enableFill(hatchOn);
  });
</script>

<div class="scene-layout">
  <div class="example-canvas-area">
    <div class="demo-frame">
      <svg bind:this={svgEl}></svg>
      {@render drawing?.(scene)}
    </div>
  </div>

  <div class="example-controls-area">
    <div class="controls-panel">
      <div class="controls-panel-title">Parameters</div>
      <div class="demo-controls">
        {@render (controls ?? children)?.()}
      </div>
    </div>

    <div class="controls-panel">
      <div class="controls-panel-title">Display</div>
      <div class="switch-group">
        <label class="switch-row">
          <input
            type="checkbox"
            class="switch"
            bind:checked={gridOn}
          />
          <span>Grid</span>
        </label>
        <label class="switch-row">
          <input
            type="checkbox"
            class="switch"
            bind:checked={axesOn}
          />
          <span>Axes</span>
        </label>
        <label class="switch-row">
          <input
            type="checkbox"
            class="switch"
            bind:checked={hatchOn}
          />
          <span>Hatch</span>
        </label>
        <label class="switch-row">
          <input
            type="checkbox"
            class="switch"
            bind:checked={filterOn}
          />
          <span>Pencil</span>
        </label>
      </div>
    </div>

    <div class="controls-panel">
      <div class="controls-panel-title">Camera</div>
      <div class="switch-group">
        <label class="switch-row">
          <input
            type="checkbox"
            class="switch"
            bind:checked={panOn}
          />
          <span>Pan</span>
        </label>
        <label class="switch-row">
          <input
            type="checkbox"
            class="switch"
            bind:checked={zoomOn}
          />
          <span>Zoom</span>
        </label>
      </div>
      <button class="btn-reset" onclick={resetCamera}>Reset Camera</button>
    </div>
  </div>
</div>

<style>
  .scene-layout {
    --control-track: rgba(198, 222, 230, 0.2);
    --control-thumb: #edf3f5;
    --control-thumb-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 1.45rem;
    min-height: 0;
  }

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

  .example-controls-area {
    width: 300px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 0.45rem;
    overflow-y: auto;
  }

  .controls-panel {
    background: var(--panel-bg);
    border: 1px solid var(--panel-border);
    border-radius: calc(var(--radius) - 1px);
    padding: 0.46rem 0.62rem;
  }

  .controls-panel-title {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 600;
    color: var(--text-muted);
    margin-bottom: 0.35rem;
  }

  .demo-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem 1.25rem;
    padding: 0.75rem 0 0;
    border-top: 1px solid var(--panel-border);
  }

  .controls-panel .demo-controls {
    border-top: none;
    padding-top: 0;
    flex-direction: column;
    gap: 0.3rem;
  }

  .controls-panel .demo-controls :global(.demo-control) {
    min-width: unset;
  }

  :global(.demo-control) {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    min-width: 90px;
  }

  :global(.demo-control label) {
    font-size: 0.78rem;
    font-weight: 500;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  :global(.demo-control input[type="range"]) {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 4px;
    background: var(--control-track);
    border-radius: 2px;
    outline: none;
  }

  :global(.demo-control input[type="range"]::-webkit-slider-thumb) {
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--control-thumb);
    border: 2px solid var(--accent);
    cursor: pointer;
    box-shadow: var(--control-thumb-shadow);
  }

  :global(.demo-control input[type="range"]::-moz-range-thumb) {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--control-thumb);
    border: 2px solid var(--accent);
    cursor: pointer;
    box-shadow: var(--control-thumb-shadow);
  }

  :global(.demo-control .value) {
    font-size: 0.75rem;
    color: var(--text-muted);
    text-align: right;
  }

  .switch-group {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.35rem 0.75rem;
  }

  .switch-row {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    cursor: pointer;
  }

  .switch-row span {
    font-size: 0.82rem;
    color: var(--text-muted);
    font-weight: 500;
  }

  .switch {
    -webkit-appearance: none;
    appearance: none;
    width: 36px;
    height: 20px;
    background: var(--control-track);
    border-radius: 10px;
    cursor: pointer;
    position: relative;
    transition: background 0.2s;
    flex-shrink: 0;
  }

  .switch:checked {
    background: var(--accent);
  }

  .switch::after {
    content: "";
    position: absolute;
    top: 2px;
    left: 2px;
    width: 16px;
    height: 16px;
    background: var(--control-thumb);
    border-radius: 50%;
    box-shadow: var(--control-thumb-shadow);
    transition: transform 0.2s;
  }

  .switch:checked::after {
    transform: translateX(16px);
  }

  .switch:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  .btn-reset {
    margin-top: 0.75rem;
    width: 100%;
    background: transparent;
    border: 1px solid var(--panel-border);
    color: var(--text-muted);
    padding: 0.28rem 1.1rem;
    border-radius: 5px;
    font-size: 0.82rem;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s, background 0.15s;
  }

  .btn-reset:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-light);
  }

  :global(.legend) {
    display: flex;
    gap: 1.25rem;
    padding-top: 0.5rem;
  }

  :global(.legend-item) {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-size: 0.78rem;
    font-weight: 500;
  }

  :global(.legend-swatch) {
    width: 10px;
    height: 10px;
    border-radius: 2px;
  }

  :global(.legend-swatch.static) {
    background: #f97316;
  }

  :global(.legend-swatch.dynamic) {
    background: #0f766e;
  }

  :global(.legend-label.static) {
    color: #f97316;
  }

  :global(.legend-label.dynamic) {
    color: #0f766e;
  }

  :global(.pluton-root .pluton-dimensions text.title) {
    font-size: 0.75rem;
    letter-spacing: 0.07em;
    font-weight: 500;
    text-transform: uppercase;
  }

  @media (max-width: 1024px) {
    .scene-layout {
      flex-direction: column;
      gap: 1rem;
      overflow-y: auto;
    }

    .example-canvas-area {
      min-height: 0;
      flex: none;
    }

    .example-canvas-area .demo-frame {
      width: min(100%, 600px, calc((100svh - 280px) * 4 / 3));
      max-height: calc(100svh - 280px);
    }

    .example-controls-area {
      width: 100%;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .controls-panel {
      flex: 1;
      min-width: 200px;
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
