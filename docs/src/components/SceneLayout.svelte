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
