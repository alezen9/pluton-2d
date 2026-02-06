# pluton-2d

![suuuuuprrrrr](https://img.shields.io/badge/suuuuuprrrrr-ff3366?style=flat)

I built this for a specific need in another project-crisp vector output for technical drawings with minimal DOM churn. It's SVG-based, so lines stay sharp at any zoom, and it includes built-in helpers for grids, dimensions, and drafting annotations. Named after Pluton, the battleship from One Piece (blueprints worth keeping). I'm sharing it in case you have a similar need.

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

## What you get

**SVG-first rendering**
Native SVG output means crisp lines at any zoom level. You can inspect the DOM, export to files, or integrate with other SVG tools easily.

**Drafting helpers included**
Grid, axes, hatch fill, and dimension builders come out of the box. Focus on your geometry, not boilerplate.

**Low-churn rendering**
The engine records draw commands and reuses DOM elements via activeIndex tracking. Only changed attributes get updated, keeping interactions smooth.

**Reactive parameters**
Params are wrapped in a Proxy. Mutate them anywhere and redraws trigger automatically-no manual scheduling needed.

**Simple camera controls**
Pan and zoom are opt-in, with smoothing tuned for natural interaction. Reset to initial view anytime.

**CSS theming**
All styling is driven by CSS variables on the SVG root. Change themes without touching JavaScript.

## Getting started

Install the package and import the default stylesheet:

```bash
npm install pluton-2d
```

```ts
import "pluton-2d/style.css";
import { Pluton2D } from "pluton-2d";

const svg = document.querySelector("svg")!;
const scene = new Pluton2D(svg, { width: 240, height: 120 });

scene.enablePan(true);
scene.enableZoom(true);

const geom = scene.geometry.group();

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

**Params are reactive** - mutations trigger redraws automatically:

```ts
// Single property
scene.params.width = 150;

// Multiple properties
Object.assign(scene.params, { width: 200, height: 100 });
```

Draw callbacks run every frame when params change. The engine handles scheduling at 60 FPS.

## How rendering works

Understanding the render cycle helps you use the library effectively.

**1. Reactive params**
Params are wrapped in a Proxy. Any mutation triggers `scheduleRender()`, which queues a frame-limited update.

**2. Render cycle** (capped at 60 FPS)
- `beginRecord()` - reset activeIndex on all groups
- Draw callbacks run - you request builders with `path()` or `dimension()`
- `commit()` - update DOM with changes (skipped for static groups)

**3. Group reuse**
Create groups once outside draw callbacks, request builders inside:

```ts
const g = scene.geometry.group();  // create once

scene.draw(() => {
  const path = g.path();  // request builder every frame
  path.moveToAbs(0, 0).lineTo(10, 10);
});
```

Builders are reused internally via activeIndex tracking. This minimizes DOM churn-elements are only created when needed and attributes only update when values change.

## Coordinate system

Pluton uses a **center origin with Y-axis pointing up** (math convention, not screen coordinates).

- Origin is at the center of the viewport
- Positive X is right, positive Y is **up**
- Example: `lineTo(10, 20)` moves right 10 units, up 20 units

The viewport layer applies `scale(1, -1)` to flip the Y-axis for SVG rendering. This matters when placing dimensions and text-use the dimension helpers to ensure correct orientation.

## API

### Construction

Create an instance with an SVG element and initial params:

```ts
const scene = new Pluton2D<{ width: number; height: number }>(svg, {
  width: 240,
  height: 120,
});
```

Params can be any shape. The type is inferred from the initial value.

An optional third argument controls instance-level settings:

```ts
const scene = new Pluton2D(svg, { width: 240, height: 120 }, {
  filterIntensity: 1.5,  // pencil filter strength (default: 1.25)
});
```

### Draw loop

Register a callback that runs on each render:

```ts
const unsubscribe = scene.draw((params) => {
  // build paths here
});

// later, if needed
unsubscribe();
```

Unsubscribing is optional. When you're done with a scene, call `dispose()` to clean up event listeners and stop rendering.

```ts
scene.dispose();
```

### Controls

Controls are explicit and opt-in:

```ts
scene.enableFilter(true);     // pencil-like filter (default: false)
scene.enableHatchFill(true);  // hatch pattern fill (default: false)
scene.enableGrid(true);       // background grid (default: true)
scene.enableAxes(true);       // center axes (default: true)
```

Filters can be expensive on Safari during zoom-disable them if you see lag.

### Geometry

Geometry groups manage SVG paths and handle reuse. Create groups outside draw callbacks, request builders inside.

```ts
const g = scene.geometry.group();

scene.draw((p) => {
  const path = g.path({ className: "my-shape" });
  path.moveToAbs(0, 0).lineTo(40, 0).lineTo(0, 40).close();
});
```

**Group methods:**

```ts
group.translate(x, y)           // offset entire group
group.setDrawUsage(mode)        // "static" or "dynamic" (default: "dynamic")
group.clear()                   // remove all paths and reset
```

**PathBuilder methods:**

```ts
path.moveTo(dx, dy)                              // relative move (m)
path.moveToAbs(x, y)                             // absolute move (M)
path.lineTo(dx, dy)                              // relative line (l)
path.lineToAbs(x, y)                             // absolute line (L)
path.cubicTo(c1dx, c1dy, c2dx, c2dy, dx, dy)     // relative cubic Bezier (c)
path.cubicToAbs(c1x, c1y, c2x, c2y, x, y)       // absolute cubic Bezier (C)
path.smoothCubicTo(c2dx, c2dy, dx, dy)          // relative smooth cubic (s)
path.smoothCubicToAbs(c2x, c2y, x, y)           // absolute smooth cubic (S)
path.quadTo(c1dx, c1dy, dx, dy)                 // relative quadratic Bezier (q)
path.quadToAbs(c1x, c1y, x, y)                  // absolute quadratic Bezier (Q)
path.smoothQuadTo(dx, dy)                       // relative smooth quadratic (t)
path.smoothQuadToAbs(x, y)                      // absolute smooth quadratic (T)
path.arcTo(dx, dy, r, clockwise?, largeArc?)     // relative arc (a)
path.arcToAbs(x, y, r, clockwise?, largeArc?)   // absolute arc (A)
path.close()                                     // close path (z)
path.reset()                                     // clear builder
```

Use `cubic*` when you need maximum curve control, `smoothCubic*` for continuous cubic chains, `quad*` for lighter one-handle curves, and `smoothQuad*` to continue quadratic chains smoothly.

### Dimensions

Dimensions are a separate layer with helpers for annotations, arrows, ticks, and labels. Create groups outside draw callbacks, request builders inside.

```ts
const d = scene.dimensions.group();

scene.draw(() => {
  const dim = d.dimension();
  dim.moveToAbs(-40, 0).tick(0).lineTo(80, 0).tick(0).textAt(0, -10, "80");
});
```

**Group methods:**

```ts
group.translate(x, y)           // offset entire group
group.setDrawUsage(mode)        // "static" or "dynamic" (default: "dynamic")
group.clear()                   // remove all dimensions and reset
```

**DimensionBuilder positioning:**

```ts
dim.moveTo(dx, dy)              // relative move
dim.moveToAbs(x, y)             // absolute move
dim.lineTo(dx, dy)              // relative line
dim.lineToAbs(x, y)             // absolute line
```

**DimensionBuilder primitives:**

```ts
dim.arc(r, startAngle, endAngle)      // arc centered at current point
dim.arrow(angleRad, size?)            // open arrow (default size: 8)
dim.arrowFilled(angleRad, size?)      // filled arrow (default size: 8)
dim.tick(angleRad, size?)             // architectural tick (default size: 15)
dim.centerMark(size?)                 // crosshair with center dot
dim.close()                           // close path
```

**DimensionBuilder text:**

```ts
dim.textAt(dx, dy, text, align?, className?)     // relative text placement
dim.textAtAbs(x, y, text, align?, className?)    // absolute text placement
```

Text align can be `"start"`, `"middle"`, or `"end"` (default: `"middle"`).

## Camera controls

Pan and zoom are opt-in and can be reset at any time:

```ts
scene.enablePan(true);    // middle-mouse or shift+left-click to pan
scene.enableZoom(true);   // mouse wheel to zoom (1-20x scale)
scene.resetCamera();      // return to initial view
```

## Styling

All visual styling is controlled by CSS variables on `.pluton-root`. You can customize per-instance:

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

  /* Hatch fill (opt-in via enableHatchFill) */
  --pluton-hatch-color: rgba(0, 39, 50, 0.14);

  /* Dimensions */
  --pluton-dim-color: black;
  --pluton-dim-stroke-width: 1;
  --pluton-dim-text-color: rgba(0, 0, 0, 0.6);
  --pluton-dim-font-size: 12px;
  --pluton-dim-font-family: system-ui, sans-serif;
}
```

**Custom classes:**

Pass custom classes to paths and dimensions for fine-grained control:

```ts
g.path({ className: "my-custom-path" });
d.dimension({ className: "highlighted-dim" });
```

**Hatch fill:**

Hatch fill is opt-in. Enable it at runtime:

```ts
scene.enableHatchFill(true);
```

Or add the `pluton-fill-hatch` class to specific paths:

```ts
g.path({ className: "pluton-fill-hatch" });
```

## Performance

**Prefer one draw callback**
It keeps ordering explicit and avoids confusion when multiple callbacks touch the same layer. Multiple callbacks are supported and run in registration order.

**Mark static groups**
For geometry that never changes, mark the group as static. The engine optimizes it automatically:

```ts
const staticGroup = scene.geometry.group();
staticGroup.setDrawUsage("static");  // mark as static outside draw callback

const dynamicGroup = scene.geometry.group();

scene.draw((p) => {
  // Static group - always call path(), engine skips commit
  const staticPath = staticGroup.path();
  staticPath.moveToAbs(0, 0).lineTo(100, 0).lineTo(0, 100).close();

  // Dynamic group - updates every frame
  const dynamicPath = dynamicGroup.path();
  dynamicPath.moveToAbs(0, 0).lineTo(p.width, 0).lineTo(0, p.height).close();
});
```

**How it works:**
- Set `setDrawUsage("static")` on the group before rendering starts
- Draw callbacks run normally-you still call `path()` every frame
- The engine skips `commit()` for static groups, avoiding DOM updates
- No flags, no RAF, no conditionals needed in your draw logic

**When to use:**
- **Static:** background elements, fixed annotations, unchanging reference shapes
- **Dynamic (default):** anything reactive to params or user input

**Safari filter performance**
SVG filters can be expensive during zoom on Safari. Disable them if you notice lag:

```ts
scene.enableFilter(false);
```

## When to use

**Good fit:**
- Technical drawings, blueprints
- Engineering diagrams, schematics
- Floor plans, architectural views
- Any crisp vector output at arbitrary zoom levels

**Not ideal for:**
- Charts and graphs (D3, Chart.js are better suited)
- High-frequency animation (Canvas performs better)
- Raster effects or photos (use Canvas or WebGL)

## Troubleshooting

**SVG is blank**
- Check CSS import: `import "pluton-2d/style.css"`
- Ensure SVG has size: set CSS width/height or use a viewBox

**Y-axis feels inverted**
- Library uses Y-up (math coords), not Y-down (screen coords)
- `lineTo(0, 10)` moves UP, not down

**Params changes don't trigger redraw**
- Mutate params: `scene.params.width = 100` ✓
- Don't reassign: `scene.params = { ... }` ✗
- Params must be flat - nested objects throw at construction

**Dimensions not visible**
- Check layer is created: `scene.dimensions.group()`
- Verify draw callback is registered
- Check stroke color CSS variable: `--pluton-dim-color`

**Performance issues during zoom (Safari)**
- Disable pencil filter: `scene.enableFilter(false)`
- SVG filters can be expensive at high zoom levels

## SSR

Pluton2D is DOM-dependent and does not support SSR. Instantiate it on the client after mount.
