export interface PhotoState {
  originalFile: File | null;
  originalDataUrl: string | null;
  croppedDataUrl: string | null;
  processedDataUrl: string | null;
  finalDataUrl: string | null;
  cropArea: CropArea | null;
  croppedAreaPixels: CropAreaPixels | null;
  faceDetection: FaceDetectionResult | null;
  validationResults: ValidationResult[];
  processingStep: ProcessingStep;
}

export interface SignatureState {
  originalFile: File | null;
  originalDataUrl: string | null;
  croppedDataUrl: string | null;
  finalDataUrl: string | null;
  validationResults: ValidationResult[];
}

export type ProcessingStep = 'upload' | 'crop' | 'process' | 'download';

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CropAreaPixels {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface FaceDetectionResult {
  boundingBox: {
    originX: number;
    originY: number;
    width: number;
    height: number;
  };
  keypoints: Array<{
    x: number;
    y: number;
    name?: string;
  }>;
  confidence: number;
  faceCoveragePercent: number;
}

export interface ValidationResult {
  id: string;
  label: string;
  description: string;
  status: 'pass' | 'fail' | 'warning' | 'pending' | 'manual';
  details?: string;
}

export interface ProcessImageRequest {
  imageDataUrl: string;
  targetWidth: number;
  targetHeight: number;
  maxFileSizeKB: number;
  format: 'jpeg';
}

export interface ProcessImageResponse {
  success: boolean;
  imageDataUrl?: string;
  fileSizeKB?: number;
  width?: number;
  height?: number;
  error?: string;
}

export interface AppSettings {
  photoWidth: number;
  photoHeight: number;
  photoMaxSizeKB: number;
  minFaceCoveragePercent: number;
  targetFaceCoveragePercent: number;
  maxFaceCoveragePercent: number;
  signatureMaxSizeKB: number;
  jpegQuality: number;
}
