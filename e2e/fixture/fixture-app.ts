import { Pluton2D, snapshotSvg } from "pluton-2d";

declare global {
  interface Window {
    plutonE2E?: {
      Pluton2D: typeof Pluton2D;
      snapshotSvg: typeof snapshotSvg;
    };
  }
}

window.plutonE2E = {
  Pluton2D,
  snapshotSvg,
};
