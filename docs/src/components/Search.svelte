<script lang="ts">
  import { onMount, onDestroy, tick } from "svelte";
  import {
    type Pagefind,
    type SearchResult,
    type RankedEntry,
    flattenResults,
    getSectionRank,
    getResultMeta,
    highlightText,
    getExcerpt,
  } from "./search-utils";

  const { base }: { base: string } = $props();

  const DEFAULT_META = "Search docs, API, guide, and examples";

  let query = $state("");
  let results: SearchResult[] = $state([]);
  let status: "idle" | "loading" | "results" | "empty" | "error" =
    $state("idle");
  let selectedIndex = $state(0);
  let dialogEl!: HTMLDialogElement;
  let inputEl!: HTMLInputElement;
  let listEl = $state<HTMLElement | undefined>();
  let pagefind: Pagefind | null = null;
  let activeSearchToken = 0;

  let metaText = $derived.by(() => {
    const q = query.trim();
    if (status === "idle") return DEFAULT_META;
    if (status === "loading") return `Searching for "${q}"...`;
    if (status === "results")
      return `${results.length} result${results.length === 1 ? "" : "s"} for "${q}"`;
    if (status === "empty") return `No results for "${q}"`;
    return "Search is unavailable right now";
  });

  const initPagefind = async () => {
    if (pagefind) return;
    try {
      pagefind = await import(
        /* @vite-ignore */ `${base}/pagefind/pagefind.js`
      );
    } catch (err) {
      console.error("Failed to load Pagefind:", err);
      status = "error";
    }
  };

  const reset = () => {
    query = "";
    results = [];
    selectedIndex = 0;
    status = "idle";
  };

  const doSearch = async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) {
      reset();
      return;
    }

    const token = ++activeSearchToken;
    status = "loading";

    await initPagefind();
    if (!pagefind || token !== activeSearchToken) return;

    try {
      const search = await pagefind.search(trimmed);
      const pages = await Promise.all(search.results.map((r) => r.data()));
      if (token !== activeSearchToken) return;

      const flat = pages.flatMap(flattenResults);
      results = flat
        .map(
          (r, i): RankedEntry => ({
            r,
            i,
            rank: getSectionRank(r.url || "#", base),
          }),
        )
        .sort((a, b) => a.rank - b.rank || a.i - b.i)
        .map((e) => e.r);
      selectedIndex = 0;
      status = results.length ? "results" : "empty";
    } catch (err) {
      console.error("Search failed:", err);
      if (token !== activeSearchToken) return;
      status = "empty";
    }
  };

  const open = () => {
    if (dialogEl.open) return;
    dialogEl.showModal();
    reset();
    requestAnimationFrame(() => inputEl.focus());
  };

  const close = () => {
    dialogEl.close();
    activeSearchToken++;
    reset();
  };

  const scrollSelectedIntoView = async () => {
    await tick();
    listEl?.querySelector(".selected")?.scrollIntoView({ block: "nearest" });
  };

  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
      return;
    }
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, results.length - 1);
      scrollSelectedIntoView();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
      scrollSelectedIntoView();
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      const url = results[selectedIndex].url;
      close();
      if (url) window.location.href = url;
    }
  };

  const onGlobalKeydown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      open();
    }
  };

  const onBackdropClick = (e: MouseEvent) => {
    if (e.target === dialogEl) close();
  };

  onMount(() => {
    window.addEventListener("keydown", onGlobalKeydown);
  });

  onDestroy(() => {
    window.removeEventListener("keydown", onGlobalKeydown);
  });
</script>

<button class="trigger" onclick={open} type="button">
  <svg
    width="16"
    height="16"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
  >
    <circle cx="7" cy="7" r="5" />
    <path d="m11 11 4 4" />
  </svg>
  <span class="trigger-text">Search</span>
  <kbd class="trigger-kbd">&#8984;K</kbd>
</button>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<dialog bind:this={dialogEl} onclick={onBackdropClick} onkeydown={onKeydown}>
  <div class="content">
    <header>
      <svg
        class="search-icon"
        width="16"
        height="16"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <circle cx="7" cy="7" r="5" />
        <path d="m11 11 4 4" />
      </svg>
      <input
        bind:this={inputEl}
        bind:value={query}
        oninput={() => doSearch(query)}
        type="text"
        placeholder="Search docs and examples..."
        autocomplete="off"
        spellcheck="false"
      />
      <button
        class="close-btn"
        onclick={close}
        type="button"
        aria-label="Close"
      >
        <svg
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M5 5l6 6M11 5l-6 6" />
        </svg>
      </button>
    </header>

    <div class="meta" data-status={status}>{metaText}</div>

    <div class="results">
      {#if status === "results"}
        <ul role="listbox" aria-label="Search results" bind:this={listEl}>
          {#each results as result, i}
            {@const title = result.title || "Untitled"}
            {@const url = result.url || "#"}
            {@const meta = getResultMeta(url, base)}
            {@const excerpt = getExcerpt(result.excerpt || "", query.trim())}
            <li role="option" aria-selected={i === selectedIndex}>
              <a
                href={url}
                class:selected={i === selectedIndex}
                onclick={() => close()}
              >
                <span class="section">{meta.section}</span>
                <span class="path"
                  >{@html highlightText(meta.path, query.trim())}</span
                >
                <span class="title"
                  >{@html highlightText(title, query.trim())}</span
                >
                {#if excerpt}
                  <span class="excerpt">{@html excerpt}</span>
                {/if}
              </a>
            </li>
          {/each}
        </ul>
      {:else if status === "idle"}
        <div class="empty">
          <p class="empty-title">Find anything quickly</p>
          <p class="empty-sub">
            Try: <code>dimension</code>, <code>hatch</code>,
            <code>basic shapes</code>
          </p>
        </div>
      {:else if status === "loading"}
        <div class="empty">
          <p class="empty-title">Searching...</p>
          <p class="empty-sub">Looking through pages and examples</p>
        </div>
      {:else if status === "empty"}
        <div class="empty">
          <p class="empty-title">No matches found</p>
          <p class="empty-sub">Try a broader term or fewer words</p>
        </div>
      {:else if status === "error"}
        <div class="empty">
          <p class="empty-title">Search unavailable</p>
          <p class="empty-sub">Try refreshing the page</p>
        </div>
      {/if}
    </div>

    <footer>
      <span><kbd>&#8593;</kbd><kbd>&#8595;</kbd> navigate</span>
      <span><kbd>&#8629;</kbd> open</span>
      <span><kbd>esc</kbd> close</span>
    </footer>
  </div>
</dialog>

<style>
  .trigger {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: color-mix(in oklab, var(--panel-bg) 84%, transparent);
    border: 1px solid var(--panel-border);
    border-radius: calc(var(--radius) - 1px);
    color: var(--text-muted);
    font-size: 0.875rem;
    font-family: inherit;
    cursor: pointer;
    transition:
      background 0.2s,
      border-color 0.2s,
      color 0.2s;
    width: 100%;
    min-width: 40px;
  }
  .trigger:hover {
    color: var(--text-main);
    border-color: var(--panel-border-strong);
  }
  .trigger svg {
    flex-shrink: 0;
    opacity: 0.7;
  }
  .trigger-text {
    display: none;
    flex: 1;
    text-align: left;
  }
  .trigger-kbd {
    display: none;
    padding: 0.125rem var(--space-2);
    background: var(--tab-hover-bg);
    border: 1px solid var(--panel-border);
    border-radius: 3px;
    font-size: 0.6875rem;
    font-family: var(--font-mono);
    line-height: 1;
    opacity: 0.6;
  }
  @media (min-width: 600px) {
    .trigger-text {
      display: block;
    }
  }
  @media (min-width: 1024px) {
    .trigger-kbd {
      display: block;
    }
  }

  dialog {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    margin: 0;
    padding: 0;
    border: none;
    background: transparent;
    overflow: hidden;
    z-index: 9999;
  }
  dialog::backdrop {
    background: rgba(18, 26, 29, 0.84);
    backdrop-filter: blur(14px) saturate(125%);
  }

  .content {
    width: min(94vw, 760px);
    margin: clamp(0.75rem, 5vh, 4rem) auto 0;
    border: 1px solid var(--panel-border);
    border-radius: 14px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    max-height: min(80vh, 760px);
    background: var(--panel-bg-solid);
    box-shadow: 0 24px 60px -12px rgba(0, 0, 0, 0.7);
  }

  header {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-5);
    border-bottom: 1px solid var(--panel-border);
    flex-shrink: 0;
  }
  .search-icon {
    color: var(--accent);
    flex-shrink: 0;
  }
  input {
    flex: 1;
    min-width: 0;
    background: transparent;
    border: none;
    outline: none;
    color: var(--text-main);
    font-size: 1rem;
    font-family: inherit;
  }
  input::placeholder {
    color: var(--text-muted);
    opacity: 0.5;
  }
  .close-btn {
    width: 28px;
    height: 28px;
    background: transparent;
    border: 1px solid var(--panel-border);
    color: var(--text-muted);
    cursor: pointer;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .close-btn:hover {
    color: var(--text-main);
    border-color: var(--panel-border-strong);
  }

  .meta {
    padding: 0.5rem var(--space-5);
    border-bottom: 1px solid var(--panel-border);
    color: var(--text-muted);
    font-size: 0.78rem;
    flex-shrink: 0;
  }
  .meta[data-status="results"] {
    color: var(--accent);
  }

  .results {
    flex: 1;
    overflow-y: auto;
    min-height: 240px;
    padding: 0.5rem;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }
  li {
    margin: 0;
  }

  li a {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0 0.45rem;
    text-decoration: none;
    border: 1px solid transparent;
    border-left: 4px solid transparent;
    border-radius: 0 4px 4px 0;
    padding: 0.65rem 0.75rem;
    background: color-mix(in oklab, var(--panel-bg) 78%, transparent);
    transition:
      background 0.15s,
      border-color 0.15s;
  }
  li a:hover,
  li a.selected {
    border-color: var(--panel-border);
    border-left-color: var(--accent);
    background: var(--accent-light);
  }
  .section {
    grid-column: 1;
    align-self: center;
    border-radius: 4px;
    border: 1px solid color-mix(in oklab, var(--accent) 33%, transparent);
    background: var(--accent-light);
    color: var(--accent-hover);
    font-size: 0.64rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    padding: 0.12rem 0.4rem;
    line-height: 1.2;
  }
  .path {
    grid-column: 2;
    align-self: center;
    color: var(--text-muted);
    opacity: 0.7;
    font-size: 0.74rem;
  }
  .title {
    grid-column: 1 / -1;
    color: var(--text-main);
    font-size: 0.95rem;
    font-weight: 500;
    line-height: 1.35;
    margin-top: 0.35rem;
  }
  li a:hover .title,
  li a.selected .title {
    color: var(--accent-hover);
  }
  .excerpt {
    grid-column: 1 / -1;
    color: var(--text-muted);
    margin-top: 0.3rem;
    font-size: 0.8rem;
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .results :global(mark) {
    background: var(--accent-light);
    border-radius: 2px;
    color: var(--accent-hover);
    padding: 0.03em 0.2em;
    font-weight: 600;
  }

  .empty {
    display: grid;
    align-content: center;
    justify-items: center;
    gap: var(--space-2);
    min-height: 100%;
    padding: var(--space-10) var(--space-6);
    text-align: center;
  }
  .empty-title {
    margin: 0;
    color: var(--text-main);
    font-size: 0.95rem;
  }
  .empty-sub {
    margin: 0;
    color: var(--text-muted);
    font-size: 0.82rem;
  }
  .empty-sub code {
    font-size: 0.8em;
    padding: 0.1em 0.4em;
  }

  footer {
    border-top: 1px solid var(--panel-border);
    padding: 0.55rem var(--space-5);
    flex-shrink: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.6rem 1rem;
    font-size: 0.69rem;
    color: var(--text-muted);
    opacity: 0.7;
    text-transform: lowercase;
  }
  footer kbd {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    padding: 0.1rem 0.3rem;
    border-radius: 4px;
    background: var(--tab-hover-bg);
    border: 1px solid var(--panel-border);
    font-size: 0.62rem;
    font-family: var(--font-mono);
    margin-right: 0.15rem;
  }

  @media (max-width: 768px) {
    .content {
      width: 100%;
      max-height: calc(100vh - 1.5rem);
      border-radius: 12px;
      margin-top: 0.75rem;
    }
    header {
      padding: 0.75rem;
    }
    .meta,
    footer {
      padding-left: 0.75rem;
      padding-right: 0.75rem;
    }
    .results {
      padding: 0.4rem;
      min-height: 220px;
    }
  }
</style>
