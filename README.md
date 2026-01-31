# pluton-2d

Lightweight SVG library for technical drawings. Crisp output, small API, and performance-minded updates.

## Why

This started as a practical tool for a larger project: draw precise, clean technical graphics in the browser without a heavy CAD stack. The goal is simple SVG output, good performance, and an API you can learn in minutes.

## Install

```bash
npm install pluton-2d
```

## Quick start

```ts
import "pluton-2d/style.css";
import { Pluton2D } from "pluton-2d";

const svg = document.querySelector("svg", { width: 110, height: 250 })!;

const plt = new Pluton2D(svg);

plt.enablePan(true);
plt.enableZoom(true);

const geom = plt.geometry.group();

plt.draw((p) => {
  const path = geom.path();

  path
    .moveToAbs(-p.width / 2, -p.height / 2)
    .lineTo(p.width, 0)
    .lineTo(0, p.height)
    .lineTo(-p.width, 0)
    .close();
});
```

## What you get

- SVG-first rendering for crisp visuals
- Grid, axes, hatch fill, and dimensions helpers
- Record/commit updates for low DOM churn
- Simple camera pan/zoom with smoothing
- CSS variables for theming

## API basics

### Construction

```ts
const plt = new Pluton2D(svg, initialParams);
```

### Draw loop

```ts
const unsubscribe = plt.draw((params) => {
  // build paths here
});

// later
unsubscribe();
```

### Controls

```ts
plt.enableFilter(true);
plt.enablePan(true);
plt.enableZoom(true);
plt.enableHatchFill(true);
plt.enableGrid(true);
plt.enableAxes(true);
```

Defaults:

- filter off
- pan off
- zoom off
- hatch fill off
- grid on
- axes on

### Geometry

```ts
const g = plt.geometry.group();

g.setDrawUsage?.("static"); // optional: stop updates for this group

const path = g.path({ className: "my-shape" });
path.moveToAbs(0, 0).lineTo(40, 0).lineTo(0, 40).close();
```

### Dimensions

```ts
const d = plt.dimensions.group();
const dim = d.dimension();

dim.moveToAbs(-40, 0).tick(0).lineTo(80, 0).tick(0).textAt(0, -10, "80");
```

## Styling

Pluton2D styles are driven by CSS variables. The library adds `pluton-root` to the SVG. You can theme per instance:

```css
.pluton-root {
  --pluton-geometry-stroke: rgba(0, 0, 0, 0.85);
  --pluton-dim-text-color: rgba(0, 0, 0, 0.7);
}
```

Hatch fill is opt-in. Toggle it with:

```ts
plt.enableHatchFill(true);
```

## Performance tips

- Use a single draw callback and call smaller helpers inside it
- Mark groups as static when they do not change
- Keep filters off on Safari if you see lag

## SSR note

Pluton2D requires the DOM to create SVG elements, so instantiate it on the client. CSS import works fine with SSR frameworks.

## Examples

See the `examples/` folder for interactive demos and tweakable parameters.
