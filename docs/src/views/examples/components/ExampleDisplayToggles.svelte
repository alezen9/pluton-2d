<script lang="ts">
  import { onMount } from "svelte";
  import { snapshotSvg, type Pluton2D } from "pluton-2d";
  import type { InitialToggles } from "../types";

  let {
    scene,
    svgEl,
    initialToggles = {},
  }: {
    scene: Pluton2D<any> | null;
    svgEl?: SVGSVGElement | undefined;
    initialToggles?: Partial<InitialToggles>;
  } = $props();

  const getInitialToggle = (key: keyof InitialToggles, fallback: boolean) =>
    initialToggles[key] ?? fallback;

  let panOn = $state(getInitialToggle("panOn", true));
  let zoomOn = $state(getInitialToggle("zoomOn", true));
  let gridOn = $state(getInitialToggle("gridOn", true));
  let axesOn = $state(getInitialToggle("axesOn", true));
  let hatchOn = $state(getInitialToggle("hatchOn", true));
  const showFilterToggles = "filterOn" in initialToggles;
  let filterOn = $state(getInitialToggle("filterOn", false));
  let maskOn = $state(getInitialToggle("maskOn", false));
  let showExportButton = $state(import.meta.env.DEV);

  const resetCamera = () => scene?.resetCamera();

  const hasExportUrlFlag = (): boolean => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).get("export") === "true";
  };

  const getFilenameBase = (): string => {
    return (
      window.location.pathname.split("/").filter(Boolean).at(-1) ?? "scene"
    );
  };

  const getTimestamp = (): string => {
    return new Date().toISOString().replace(/[:.]/g, "-");
  };

  const getExportBackground = (): string | undefined => {
    if (!svgEl) return undefined;
    const frame = svgEl.closest(".demo-frame");
    if (!(frame instanceof HTMLElement)) return undefined;

    const style = window.getComputedStyle(frame);
    const canvasBg = style.getPropertyValue("--canvas-bg").trim();
    if (canvasBg) return canvasBg;

    const backgroundColor = style.backgroundColor.trim();
    if (
      !backgroundColor ||
      backgroundColor === "transparent" ||
      backgroundColor === "rgba(0, 0, 0, 0)"
    ) {
      return undefined;
    }

    return backgroundColor;
  };

  const exportSvgSnapshot = () => {
    if (!svgEl) return;

    try {
      const xmlString = snapshotSvg(svgEl, {
        background: getExportBackground(),
      });
      const blob = new Blob([xmlString], {
        type: "image/svg+xml;charset=utf-8",
      });
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = objectUrl;
      anchor.download = `${getFilenameBase()}-${getTimestamp()}.svg`;
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
    } catch (error) {
      console.error("Failed to export SVG snapshot:", error);
    }
  };

  onMount(() => {
    showExportButton = import.meta.env.DEV || hasExportUrlFlag();
  });

  $effect(() => {
    if (!scene) return;
    scene.enablePan(panOn);
    scene.enableZoom(zoomOn);
    if (showFilterToggles) {
      scene.enableFilter(filterOn);
      scene.enableMask(maskOn);
    }
    scene.enableGrid(gridOn);
    scene.enableAxes(axesOn);
    scene.enableFill(hatchOn);
  });
</script>

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
    {#if showFilterToggles}
      <label class="switch-row">
        <input type="checkbox" class="switch" bind:checked={filterOn} />
        <span>Filter</span>
      </label>
      <label class="switch-row">
        <input type="checkbox" class="switch" bind:checked={maskOn} />
        <span>Mask</span>
      </label>
    {/if}
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
  <button class="btn-reset" type="button" onclick={resetCamera}
    >Reset Camera</button
  >
  {#if showExportButton}
    <button
      class="btn-reset btn-export"
      type="button"
      onclick={exportSvgSnapshot}
      disabled={!svgEl}
    >
      Export SVG
    </button>
  {/if}
</div>

<style>
  .controls-panel {
    background: var(--panel-bg);
    border: 1px solid var(--panel-border);
    border-radius: calc(var(--radius) - 1px);
    padding: var(--space-2);
  }

  .controls-panel-title {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 600;
    color: var(--text-muted);
    margin-bottom: var(--space-2);
  }

  .switch-group {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-2) var(--space-3);
  }

  .switch-row {
    display: flex;
    align-items: center;
    gap: var(--space-2);
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
    margin-top: var(--space-3);
    width: 100%;
    background: transparent;
    border: 1px solid var(--panel-border);
    color: var(--text-muted);
    padding: var(--space-1) var(--space-4);
    border-radius: 5px;
    font-size: 0.82rem;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    transition:
      border-color 0.15s,
      color 0.15s,
      background 0.15s;
  }

  .btn-reset:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: var(--accent-light);
  }

  .btn-reset:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    border-color: var(--panel-border);
    color: var(--text-muted);
    background: transparent;
  }

  .btn-reset:disabled:hover {
    border-color: var(--panel-border);
    color: var(--text-muted);
    background: transparent;
  }

  .btn-export {
    margin-top: var(--space-2);
  }
</style>
