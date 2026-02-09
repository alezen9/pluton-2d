import { Pluton2D } from "pluton-2d";

declare global {
  interface Window {
    plutonE2E?: {
      Pluton2D: typeof Pluton2D;
    };
  }
}

window.plutonE2E = {
  Pluton2D,
};
