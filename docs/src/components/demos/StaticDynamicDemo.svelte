<script>
  import { onMount, onDestroy, tick } from "svelte";
  import { Pluton2D } from "pluton-2d";

  let { code = "" } = $props();

  let svgEl;
  let scene;
  let activeTab = $state("scene");

  // Params
  let size = $state(140);

  // Pluton knobs
  let panOn = $state(false);
  let zoomOn = $state(false);
  let hatchOn = $state(false);
  let filterOn = $state(false);
  let gridOn = $state(true);
  let axesOn = $state(true);

  onMount(() => {
    scene = new Pluton2D(svgEl, { size });

    const staticGroup = scene.geometry.group();
    staticGroup.setDrawUsage("static");

    const dynamicGroup = scene.geometry.group();

    scene.draw((p) => {
      const half = p.size / 2;
      const offset = 90;

      const staticPath = staticGroup.path({ className: "demo-static" });
      staticPath
        .moveToAbs(-offset - half, -half)
        .lineTo(p.size, 0)
        .lineTo(0, p.size)
        .lineTo(-p.size, 0)
        .close();

      const dynamicPath = dynamicGroup.path({ className: "demo-dynamic" });
      dynamicPath
        .moveToAbs(offset - half, -half)
        .lineTo(p.size, 0)
        .lineTo(0, p.size)
        .lineTo(-p.size, 0)
        .close();
    });
  });

  $effect(() => {
    if (!scene) return;
    scene.params.size = size;
    scene.enablePan(panOn);
    scene.enableZoom(zoomOn);
    scene.enableHatchFill(hatchOn);
    scene.enableFilter(filterOn);
    scene.enableGrid(gridOn);
    scene.enableAxes(axesOn);
  });

  $effect(() => {
    if (activeTab === 'code') {
      tick().then(() => {
        if (typeof Prism !== 'undefined') Prism.highlightAll();
      });
    }
  });

  onDestroy(() => {
    scene?.dispose();
  });
</script>

<div class="example-content">
  <div class="example-canvas-area">
    <div class="example-tabs">
      <button class="example-tab {activeTab === 'scene' ? 'active' : ''}" onclick={() => activeTab = 'scene'}>Scene</button>
      <button class="example-tab {activeTab === 'code' ? 'active' : ''}" onclick={() => activeTab = 'code'}>Code</button>
    </div>
    <div class="example-tab-content {activeTab === 'scene' ? 'active' : ''}">
      <div class="demo-frame">
        <svg bind:this={svgEl} />
      </div>
    </div>
    <div class="example-tab-content {activeTab === 'code' ? 'active' : ''}">
      <div class="example-code">
        <pre><code class="language-typescript">{code}</code></pre>
      </div>
    </div>
  </div>

  <div class="example-controls-area">
    <div class="controls-panel">
      <div class="controls-panel-title">Parameters</div>
      <div class="demo-controls">
        <div class="demo-control">
          <label>Size</label>
          <input type="range" bind:value={size} min={40} max={200} step={1} />
          <span class="value">{size}</span>
        </div>
      </div>
      <div class="legend">
        <span class="legend-item"><span class="legend-swatch static"></span><span class="legend-label static">Static</span></span>
        <span class="legend-item"><span class="legend-swatch dynamic"></span><span class="legend-label dynamic">Dynamic</span></span>
      </div>
    </div>

    <div class="controls-panel">
      <div class="controls-panel-title">Display</div>
      <div class="demo-toggles">
        <button class="toggle-btn {gridOn ? 'active' : ''}" onclick={() => gridOn = !gridOn}>Grid</button>
        <button class="toggle-btn {axesOn ? 'active' : ''}" onclick={() => axesOn = !axesOn}>Axes</button>
        <button class="toggle-btn {hatchOn ? 'active' : ''}" onclick={() => hatchOn = !hatchOn}>Hatch</button>
        <button class="toggle-btn {filterOn ? 'active' : ''}" onclick={() => filterOn = !filterOn}>Pencil</button>
      </div>
    </div>

    <div class="controls-panel">
      <div class="controls-panel-title">Camera</div>
      <div class="demo-toggles">
        <button class="toggle-btn {panOn ? 'active' : ''}" onclick={() => panOn = !panOn}>Pan</button>
        <button class="toggle-btn {zoomOn ? 'active' : ''}" onclick={() => zoomOn = !zoomOn}>Zoom</button>
        <button class="toggle-btn" onclick={() => scene?.resetCamera()}>Reset</button>
      </div>
    </div>
  </div>
</div>

<style>
  .legend {
    display: flex;
    gap: 1rem;
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--panel-border, rgba(255, 255, 255, 0.07));
  }
</style>
