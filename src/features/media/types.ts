export interface CropRegion {
  originX: number;
  originY: number;
  width: number;
  height: number;
}

export interface AspectRatio {
  width: number;
  height: number;
}

export interface PendingCropImage {
  uri: string;
  width?: number;
  height?: number;
}
