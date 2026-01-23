import { Pluton2D } from ".";

const svg = document.getElementById("example") as SVGSVGElement | null;
if (!svg) throw new Error("SVG not found");

const bp = new Pluton2D(svg);

const iBeam = bp.geometry.group();

const params = bp.params({
  width: 300,
  height: 400,
  flangeThickness: 50,
  webThickness: 20,
  filletRadius: 15,
});

bp.draw((p) => {
  const fw = p.width;
  const ft = p.flangeThickness;
  const wt = p.webThickness;
  const h = p.height;
  const r = p.filletRadius;

  const g = iBeam.path({ className: "i-beam" });

  g.moveTo(0, 0)
    .lineTo(fw / 2, 0)
    .lineTo(0, ft)
    .lineTo(-fw / 2 + wt / 2 + r, 0)
    .arcTo(-r, r, r, false)
    .lineTo(0, h - 2 * ft - 2 * r)
    .arcTo(r, r, r, false)
    .lineTo(fw / 2 - wt / 2 - r, 0)
    .lineTo(0, ft)
    .lineTo(-fw, 0)
    .lineTo(0, -ft)
    .lineTo(fw / 2 - wt / 2 - r, 0)
    .arcTo(r, -r, r, false)
    .lineTo(0, -h + 2 * ft + 2 * r)
    .arcTo(-r, -r, r, false)
    .lineTo(-fw / 2 + wt / 2 + r, 0)
    .lineTo(0, -ft)
    .lineTo(fw / 2, 0);

  iBeam.translate(0, -h / 2);
});

bp.render();

const onSliderChange = (name: string) => (value: number) =>
  (params[name] = value);

addSlider({
  label: "Flange Width",
  onChange: onSliderChange("width"),
  max: 500,
});

type SliderOptions = {
  parent?: HTMLElement; // defaults to document.body
  label: string;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void; // called on input
};

export function addSlider(options: SliderOptions) {
  const {
    parent = document.body,
    label,
    min = 0,
    max = 100,
    step = 0.01,
    onChange,
  } = options;

  const wrapper = document.createElement("div");
  wrapper.style.cssText =
    "display:grid; grid-template-columns: 1fr 80px; gap: 10px; align-items:center; margin: 8px 0;";

  const left = document.createElement("div");
  left.style.cssText = "display:grid; gap: 6px;";

  const labelEl = document.createElement("div");
  labelEl.textContent = label;

  const range = document.createElement("input");
  range.type = "range";
  range.min = String(min);
  range.max = String(max);
  range.step = String(step);

  const number = document.createElement("input");
  number.type = "number";
  number.min = String(min);
  number.max = String(max);
  number.step = String(step);
  number.style.cssText = "width: 80px;";

  const set = (raw: number) => {
    const v = Math.max(min, Math.min(max, raw));
    range.value = String(v);
    number.value = String(v);
    onChange(v);
  };

  range.addEventListener("input", () => set(Number(range.value)));
  number.addEventListener("input", () => set(Number(number.value)));

  left.append(labelEl, range);
  wrapper.append(left, number);
  parent.appendChild(wrapper);

  return {
    wrapper,
    range,
    number,
    setValue: set,
    getValue: () => Number(range.value),
  };
}
