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
  // svelte-ignore state_referenced_locally
  let filterOn = $state(initialFilterOn);

  const resetCamera = () => scene?.resetCamera();
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

  :global(.pluton-root .pluton-dimensions text.title) {
    font-size: 0.75rem;
    letter-spacing: 0.07em;
    font-weight: 500;
    text-transform: uppercase;
  }

  @media (max-width: 1024px) {
    .scene-layout {
      flex-direction: column;
      gap: 1rem;
      overflow-y: auto;
    }
  }
</style>
