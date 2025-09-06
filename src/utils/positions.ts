export interface Size {
  width: number;
  height: number;
}

export interface CSSSize {
  width: string | number;
  height: string | number;
}

export interface Position {
  x: number;
  y: number;
}

export type Rect = Position & Size;
