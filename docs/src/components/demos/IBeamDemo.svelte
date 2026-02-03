<script>
  import { onMount, onDestroy, tick } from "svelte";
  import { Pluton2D } from "pluton-2d";

  let { code = "" } = $props();

  let svgEl;
  let scene;
  let activeTab = $state("scene");

  // Params
  let width = $state(200);
  let height = $state(300);
  let flangeThickness = $state(40);
  let webThickness = $state(20);
  let filletRadius = $state(12);

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
      flangeThickness,
      webThickness,
      filletRadius,
    });

    const geom = scene.geometry.group();
    const dims = scene.dimensions.group();

    scene.draw((p) => {
      const fw = p.width;
      const ft = p.flangeThickness;
      const wt = p.webThickness;
      const h = p.height;
      const r = p.filletRadius;

      const path = geom.path();
      path
        .moveToAbs(0, 0)
        .lineTo(fw / 2, 0)
        .lineTo(0, ft)
        .lineTo(-fw / 2 + wt / 2 + r, 0)
        .arcTo(-r, r, r, true)
        .lineTo(0, h - 2 * ft - 2 * r)
        .arcTo(r, r, r, true)
        .lineTo(fw / 2 - wt / 2 - r, 0)
        .lineTo(0, ft)
        .lineTo(-fw, 0)
        .lineTo(0, -ft)
        .lineTo(fw / 2 - wt / 2 - r, 0)
        .arcTo(r, -r, r, true)
        .lineTo(0, -h + 2 * ft + 2 * r)
        .arcTo(-r, -r, r, true)
        .lineTo(-fw / 2 + wt / 2 + r, 0)
        .lineTo(0, -ft)
        .lineTo(fw / 2, 0)
        .close();

      geom.translate(0, -h / 2);

      const dim = dims.dimension();

      // Web thickness
      dim
        .moveToAbs(-wt / 2, (h / 2 - ft) / 2)
        .tick(0)
        .lineTo(-30, 0)
        .moveToAbs(wt / 2, (h / 2 - ft) / 2)
        .tick(Math.PI)
        .lineTo(50, 0)
        .textAt(10, 0, `${wt}mm`, "start");

      // Flange width
      dim
        .moveToAbs(-fw / 2, -h / 2 - 20)
        .tick(0)
        .lineTo(fw, 0)
        .tick(0)
        .textAt(-fw / 2, -16, `${fw}mm`, "middle");

      // Total height
      dim
        .moveToAbs(fw / 2 + 40, -h / 2)
        .tick(-Math.PI / 2)
        .lineTo(0, h)
        .tick(Math.PI / 2)
        .textAt(18, -h / 2, `${h}mm`, "start");

      // Fillet radius indicator
      if (r > 0) {
        const rx = -wt / 2 - r;
        const ry = ft + r;
        dim
          .moveToAbs(rx, ry)
          .lineTo(-20, 20)
          .textAt(-5, 5, `R${r}mm`, "start");
      }
    });
  });

  $effect(() => {
    if (!scene) return;
    Object.assign(scene.params, {
      width,
      height,
      flangeThickness,
      webThickness,
      filletRadius,
    });
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
          <input type="range" bind:value={height} min={100} max={450} step={1} />
          <span class="value">{height}</span>
        </div>
        <div class="demo-control">
          <label>Flange</label>
          <input type="range" bind:value={flangeThickness} min={10} max={80} step={1} />
          <span class="value">{flangeThickness}</span>
        </div>
        <div class="demo-control">
          <label>Web</label>
          <input type="range" bind:value={webThickness} min={5} max={50} step={1} />
          <span class="value">{webThickness}</span>
        </div>
        <div class="demo-control">
          <label>Fillet</label>
          <input type="range" bind:value={filletRadius} min={0} max={30} step={1} />
          <span class="value">{filletRadius}</span>
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

