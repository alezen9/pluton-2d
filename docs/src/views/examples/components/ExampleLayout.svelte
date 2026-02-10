<script lang="ts" generics="P extends Record<string, unknown>">
  import type { Pluton2D } from "pluton-2d";
  import type { Snippet } from "svelte";
  import type { InitialToggles } from "../types";
  import ExampleCanvas from "./ExampleCanvas.svelte";
  import ExampleControls from "./ExampleControls.svelte";
  import ExampleDisplayToggles from "./ExampleDisplayToggles.svelte";

  let {
    initialParams,
    onSetup,
    drawing,
    controls,
    children,
    initialToggles = {},
    mobileScale = 0.7,
    tabletScale = 0.85,
  }: {
    initialParams: P;
    onSetup: (scene: Pluton2D<P>) => void;
    drawing?: Snippet<[Pluton2D<P> | null]>;
    controls?: Snippet;
    children?: Snippet;
    initialToggles?: Partial<InitialToggles>;
    mobileScale?: number;
    tabletScale?: number;
  } = $props();

  let scene = $state<Pluton2D<P> | null>(null);
</script>

<div class="scene-layout">
  <ExampleCanvas
    {initialParams}
    {onSetup}
    {drawing}
    {mobileScale}
    {tabletScale}
    bind:scene
  />

  <div class="example-controls-area">
    <ExampleControls {controls} {children} />
    <ExampleDisplayToggles {scene} {initialToggles} />
  </div>
</div>

<style>
  .scene-layout {
    --control-track: rgba(198, 222, 230, 0.2);
    --control-thumb: #edf3f5;
    --control-thumb-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
    --controls-width: 300px;
    display: flex;
    gap: var(--space-6);
    min-height: 0;
    justify-content: center;
  }

  .example-controls-area {
    width: var(--controls-width);
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    overflow-y: auto;
    min-width: 0;
  }

  :global(.pluton-root .pluton-dimensions text.title) {
    font-size: 0.75rem;
    letter-spacing: 0.07em;
    font-weight: 500;
    text-transform: uppercase;
  }

  @media (max-width: 768px) {
    .scene-layout {
      flex-direction: column;
      gap: var(--space-3);
    }

    .example-controls-area {
      width: 100%;
      flex-direction: column;
      gap: var(--space-2);
      overflow-y: visible;
    }

    .example-controls-area :global(.controls-panel) {
      width: 100%;
      min-width: unset;
    }
  }
</style>
