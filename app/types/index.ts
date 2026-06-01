export interface Block {
  id: string;
  x: number;
  y: number;
  type: string;
  text: string;
  color: string;
  stroke: string;
  param?: string;
  children?: Block[];
  
  // Connection references
  parentId?: string;
  nextBlockId?: string;
  childBlockId?: string;
  childrenCount?: number;
  isChild?: boolean;
  lastMovedAt?: number;
}

export interface PlacingBlock {
  id?: string;
  type: string;
  text: string;
  color: string;
  stroke: string;
  param?: string;
  children?: Block[];
  
  parentId?: string;
  nextBlockId?: string;
  childBlockId?: string;
  childrenCount?: number;
  isChild?: boolean;
  lastMovedAt?: number;
}

export interface ParamSelectorState {
  target: "placing" | string;
  type: "icon" | "number" | "motor-icon" | "motor-percent";
  color?: "blue" | "orange";
}

export interface SvgDimensions {
  width: number;
  viewBox: string;
  path: string;
}
