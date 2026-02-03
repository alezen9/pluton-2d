<script>
  import { onMount, onDestroy, tick } from "svelte";
  import { Pluton2D } from "pluton-2d";

  let { code = "" } = $props();

  let svgEl;
  let scene;
  let activeTab = $state("scene");

  // Params
  let radius = $state(120);
  let innerRadius = $state(80);

  // Pluton knobs
  let panOn = $state(false);
  let zoomOn = $state(false);
  let hatchOn = $state(false);
  let filterOn = $state(false);
  let gridOn = $state(true);
  let axesOn = $state(true);

  onMount(() => {
    scene = new Pluton2D(svgEl, { radius, innerRadius });

    const geom = scene.geometry.group();

    scene.draw((p) => {
      const r = p.radius;
      const ir = p.innerRadius;

      // Single path with outer + inner (creates donut via fill-rule)
      const donut = geom.path();

      // Outer ring — clockwise
      donut
        .moveToAbs(-r, 0)
        .arcTo(r, r, r, true)
        .arcTo(r, -r, r, true)
        .arcTo(-r, -r, r, true)
        .arcTo(-r, r, r, true)
        .close();

      // Inner ring — counter-clockwise (cutout)
      donut
        .moveToAbs(0, ir)
        .arcToAbs(-ir, 0, ir, false)
        .arcToAbs(0, -ir, ir, false)
        .arcToAbs(ir, 0, ir, false)
        .arcToAbs(0, ir, ir, false)
        .close();
    });
  });

  $effect(() => {
    if (!scene) return;
    Object.assign(scene.params, { radius, innerRadius });
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
          <label>Outer</label>
          <input type="range" bind:value={radius} min={40} max={200} step={1} />
          <span class="value">{radius}</span>
        </div>
        <div class="demo-control">
          <label>Inner</label>
          <input type="range" bind:value={innerRadius} min={20} max={180} step={1} />
          <span class="value">{innerRadius}</span>
        </div>
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

