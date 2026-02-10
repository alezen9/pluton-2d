<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { fade } from "svelte/transition";

  type TocItem = {
    id: string;
    text: string;
    level: 2 | 3;
  };

  let items: TocItem[] = [];
  let activeId = "";

  let headings: HTMLHeadingElement[] = [];
  let observer: IntersectionObserver | null = null;
  const visibleIds = new Set<string>();

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");

  const collectHeadings = () => {
    const seen = new Set<string>();

    headings = [
      ...document.querySelectorAll<HTMLHeadingElement>(
        "#doc-content h2, #doc-content h3",
      ),
    ];

    for (const heading of headings) {
      let id = heading.id.trim();
      if (!id) {
        const base = slugify(heading.textContent ?? "section") || "section";
        let candidate = base;
        let i = 2;
        while (seen.has(candidate)) {
          candidate = `${base}-${i++}`;
        }
        heading.id = candidate;
        id = candidate;
      }
      seen.add(id);
    }

    items = headings.map((heading) => ({
      id: heading.id,
      text: (heading.textContent ?? heading.id).trim(),
      level: heading.tagName === "H3" ? 3 : 2,
    }));

    activeId = headings[0]?.id ?? "";
  };

  const activeFromScrollPosition = () => {
    const offset = 132;
    let current = headings[0]?.id ?? "";
    for (const heading of headings) {
      if (heading.getBoundingClientRect().top <= offset) current = heading.id;
      else break;
    }
    activeId = current;
  };

  const updateActive = () => {
    if (visibleIds.size === 0) {
      activeFromScrollPosition();
      return;
    }

    let best: { id: string; top: number } | null = null;
    for (const id of visibleIds) {
      const heading = document.getElementById(id);
      if (!heading) continue;
      const top = heading.getBoundingClientRect().top;
      if (top >= 0 && (!best || top < best.top)) best = { id, top };
    }

    if (!best) {
      for (const heading of headings) {
        if (visibleIds.has(heading.id)) {
          best = { id: heading.id, top: 0 };
          break;
        }
      }
    }

    if (best) activeId = best.id;
  };

  const observeHeadings = () => {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visibleIds.add(entry.target.id);
          else visibleIds.delete(entry.target.id);
        }
        updateActive();
      },
      {
        rootMargin: "-18% 0px -70% 0px",
        threshold: 0,
      },
    );

    for (const heading of headings) observer.observe(heading);
  };

  const onViewportChange = () => {
    if (visibleIds.size === 0) activeFromScrollPosition();
  };

  onMount(() => {
    collectHeadings();
    if (items.length === 0) return;

    observeHeadings();
    window.addEventListener("scroll", onViewportChange, { passive: true });
    window.addEventListener("resize", onViewportChange);
  });

  onDestroy(() => {
    window.removeEventListener("scroll", onViewportChange);
    window.removeEventListener("resize", onViewportChange);
    observer?.disconnect();
    visibleIds.clear();
  });
</script>

{#if items.length > 0}
  <nav class="toc" aria-label="Table of contents">
    <p class="title">Overview</p>
    <ul transition:fade>
      {#each items as item}
        <li>
          <a
            href={`#${item.id}`}
            class:active={item.id === activeId}
            class:sub-item={item.level === 3}>{item.text}</a
          >
        </li>
      {/each}
    </ul>
  </nav>
{/if}

<style>
  .toc {
    position: fixed;
    top: calc(64px + 3em);
    left: 2rem;
    width: 300px;
    user-select: none;
  }

  .title {
    position: sticky;
    top: 0;
    font-size: 0.8125rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 400;
    margin: 0;
    color: var(--text-main);
    line-height: 1.1;
  }

  ul {
    margin-top: 1em;
    max-height: 75vh;
    overflow-y: auto;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 0.5em;
  }

  li {
    margin: 0;
  }

  a {
    display: block;
    color: var(--text-muted);
    text-decoration: none;
    font-size: 0.8125rem;
    line-height: 1.42;
    padding: 0;
    transition:
      color 0.18s,
      opacity 0.18s;
    opacity: 0.7;
  }

  a:hover {
    color: var(--text-main);
    opacity: 0.95;
    text-decoration: none;
  }

  a.active {
    color: var(--accent);
    opacity: 1;
  }

  .sub-item {
    padding-left: 0.78rem;
    font-size: 0.75rem;
  }

  @media screen and (max-width: 1480px) {
    .toc {
      visibility: hidden;
      pointer-events: none;
    }
  }
</style>
