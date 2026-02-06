<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    params,
    panOn = $bindable(false),
    zoomOn = $bindable(false),
    gridOn = $bindable(false),
    axesOn = $bindable(false),
    hatchOn = $bindable(false),
    filterOn = $bindable(false),
    onResetCamera,
  }: {
    params?: Snippet;
    panOn?: boolean;
    zoomOn?: boolean;
    gridOn?: boolean;
    axesOn?: boolean;
    hatchOn?: boolean;
    filterOn?: boolean;
    onResetCamera: () => void;
  } = $props();
</script>

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
    <button class="btn-reset" onclick={onResetCamera}>Reset Camera</button>
  </div>
</div>

<style>
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

  @media (max-width: 1024px) {
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
</style>
