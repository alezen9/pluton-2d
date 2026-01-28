export type BeamParams = {
  scale: number;
  enablePencilFilter: boolean;
  enableCameraControls: boolean;
};

export type IBeamParams = BeamParams & {
  width: number;
  height: number;
  flangeThickness: number;
  webThickness: number;
  filletRadius: number;
};

export type RHSParams = BeamParams & {
  width: number;
  height: number;
  thickness: number;
  outerRadius: number;
  innerRadius: number;
};

export type CHSParams = BeamParams & {
  radius: number;
  thickness: number;
};
