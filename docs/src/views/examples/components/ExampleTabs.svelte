<script lang="ts">
  const tabGroupId = `example-tabs-${Math.random().toString(36).slice(2, 10)}`;
  const sceneTabId = `${tabGroupId}-scene`;
  const codeTabId = `${tabGroupId}-code`;
</script>

<div class="example-content">
  <input id={sceneTabId} class="tab-toggle" type="radio" name={tabGroupId} checked />
  <input id={codeTabId} class="tab-toggle" type="radio" name={tabGroupId} />

  <div class="example-tabs">
    <label class="tab-btn" for={sceneTabId}>Scene</label>
    <label class="tab-btn" for={codeTabId}>Code</label>
  </div>

  <div class="tab-panel tab-panel-scene">
    <slot name="scene" />
  </div>

  <div class="tab-panel tab-panel-code">
    <div class="code-tab">
      <slot name="code" />
    </div>
  </div>
</div>

<style>
  .example-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    position: relative;
  }

  .tab-toggle {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    opacity: 0;
    pointer-events: none;
  }

  .example-tabs {
    display: flex;
    gap: 0.25rem;
    margin-bottom: 0.9rem;
    flex-shrink: 0;
  }

  .tab-btn {
    background: transparent;
    border: 1px solid transparent;
    padding: 0.28rem 1.1rem;
    border-radius: 5px;
    font-size: 0.84rem;
    font-weight: 500;
    font-family: inherit;
    color: var(--text-muted);
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }

  .tab-toggle:first-of-type:checked ~ .example-tabs .tab-btn:last-child:hover,
  .tab-toggle:last-of-type:checked ~ .example-tabs .tab-btn:first-child:hover {
    background: var(--tab-hover-bg);
    border-color: color-mix(in oklab, var(--panel-border) 92%, transparent);
    color: var(--text-main);
    text-decoration: none;
  }

  .tab-toggle:first-of-type:checked ~ .example-tabs .tab-btn:first-child,
  .tab-toggle:last-of-type:checked ~ .example-tabs .tab-btn:last-child {
    background: var(--accent-light);
    border-color: color-mix(in oklab, var(--accent) 32%, var(--panel-border));
    color: var(--accent);
  }

  .code-tab {
    flex: 1;
    min-height: 0;
    overflow: auto;
  }

  .code-tab :global(pre) {
    background: var(--panel-bg);
    border: 1px solid var(--panel-border);
    margin-bottom: 0;
    color: var(--text-muted);
  }

  .tab-panel {
    display: none;
  }

  .tab-toggle:first-of-type:checked ~ .tab-panel-scene,
  .tab-toggle:last-of-type:checked ~ .tab-panel-code {
    display: contents;
  }
</style>
