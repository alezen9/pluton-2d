<script lang="ts">
  type LegendItem = {
    label: string;
    color: string;
    variant?: string;
  };

  let { items }: { items: LegendItem[] } = $props();
</script>

<div class="legend">
  {#each items as item}
    <span class="legend-item">
      <span class="legend-swatch" style="background: {item.color}"></span>
      <span class="legend-label" style="color: {item.color}">{item.label}</span>
    </span>
  {/each}
</div>

<style>
  .legend {
    display: flex;
    gap: var(--space-5);
    padding-top: var(--space-2);
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: 0.78rem;
    font-weight: 500;
  }

  .legend-swatch {
    width: 10px;
    height: 10px;
    border-radius: 2px;
  }

  .legend-label {
    /* Color applied inline */
  }
</style>
