<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  const THRESHOLD = 500;

  let btn: HTMLButtonElement;
  let ring: SVGCircleElement;
  let circumference = 0;
  let rafId = 0;
  let ticking = false;

  const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

  const update = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollable =
      document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? clamp01(scrollTop / scrollable) : 0;

    ring.style.strokeDashoffset = String(circumference * (1 - progress));

    const show = scrollTop > THRESHOLD;
    btn.style.opacity = show ? "0.5" : "0";
    btn.style.pointerEvents = show ? "auto" : "none";
  };

  const queueUpdate = () => {
    if (ticking) return;
    ticking = true;
    rafId = requestAnimationFrame(() => {
      update();
      ticking = false;
    });
  };

  const onClick = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  onMount(() => {
    const r = Number(ring.getAttribute("r") ?? 0);
    circumference = 2 * Math.PI * r;
    ring.style.strokeDasharray = String(circumference);
    ring.style.strokeDashoffset = String(circumference);

    queueUpdate();
    window.addEventListener("scroll", queueUpdate, { passive: true });
    window.addEventListener("resize", queueUpdate);
  });

  onDestroy(() => {
    window.removeEventListener("scroll", queueUpdate);
    window.removeEventListener("resize", queueUpdate);
    cancelAnimationFrame(rafId);
  });
</script>

<button bind:this={btn} aria-label="scroll-to-top" onclick={onClick}>
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    stroke-linecap="round"
    stroke-linejoin="round"
    stroke="currentColor"
    stroke-width="2.4"
  >
    <path d="M12 4L6 10M12 4L18 10M12 4L12 14.5M12 20V17.5"></path>
  </svg>

  <svg class="progress" viewBox="0 0 36 36" aria-hidden="true">
    <circle
      bind:this={ring}
      class="scroll-progress"
      cx="18"
      cy="18"
      r="16"
      fill="none"
      stroke="currentColor"
      stroke-width="2.4"
      transform="rotate(-90 18 18)"
    />
  </svg>
</button>

<style>
  button {
    position: fixed;
    right: 2em;
    bottom: 2em;
    width: 3em;
    height: 3em;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    background-color: transparent;
    color: var(--accent);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.22s ease-out;
    z-index: 20;
    padding: 0.5em;
  }

  button:hover {
    opacity: 1 !important;
  }

  button svg.progress {
    position: absolute;
    inset: 0;
    color: var(--accent);
  }

  @media screen and (max-width: 480px) {
    button {
      display: none;
    }
  }
</style>
