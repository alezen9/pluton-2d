<script>
  import { onMount, onDestroy, tick } from "svelte";
  import { Pluton2D } from "pluton-2d";

  let { code = "" } = $props();

  let svgEl;
  let scene;
  let activeTab = $state("scene");

  // Params
  let width = $state(200);
  let height = $state(250);
  let thickness = $state(15);
  let outerRadius = $state(10);
  let innerRadius = $state(10);

  // Pluton knobs
  let panOn = $state(false);
  let zoomOn = $state(false);
  let hatchOn = $state(false);
  let filterOn = $state(false);
  let gridOn = $state(true);
  let axesOn = $state(true);

  onMount(() => {
    scene = new Pluton2D(svgEl, {
      width,
      height,
      thickness,
      outerRadius,
      innerRadius,
    });

    const geom = scene.geometry.group();
    const dims = scene.dimensions.group();

    scene.draw((p) => {
      const { width: w, height: h, thickness: t, outerRadius: ro, innerRadius: ri } = p;
      const iw = w - 2 * t;
      const ih = h - 2 * t;

      const path = geom.path();

      path
        .moveToAbs(-w / 2 + ro, -h / 2)
        .lineTo(w - 2 * ro, 0)
        .arcTo(ro, ro, ro, false)
        .lineTo(0, h - 2 * ro)
        .arcTo(-ro, ro, ro, false)
        .lineTo(-w + 2 * ro, 0)
        .arcTo(-ro, -ro, ro, false)
        .lineTo(0, -h + 2 * ro)
        .arcTo(ro, -ro, ro, false)
        .close();

      path
        .moveToAbs(-iw / 2 + ri, -ih / 2)
        .lineTo(iw - 2 * ri, 0)
        .arcTo(ri, ri, ri, false)
        .lineTo(0, ih - 2 * ri)
        .arcTo(-ri, ri, ri, false)
        .lineTo(-iw + 2 * ri, 0)
        .arcTo(-ri, -ri, ri, false)
        .lineTo(0, -ih + 2 * ri)
        .arcTo(ri, -ri, ri, false)
        .close();

      const dim = dims.dimension();

      // Width
      dim
        .moveToAbs(-w / 2, -h / 2 - 20)
        .tick(0)
        .lineTo(w, 0)
        .tick(0)
        .textAt(-w / 2, -16, `${w}mm`, "middle");

      // Height
      dim
        .moveToAbs(w / 2 + 40, -h / 2)
        .tick(-Math.PI / 2)
        .lineTo(0, h)
        .tick(Math.PI / 2)
        .textAt(5, -h / 2, `${h}mm`, "start");

      // Wall thickness
      dim
        .moveToAbs(-w / 2, 20)
        .tick(0)
        .lineTo(-30, 0)
        .moveToAbs(-w / 2 + t, 20)
        .tick(Math.PI)
        .lineTo(50, 0)
        .textAt(5, 0, `${t}mm`, "start");

      // Outer radius
      if (ro > 0) {
        dim
          .moveToAbs(w / 2 - ro, -h / 2)
          .lineTo(15, -15)
          .textAt(3, -3, `R${ro}mm`, "start");
      }

      // Inner radius
      if (ri > 0) {
        dim
          .moveToAbs(iw / 2 - ri, -ih / 2)
          .lineTo(12, -12)
          .textAt(3, -3, `r${ri}mm`, "start");
      }
    });
  });

  $effect(() => {
    if (!scene) return;
    Object.assign(scene.params, { width, height, thickness, outerRadius, innerRadius });
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
          <label>Width</label>
          <input type="range" bind:value={width} min={50} max={350} step={1} />
          <span class="value">{width}</span>
        </div>
        <div class="demo-control">
          <label>Height</label>
          <input type="range" bind:value={height} min={50} max={350} step={1} />
          <span class="value">{height}</span>
        </div>
        <div class="demo-control">
          <label>Wall</label>
          <input type="range" bind:value={thickness} min={3} max={50} step={1} />
          <span class="value">{thickness}</span>
        </div>
        <div class="demo-control">
          <label>Outer R</label>
          <input type="range" bind:value={outerRadius} min={0} max={30} step={1} />
          <span class="value">{outerRadius}</span>
        </div>
        <div class="demo-control">
          <label>Inner R</label>
          <input type="range" bind:value={innerRadius} min={0} max={30} step={1} />
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

