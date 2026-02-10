<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    controls,
    children,
  }: {
    controls?: Snippet;
    children?: Snippet;
  } = $props();
</script>

<div class="controls-panel">
  <div class="controls-panel-title">Parameters</div>
  <div class="demo-controls">
    {@render (controls ?? children)?.()}
  </div>
</div>

<style>
  .controls-panel {
    background: var(--panel-bg);
    border: 1px solid var(--panel-border);
    border-radius: calc(var(--radius) - 1px);
    padding: var(--space-2) var(--space-2);
  }

  .controls-panel-title {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 600;
    color: var(--text-muted);
    margin-bottom: var(--space-2);
  }

  .demo-controls {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3) var(--space-5);
    padding: var(--space-3) 0 0;
    border-top: 1px solid var(--panel-border);
  }

  .controls-panel .demo-controls {
    border-top: none;
    padding-top: 0;
    flex-direction: column;
    gap: var(--space-2);
  }

  .controls-panel .demo-controls :global(.demo-control) {
    min-width: unset;
  }

  :global(.demo-control) {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
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
</style>
