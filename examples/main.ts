import { Pane } from "tweakpane";
import { createIBeam } from "./beams/i-beam";
import { createRHSBeam } from "./beams/rhs-beam";
import { createCHSBeam } from "./beams/chs-beam";

// Initialize beams with containers
const { bp: iBeam } = createIBeam(document.getElementById("i-beam-canvas")!, {
  width: 200,
  height: 300,
  flangeThickness: 40,
  webThickness: 20,
  filletRadius: 12,
  scale: 1,
  enablePencilFilter: true,
  enableCameraControls: true,
});

const { bp: rhsBeam } = createRHSBeam(document.getElementById("rhs-canvas")!, {
  width: 200,
  height: 250,
  thickness: 15,
  outerRadius: 10,
  innerRadius: 10,
  scale: 1,
  enablePencilFilter: true,
  enableCameraControls: true,
});

const { bp: chsBeam } = createCHSBeam(document.getElementById("chs-canvas")!, {
  radius: 110,
  thickness: 12,
  scale: 1,
  enablePencilFilter: true,
  enableCameraControls: true,
});

// Tweakpane setup
const pane = new Pane({ title: "Beam Parameters" });

// I-Beam folder
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
iFolder.addBinding(iBeam.params, "enablePencilFilter").on("change", (ev) => {
  iBeam.enablePencilFilter(ev.value);
});
iFolder.addBinding(iBeam.params, "enableCameraControls").on("change", (ev) => {
  iBeam.enableCameraControls(ev.value);
});
iFolder.addButton({ title: "Reset Camera" }).on("click", () => {
  iBeam.resetCamera();
});

// RHS folder
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
rhsFolder
  .addBinding(rhsBeam.params, "enablePencilFilter")
  .on("change", (ev) => {
    rhsBeam.enablePencilFilter(ev.value);
  });
rhsFolder
  .addBinding(rhsBeam.params, "enableCameraControls")
  .on("change", (ev) => {
    rhsBeam.enableCameraControls(ev.value);
  });
rhsFolder.addButton({ title: "Reset Camera" }).on("click", () => {
  rhsBeam.resetCamera();
});

// CHS folder
const chsFolder = pane.addFolder({ title: "CHS", expanded: true });
chsFolder.addBinding(chsBeam.params, "radius", {
  min: 50,
  max: 350,
  step: 1,
});
chsFolder.addBinding(chsBeam.params, "thickness", { min: 3, max: 50, step: 1 });
chsFolder
  .addBinding(chsBeam.params, "enablePencilFilter")
  .on("change", (ev) => {
    chsBeam.enablePencilFilter(ev.value);
  });
chsFolder
  .addBinding(chsBeam.params, "enableCameraControls")
  .on("change", (ev) => {
    chsBeam.enableCameraControls(ev.value);
  });
chsFolder.addButton({ title: "Reset Camera" }).on("click", () => {
  chsBeam.resetCamera();
});
