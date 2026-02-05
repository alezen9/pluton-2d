<script lang="ts" generics="P extends Record<string, unknown>">
  import { onMount, onDestroy } from "svelte";
  import { Pluton2D } from "pluton-2d";
  import type { Snippet } from "svelte";

  let {
    initialParams,
    onSetup,
    params,
    initialFilterOn = false,
  }: {
    initialParams: P;
    onSetup: (scene: Pluton2D<P>) => void;
    params?: Snippet;
    initialFilterOn?: boolean;
  } = $props();

  let svgEl: SVGSVGElement | undefined = $state();
  let scene: Pluton2D<P> | undefined = $state();

  let panOn = $state(true);
  let zoomOn = $state(true);
  let gridOn = $state(true);
  let axesOn = $state(true);
  let hatchOn = $state(true);
  let filterOn = $state(initialFilterOn);

  onMount(() => {
    if (svgEl) {
      scene = new Pluton2D(svgEl, initialParams);
      onSetup(scene);
    }
  });

  onDestroy(() => {
    scene?.dispose();
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

<div class="scene-layout">
  <div class="example-canvas-area">
    <div class="demo-frame">
      <svg bind:this={svgEl}></svg>
    </div>
  </div>

  <div class="example-controls-area">
    <div class="controls-panel">
      <div class="controls-panel-title">Parameters</div>
      <div class="demo-controls">
        {@render params?.()}
      </div>
    </div>

    <div class="controls-panel">
      <div class="controls-panel-title">Display</div>
      <div class="switch-group">
        <label class="switch-row">
          <input type="checkbox" class="switch" bind:checked={gridOn} />
          <span>Grid</span>
        </label>
        <label class="switch-row">
          <input type="checkbox" class="switch" bind:checked={axesOn} />
          <span>Axes</span>
        </label>
        <label class="switch-row">
          <input type="checkbox" class="switch" bind:checked={hatchOn} />
          <span>Hatch</span>
        </label>
        <label class="switch-row">
          <input type="checkbox" class="switch" bind:checked={filterOn} />
          <span>Pencil</span>
        </label>
      </div>
    </div>

    <div class="controls-panel">
      <div class="controls-panel-title">Camera</div>
      <div class="switch-group">
        <label class="switch-row">
          <input type="checkbox" class="switch" bind:checked={panOn} />
          <span>Pan</span>
        </label>
        <label class="switch-row">
          <input type="checkbox" class="switch" bind:checked={zoomOn} />
          <span>Zoom</span>
        </label>
      </div>
      <button class="btn-reset" onclick={() => scene?.resetCamera()}>Reset Camera</button>
    </div>
  </div>
</div>

<style>
  .scene-layout {
    flex: 1;
    display: flex;
    gap: 1.5rem;
    min-height: 360px;
  }

  .example-canvas-area {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
  }

  .example-canvas-area .demo-frame {
    aspect-ratio: unset;
    flex: 1;
    min-height: 0;
  }

  .example-controls-area {
    width: 280px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    overflow-y: auto;
  }

  .controls-panel {
    background: var(--panel-bg);
    border: 1px solid var(--panel-border);
    border-radius: var(--radius);
    padding: 0.5rem 0.65rem;
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
    background: var(--panel-border);
    border-radius: 2px;
    outline: none;
  }

  :global(.demo-control input[type="range"]::-webkit-slider-thumb) {
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: var(--accent);
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
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
    background: var(--panel-border);
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
    background: white;
    border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
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
    padding: 0.4rem 0.75rem;
    border-radius: 6px;
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

  :global(.pluton-root .pluton-geometry path.demo-blue) {
    stroke: #2563eb;
  }

  :global(.pluton-root .pluton-geometry path.demo-teal) {
    stroke: #0f766e;
  }

  :global(.pluton-root .pluton-geometry path.demo-orange) {
    stroke: #ea580c;
  }

  :global(.pluton-root .pluton-geometry path.demo-purple) {
    stroke: #7c3aed;
  }

  :global(.pluton-root .pluton-geometry path.demo-rose) {
    stroke: #e11d48;
  }

  :global(.pluton-root .pluton-geometry path.demo-amber) {
    stroke: #d97706;
  }

  :global(.pluton-root .pluton-geometry path.demo-static) {
    stroke: #f97316;
    stroke-width: 2;
  }

  :global(.pluton-root .pluton-geometry path.demo-dynamic) {
    stroke: #0f766e;
    stroke-width: 2;
  }

  @media (max-width: 1024px) {
    .scene-layout {
      flex-direction: column;
      overflow-y: auto;
    }

    .example-canvas-area {
      min-height: 300px;
      flex: none;
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
      aspect-ratio: 4 / 3;
      flex: none;
    }
  }
</style>
