<script lang="ts">
  import type { Snippet } from "svelte";

  type Tab = { label: string; content: Snippet };

  let { tabs }: { tabs: Tab[] } = $props();
  let active = $state(0);
</script>

<div class="example-content">
  <div class="example-tabs">
    {#each tabs as tab, i}
      <button class="tab-btn {active === i ? 'active' : ''}" onclick={() => (active = i)}>
        {tab.label}
      </button>
    {/each}
  </div>

  {#each tabs as tab, i}
    <div class="tab-panel {active === i ? '' : 'hidden'}">
      {@render tab.content()}
    </div>
  {/each}
</div>
