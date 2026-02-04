<script>
  let {
    scene = null,
    svgEl = $bindable(null),
    initialHatchOn = false,
    initialFilterOn = false,
  } = $props();

  let panOn = $state(false);
  let zoomOn = $state(false);
  let gridOn = $state(true);
  let axesOn = $state(true);
  let hatchOn = $state(initialHatchOn);
  let filterOn = $state(initialFilterOn);

  $effect(() => {
    if (!scene) return;
    scene.enablePan(panOn);
    scene.enableZoom(zoomOn);
    scene.enableHatchFill(hatchOn);
    scene.enableFilter(filterOn);
    scene.enableGrid(gridOn);
    scene.enableAxes(axesOn);
  });
</script>

<div class="example-content">
  <div class="example-canvas-area">
    <div class="demo-frame">
      <svg bind:this={svgEl} />
    </div>
  </div>

  <div class="example-controls-area">
    <div class="controls-panel">
      <div class="controls-panel-title">Parameters</div>
      <div class="demo-controls">
        <slot />
      </div>
    </div>

    <div class="controls-panel">
      <div class="controls-panel-title">Display</div>
      <div class="demo-toggles">
        <button class="toggle-btn {gridOn ? 'active' : ''}" onclick={() => (gridOn = !gridOn)}>Grid</button>
        <button class="toggle-btn {axesOn ? 'active' : ''}" onclick={() => (axesOn = !axesOn)}>Axes</button>
        <button class="toggle-btn {hatchOn ? 'active' : ''}" onclick={() => (hatchOn = !hatchOn)}>Hatch</button>
        <button class="toggle-btn {filterOn ? 'active' : ''}" onclick={() => (filterOn = !filterOn)}>Pencil</button>
      </div>
    </div>

    <div class="controls-panel">
      <div class="controls-panel-title">Camera</div>
      <div class="demo-toggles">
        <button class="toggle-btn {panOn ? 'active' : ''}" onclick={() => (panOn = !panOn)}>Pan</button>
        <button class="toggle-btn {zoomOn ? 'active' : ''}" onclick={() => (zoomOn = !zoomOn)}>Zoom</button>
        <button class="toggle-btn" onclick={() => scene?.resetCamera()}>Reset</button>
      </div>
    </div>
  </div>
</div>
