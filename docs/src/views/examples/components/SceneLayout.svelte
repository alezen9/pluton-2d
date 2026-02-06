<script lang="ts" generics="P extends Record<string, unknown>">
  import { Pluton2D } from "pluton-2d";
  import type { Snippet } from "svelte";
  import SceneCanvas from "./SceneCanvas.svelte";
  import SceneControls from "./SceneControls.svelte";

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

  let scene: Pluton2D<P> | null = $state(null);

  let panOn = $state(true);
  let zoomOn = $state(true);
  let gridOn = $state(true);
  let axesOn = $state(true);
  let hatchOn = $state(true);
  let filterOn = $state(initialFilterOn);

  const resetCamera = () => {
    scene?.resetCamera();
  };
</script>

<div class="scene-layout">
  <SceneCanvas
    {initialParams}
    {onSetup}
    {panOn}
    {zoomOn}
    {gridOn}
    {axesOn}
    {hatchOn}
    {filterOn}
    bind:scene
  />

  <SceneControls
    {params}
    bind:panOn
    bind:zoomOn
    bind:gridOn
    bind:axesOn
    bind:hatchOn
    bind:filterOn
    onResetCamera={resetCamera}
  />
</div>

<style>
  .scene-layout {
    --control-track: rgba(198, 222, 230, 0.2);
    --control-thumb: #edf3f5;
    --control-thumb-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 1.45rem;
    min-height: 0;
  }

  :global(.pluton-root .pluton-geometry path.demo-blue) {
    stroke: #2563eb;
  }

  :global(.pluton-root .pluton-geometry path.demo-teal) {
    stroke: #0f766e;
  }

  :global(.pluton-root .pluton-geometry path.demo-orange) {
    stroke: #ea580c;
  }

  :global(.pluton-root .pluton-geometry path.demo-purple) {
    stroke: #7c3aed;
  }

  :global(.pluton-root .pluton-geometry path.demo-rose) {
    stroke: #e11d48;
  }

  :global(.pluton-root .pluton-geometry path.demo-amber) {
    stroke: #d97706;
  }

  :global(.pluton-root .pluton-geometry path.demo-static) {
    stroke: #f97316;
    stroke-width: 2;
  }

  :global(.pluton-root .pluton-geometry path.demo-dynamic) {
    stroke: #0f766e;
    stroke-width: 2;
  }

  @media (max-width: 1024px) {
    .scene-layout {
      flex-direction: column;
      gap: 1rem;
      overflow-y: auto;
    }
  }
</style>
