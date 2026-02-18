# pluton-2d

<br />

<figure style="width: 75%; margin: auto;">
  <img
    src="https://pluton-2d.aleksandargjoreski.dev/franky-pluton.webp"
    alt="Franky Pluton blueprints - Enies Lobby"
  />
</figure>

<br />
<br />
<br />

I started working on this library for my own workflow, I needed a simple technical drawing tool based on SVG for crisp output and low DOM churn. The result provides built-in helpers for grids, dimensions, hatching, and camera controls without hiding
the SVG/DOM model. It fits my need pretty well for now, sharing it in case someone else needs the same kind of tooling :)

<br />

- [What you get](#what-you-get)
- [Getting started](#getting-started)
- [How rendering works](#how-rendering-works)
- [Coordinate system](#coordinate-system)
- [API](#api)
- [Camera controls](#camera-controls)
- [Styling](#styling)
- [Performance](#performance)
- [When to use](#when-to-use)
- [Troubleshooting](#troubleshooting)
- [SSR](#ssr)

<br />
<br />
<br />

## What you get

- **SVG-first rendering** &rarr; inspectable DOM and sharp output at any zoom
- **Drafting helpers** &rarr; built-in grid, axes, dimensions, and hatch fill
- **Low DOM churn** &rarr; reused builders with change-only attribute writes
- **Reactive params** &rarr; mutate params and redraws are scheduled automatically
- **Opt-in camera** &rarr; pan/zoom only when enabled, reset anytime
- **CSS-driven styling** &rarr; control visuals through CSS variables on the root SVG

<br />
<br />
<br />

## Getting started

Install the package and import the default stylesheet:

```bash
npm install pluton-2d
```

```ts
import "pluton-2d/style.css";
import { Pluton2D } from "pluton-2d";

const svg = document.querySelector("svg")!;
const scene = new Pluton2D(svg, {
  params: { width: 240, height: 120 },
});

scene.enablePan(true);
scene.enableZoom(true);

const geom = scene.geometry.group();

// drawing a rectangle
scene.draw((p) => {
  const path = geom.path();
  path
    .moveToAbs(-p.width / 2, -p.height / 2)
    .lineTo(p.width, 0)
    .lineTo(0, p.height)
    .lineTo(-p.width, 0)
    .close();
});
```

<br />

Mutating params triggers redraws automatically:

```ts
scene.params.width = 150;
// or
Object.assign(scene.params, { width: 200, height: 100 });
```

<br />

🚨 **Constraints: params must be flat, and top-level reassignment is not supported.**

```ts
scene.params = { width: 200, height: 100 }; // throws
```

<br />
<br />
<br />

## How rendering works

1. **Reactive params** &rarr; Param mutation calls `scheduleRender()`
2. **Frame-capped loop (60 FPS)** &rarr; `beginRecord()` resets active indexes, draw callbacks run, then `commit()` applies changes
3. **Group reuse** &rarr; Create groups once, request builders every frame

<br />

```ts
const g = scene.geometry.group();

scene.draw(() => {
  const path = g.path();
  path.moveToAbs(0, 0).lineTo(10, 10);
});
```

<br />

Builders are pooled internally. Elements are created only when needed, and attributes are written only when changed.

<br />
<br />
<br />

## Coordinate system

Pluton uses a **center origin with Y-up coordinates**.

- Origin is the center of the viewport
- Positive X is right, positive Y is **up**
- `lineTo(10, 20)` moves right 10 units and up 20 units

The viewport layer applies `scale(1, -1)` for SVG rendering. Use dimension helpers when placing text/annotations so orientation stays correct.

<br />
<br />
<br />

## API

This section is the practical surface for day-to-day usage. For exhaustive method-by-method docs, see [API Reference](https://pluton-2d.aleksandargjoreski.dev/api/).

<br />

### Construction

```ts
const scene = new Pluton2D(svg, {
  params: { width: 240, height: 120 },
});
```

`params` can be any flat shape (type inferred from the object). Nested objects are not supported.

<br />

#### ViewBox (coordinate space)

Set an explicit drawing coordinate system:

```ts
const scene = new Pluton2D(svg, {
  params: { width: 240, height: 120 },
  viewBox: { width: 200, height: 300 },
});
```

Viewport priority order:

1. Constructor `viewBox`
2. SVG `viewBox` attribute
3. SVG pixel size (`getBoundingClientRect`)

Migration note:

- `new Pluton2D(svg, params, { filterIntensity })` was removed
- Use `scene.setDisplacementScale(...)`

<br />

### Draw loop

```ts
const unsubscribe = scene.draw((params) => {
  // build geometry and dimensions
});

unsubscribe(); // optional
scene.dispose(); // required when tearing down the scene
```

If all draw callbacks are removed, pending renders stop unless camera/input requests frames.

<br />

### Controls

```ts
scene.enableFilter(true); // default: false
scene.setDisplacementScale(2.75); // default: 2.75
scene.setDisplacementFrequency(0.1); // default: 0.1
scene.setDisplacementOctaves(1); // default: 1

scene.enableMask(false); // default: false
scene.setMaskFrequency(0.03); // default: 0.03
scene.setMaskOctaves(1); // default: 1
scene.setMaskScale(1.6); // default: 1.6

scene.enableFill(true); // default: true

scene.enableGrid(true); // default: true

scene.enableAxes(true); // default: true
```

The hand-drawn filter has two independent parts:

- Displacement (`setDisplacementScale/Frequency/Octaves`) — wobble applied to strokes and fills.
- Mask (`setMaskScale/Frequency/Octaves/Enabled`) — incomplete-line masking applied to geometry groups (fills and strokes). Disabled by default.

Safari caveat: SVG filters can be expensive during zoom.

<br />

### Geometry

Create groups outside draw callbacks, request builders inside draw callbacks:

```ts
const g = scene.geometry.group();

scene.draw((p) => {
  g.path({ className: "my-shape" })
    .moveToAbs(0, 0)
    .lineTo(p.width, 0)
    .lineTo(0, p.height)
    .close();
});
```

Most-used group methods:

```ts
group.translate(x, y)
group.scale(x, y)
group.setDrawUsage("static" | "dynamic") // default: "dynamic"
group.clear()
```

Most-used path methods:

```ts
path.moveToAbs(x, y)
path.lineTo(dx, dy)
path.lineToAbs(x, y)
path.arcTo(dx, dy, r, clockwise?, largeArc?)
path.cubicTo(c1dx, c1dy, c2dx, c2dy, dx, dy)
path.close()
```

<br />

### Dimensions

Dimensions are a separate layer for annotation primitives:

```ts
const d = scene.dimensions.group();

scene.draw(() => {
  d.dimension()
    .moveToAbs(-40, 0)
    .tick(0)
    .lineTo(80, 0)
    .tick(0)
    .textAt(0, -10, "80");
});
```

Most-used dimension methods:

```ts
dim.moveToAbs(x, y)
dim.lineTo(dx, dy)
dim.arc(r, startAngle, endAngle)
dim.arrow(angleRad, size?)
dim.tick(angleRad, size?)
dim.textAt(dx, dy, text, align?, className?)
```

Text align: `"start" | "middle" | "end"` (default: `"middle"`).

<br />
<br />
<br />

## Camera controls

Pan/zoom are opt-in and can be reset anytime:

```ts
scene.enablePan(true); // middle-mouse or shift+left-click
scene.enableZoom(true); // mouse wheel, 1x-20x range
scene.resetCamera();
```

<br />

### Responsive view scaling

Use `setViewScale(...)` to scale visual output without changing coordinate space or camera zoom state:

```ts
if (window.innerWidth <= 768) {
  scene.setViewScale(0.75);
} else {
  scene.setViewScale(1.0);
}
```

<br />
<br />
<br />

## Styling

All styling is controlled by CSS variables on `.pluton-root`:

```css
.pluton-root {
  /* Grid */
  --pluton-grid-minor-stroke: rgba(0, 0, 0, 0.025);
  --pluton-grid-major-stroke: rgba(0, 0, 0, 0.12);
  --pluton-grid-stroke-width: 0.5;

  /* Axes */
  --pluton-axis-color: rgba(0, 0, 0, 0.2);
  --pluton-axis-stroke-width: 1;
  --pluton-axis-dash: 5 5;

  /* Geometry */
  --pluton-geometry-stroke: rgba(0, 0, 0, 0.7);
  --pluton-geometry-stroke-width: 1;

  /* Hatch stroke color used by built-in hatch patterns */
  --pluton-hatch-color: rgba(0, 39, 50, 0.14);

  /* Dimensions */
  --pluton-dim-color: black;
  --pluton-dim-stroke-width: 1;
  --pluton-dim-text-color: rgba(0, 0, 0, 0.6);
  --pluton-dim-font-size: 12px;
  --pluton-dim-font-family: system-ui, sans-serif;
}
```

<br />

### Custom classes

```ts
g.path({ className: "my-custom-path" });
d.dimension({ className: "highlighted-dim" });
```

<br />

### Hatch fill

Fill resolution order when fills are enabled (`scene.enableFill(true)`, default):

- if `path({ fill })` is set, that value is used
- otherwise, default hatch fill is used

```ts
const blueFillId = scene.addHatchFill("#2563eb", 0.35);
g.path({ fill: blueFillId });
```

Use `fill: "none"` for stroke-only geometry.

<br />
<br />
<br />

## Performance

### Prefer one draw callback

One callback keeps ordering explicit. Multiple callbacks are supported and run in registration order.

<br />

### Mark static groups

Use static groups for geometry that does not change:

```ts
const staticGroup = scene.geometry.group();
staticGroup.setDrawUsage("static");

const dynamicGroup = scene.geometry.group();

scene.draw((p) => {
  staticGroup.path().moveToAbs(0, 0).lineTo(100, 0).lineTo(0, 100).close();
  dynamicGroup.path().moveToAbs(0, 0).lineTo(p.width, 0).lineTo(0, p.height).close();
});
```

Static groups still run through draw callbacks, but commits are skipped after the first commit.

<br />

### Safari filter performance

If zoom feels laggy on Safari, disable the filter:

```ts
scene.enableFilter(false);
```

<br />
<br />
<br />

## When to use

Pluton2D is optimized for technical drawing workflows: crisp SVG, dimensions, hatching, and predictable redraw behavior.

### Good fit for Pluton2D

- Technical drawings, blueprints, engineering diagrams
- Annotation-heavy scenes (dimensions, ticks, callouts)
- Workflows where inspectable/exportable SVG matters
- Interactive scenes with moderate redraw frequency

<br />

### Prefer charting libraries when

- Your primary goal is data visualization
- You need chart primitives, scales, legends, and tooltips out of the box
- You need chart-specific ecosystem tooling

<br />

### Prefer Canvas when

- You need high-frequency animation
- You render many moving primitives every frame
- SVG/DOM updates become the bottleneck

<br />

### Prefer WebGL or WebGPU when

- You need very large geometry counts or GPU-heavy effects
- You need shader pipelines or post-processing
- You need 3D or high-end real-time rendering

<br />
<br />
<br />

## Troubleshooting

### SVG is blank

- Check CSS import: `import "pluton-2d/style.css"`
- Ensure the SVG has size (CSS width/height or `viewBox`)

<br />

### Y-axis feels inverted

- Pluton uses Y-up coordinates, not screen-style Y-down
- `lineTo(0, 10)` moves up

<br />

### Params changes don't trigger redraw

- Mutate params: `scene.params.width = 100` ✓
- Top-level params object is immutable: `scene.params = { ... }` ✗
- Params must be flat; nested objects throw at construction

<br />

### Dimensions not visible

- Check layer creation: `scene.dimensions.group()`
- Verify draw callback registration
- Check CSS variable: `--pluton-dim-color`

<br />

### Performance issues during zoom (Safari)

- Disable filter: `scene.enableFilter(false)`

<br />
<br />
<br />

## SSR

Pluton2D is DOM-dependent and does not support SSR. Instantiate it on the client after mount.
