export interface Block {
  x: number;
  y: number;
  type: string;
  text: string;
  color: string;
  stroke: string;
  param?: string;
  children?: Block[];
}

export interface PlacingBlock {
  type: string;
  text: string;
  color: string;
  stroke: string;
  param?: string;
  children?: Block[];
}

export interface ParamSelectorState {
  target: "placing" | number;
  type: "icon" | "number" | "motor-icon" | "motor-percent";
  color?: "blue" | "orange";
}

export interface SvgDimensions {
  width: number;
  viewBox: string;
  path: string;
}
