import { Pane } from "tweakpane";
import { createIBeam } from "./beams/i-beam";
import { createRHSBeam } from "./beams/rhs-beam";
import { createCHSBeam } from "./beams/chs-beam";
import { createStaticDynamicDemo } from "./static-dynamic";

const isMacSafariOrIOS =
  /iP(hone|ad|od)/.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) ||
  (/Macintosh/.test(navigator.userAgent) &&
    /Safari/.test(navigator.userAgent) &&
    !/Chrome|CriOS|Edg|Firefox|FxiOS|OPR|OPiOS/.test(navigator.userAgent));

// Initialize beams with containers
const { bp: iBeam } = createIBeam(document.getElementById("i-beam-canvas")!, {
  width: 200,
  height: 300,
  flangeThickness: 40,
  webThickness: 20,
  filletRadius: 12,
});

const { bp: rhsBeam } = createRHSBeam(document.getElementById("rhs-canvas")!, {
  width: 200,
  height: 250,
  thickness: 15,
  outerRadius: 10,
  innerRadius: 10,
});

const { bp: chsBeam } = createCHSBeam(document.getElementById("chs-canvas")!, {
  radius: 110,
  thickness: 12,
});

const { bp: staticDynamic } = createStaticDynamicDemo(
  document.getElementById("static-dynamic-canvas")!,
  { size: 120 },
);

const baseDummy = {
  enableFilter: !isMacSafariOrIOS,
  enableZoom: true,
  enablePan: true,
  enableHatchFill: true,
  enableGrid: true,
  enableAxes: true,
};
[iBeam, rhsBeam, chsBeam, staticDynamic].forEach((plt) => {
  plt.enableFilter(baseDummy.enableFilter);
  plt.enableZoom(baseDummy.enableZoom);
  plt.enablePan(baseDummy.enablePan);
  plt.enableHatchFill(baseDummy.enableHatchFill);
  plt.enableGrid(baseDummy.enableGrid);
  plt.enableAxes(baseDummy.enableAxes);
});

// Tweakpane setup
const pane = new Pane({ title: "Beam Parameters" });

// I-Beam folder
const iBeamDummy = { ...baseDummy };
const iFolder = pane.addFolder({ title: "I-Beam", expanded: true });
iFolder.addBinding(iBeam.params, "width", { min: 50, max: 350, step: 1 });
iFolder.addBinding(iBeam.params, "height", { min: 100, max: 450, step: 1 });
iFolder.addBinding(iBeam.params, "flangeThickness", {
  min: 10,
  max: 80,
  step: 1,
});
iFolder.addBinding(iBeam.params, "webThickness", { min: 5, max: 50, step: 1 });
iFolder.addBinding(iBeam.params, "filletRadius", { min: 0, max: 30, step: 1 });
iFolder.addBinding(iBeamDummy, "enableFilter").on("change", (ev) => {
  iBeam.enableFilter(ev.value);
});
iFolder.addBinding(iBeamDummy, "enableZoom").on("change", (ev) => {
  iBeam.enableZoom(ev.value);
});
iFolder.addBinding(iBeamDummy, "enablePan").on("change", (ev) => {
  iBeam.enablePan(ev.value);
});
iFolder.addBinding(iBeamDummy, "enableHatchFill").on("change", (ev) => {
  iBeam.enableHatchFill(ev.value);
});
iFolder.addBinding(iBeamDummy, "enableGrid").on("change", (ev) => {
  iBeam.enableGrid(ev.value);
});
iFolder.addBinding(iBeamDummy, "enableAxes").on("change", (ev) => {
  iBeam.enableAxes(ev.value);
});
iFolder.addButton({ title: "Reset Camera" }).on("click", () => {
  iBeam.resetCamera();
});

// RHS folder
const rhsBeamDummy = { ...baseDummy };
const rhsFolder = pane.addFolder({ title: "RHS", expanded: true });
rhsFolder.addBinding(rhsBeam.params, "width", { min: 50, max: 350, step: 1 });
rhsFolder.addBinding(rhsBeam.params, "height", { min: 50, max: 350, step: 1 });
rhsFolder.addBinding(rhsBeam.params, "thickness", { min: 3, max: 50, step: 1 });
rhsFolder.addBinding(rhsBeam.params, "outerRadius", {
  min: 0,
  max: 30,
  step: 1,
});
rhsFolder.addBinding(rhsBeam.params, "innerRadius", {
  min: 0,
  max: 30,
  step: 1,
});
rhsFolder.addBinding(rhsBeamDummy, "enableFilter").on("change", (ev) => {
  rhsBeam.enableFilter(ev.value);
});
rhsFolder.addBinding(rhsBeamDummy, "enableZoom").on("change", (ev) => {
  rhsBeam.enableZoom(ev.value);
});
rhsFolder.addBinding(rhsBeamDummy, "enablePan").on("change", (ev) => {
  rhsBeam.enablePan(ev.value);
});
rhsFolder.addBinding(rhsBeamDummy, "enableHatchFill").on("change", (ev) => {
  rhsBeam.enableHatchFill(ev.value);
});
rhsFolder.addBinding(rhsBeamDummy, "enableGrid").on("change", (ev) => {
  rhsBeam.enableGrid(ev.value);
});
rhsFolder.addBinding(rhsBeamDummy, "enableAxes").on("change", (ev) => {
  rhsBeam.enableAxes(ev.value);
});
rhsFolder.addButton({ title: "Reset Camera" }).on("click", () => {
  rhsBeam.resetCamera();
});

// CHS folder
const chsBeamDummy = { ...baseDummy };
const chsFolder = pane.addFolder({ title: "CHS", expanded: true });
chsFolder.addBinding(chsBeam.params, "radius", {
  min: 50,
  max: 350,
  step: 1,
});
chsFolder.addBinding(chsBeam.params, "thickness", { min: 3, max: 50, step: 1 });
chsFolder.addBinding(chsBeamDummy, "enableFilter").on("change", (ev) => {
  chsBeam.enableFilter(ev.value);
});
chsFolder.addBinding(chsBeamDummy, "enableZoom").on("change", (ev) => {
  chsBeam.enableZoom(ev.value);
});
chsFolder.addBinding(chsBeamDummy, "enablePan").on("change", (ev) => {
  chsBeam.enablePan(ev.value);
});
chsFolder.addBinding(chsBeamDummy, "enableHatchFill").on("change", (ev) => {
  chsBeam.enableHatchFill(ev.value);
});
chsFolder.addBinding(chsBeamDummy, "enableGrid").on("change", (ev) => {
  chsBeam.enableGrid(ev.value);
});
chsFolder.addBinding(chsBeamDummy, "enableAxes").on("change", (ev) => {
  chsBeam.enableAxes(ev.value);
});
chsFolder.addButton({ title: "Reset Camera" }).on("click", () => {
  chsBeam.resetCamera();
});

// Static vs Dynamic folder
const staticDummy = { ...baseDummy };
const staticFolder = pane.addFolder({
  title: "Static vs Dynamic",
  expanded: true,
});
staticFolder.addBinding(staticDynamic.params, "size", {
  min: 40,
  max: 200,
  step: 1,
});
staticFolder.addBinding(staticDummy, "enableFilter").on("change", (ev) => {
  staticDynamic.enableFilter(ev.value);
});
staticFolder.addBinding(staticDummy, "enableZoom").on("change", (ev) => {
  staticDynamic.enableZoom(ev.value);
});
staticFolder.addBinding(staticDummy, "enablePan").on("change", (ev) => {
  staticDynamic.enablePan(ev.value);
});
staticFolder.addBinding(staticDummy, "enableHatchFill").on("change", (ev) => {
  staticDynamic.enableHatchFill(ev.value);
});
staticFolder.addBinding(staticDummy, "enableGrid").on("change", (ev) => {
  staticDynamic.enableGrid(ev.value);
});
staticFolder.addBinding(staticDummy, "enableAxes").on("change", (ev) => {
  staticDynamic.enableAxes(ev.value);
});
staticFolder.addButton({ title: "Reset Camera" }).on("click", () => {
  staticDynamic.resetCamera();
});
