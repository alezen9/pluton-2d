<script lang="ts" generics="P extends Record<string, unknown>">
  import { Pluton2D } from "pluton-2d";
  import SceneLayout from "./SceneLayout.svelte";
  import type { Snippet } from "svelte";

  let {
    initialParams,
    onSetup,
    params,
    children,
    initialFilterOn = false,
  }: {
    initialParams: P;
    onSetup: (scene: Pluton2D<P>) => void;
    params?: Snippet;
    children?: Snippet;
    initialFilterOn?: boolean;
  } = $props();

  const controls = params ?? children;
</script>

<SceneLayout {initialParams} {onSetup} {initialFilterOn} params={controls} />
