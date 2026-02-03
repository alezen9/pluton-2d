<script>
  import { onMount, onDestroy, tick } from "svelte";
  import { Pluton2D } from "pluton-2d";

  let { code = "" } = $props();

  let svgEl;
  let scene;
  let activeTab = $state("scene");

  // Params
  let radius = $state(110);
  let thickness = $state(12);

  // Pluton knobs
  let panOn = $state(false);
  let zoomOn = $state(false);
  let hatchOn = $state(false);
  let filterOn = $state(false);
  let gridOn = $state(true);
  let axesOn = $state(true);

  onMount(() => {
    scene = new Pluton2D(svgEl, { radius, thickness });

    const geom = scene.geometry.group();
    const dims = scene.dimensions.group();

    scene.draw((p) => {
      const { radius: r, thickness: t } = p;
      const ir = r - t;

      const path = geom.path();

      path
        .moveToAbs(-r, 0)
        .arcTo(r, r, r, true)
        .arcTo(r, -r, r, true)
        .arcTo(-r, -r, r, true)
        .arcTo(-r, r, r, true);

      path
        .moveToAbs(-ir, 0)
        .arcTo(ir, ir, ir, true)
        .arcTo(ir, -ir, ir, true)
        .arcTo(-ir, -ir, ir, true)
        .arcTo(-ir, ir, ir, true);

      const dim = dims.dimension();
      const angle = Math.PI / 4;
      const x = r * Math.cos(angle);
      const y = r * Math.sin(angle);

      dim.moveToAbs(0, 0).centerMark(20);

      // Radius dimension
      dim
        .moveToAbs(0, 0)
        .lineToAbs(x, y)
        .arrowFilled(angle)
        .textAtAbs(x / 2 - 10, y / 2, `R${r}mm`, "end");

      // Wall thickness
      dim
        .moveToAbs(-r - 25, 0)
        .tick(-Math.PI / 2)
        .lineTo(0, -t)
        .tick(Math.PI / 2)
        .textAt(-10, t / 2, `${t}mm`, "end");
    });
  });

  $effect(() => {
    if (!scene) return;
    Object.assign(scene.params, { radius, thickness });
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
          <label>Radius</label>
          <input type="range" bind:value={radius} min={50} max={200} step={1} />
          <span class="value">{radius}</span>
        </div>
        <div class="demo-control">
          <label>Wall</label>
          <input type="range" bind:value={thickness} min={3} max={50} step={1} />
          <span class="value">{thickness}</span>
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

