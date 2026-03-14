import type { AppSettings } from '@/types';

// Default Passport Seva Photo Requirements (all adjustable via UI)
export const DEFAULT_SETTINGS: AppSettings = {
  photoWidth: 630,
  photoHeight: 810,
  photoMaxSizeKB: 250,
  minFaceCoveragePercent: 70,
  targetFaceCoveragePercent: 80,
  maxFaceCoveragePercent: 90,
  signatureMaxSizeKB: 100,
  jpegQuality: 92,
};

// Computed from settings
export const PHOTO_ASPECT_RATIO = DEFAULT_SETTINGS.photoWidth / DEFAULT_SETTINGS.photoHeight;

// Upload Limits
export const MAX_UPLOAD_SIZE_MB = 10;
export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
];
export const ACCEPTED_IMAGE_EXTENSIONS = '.jpg,.jpeg,.png,.webp,.heic';

// Validation IDs
export const VALIDATIONS = {
  DIMENSIONS: 'dimensions',
  FILE_SIZE: 'file-size',
  FORMAT: 'format',
  FACE_COVERAGE: 'face-coverage',
  WHITE_BACKGROUND: 'white-background',
  FACE_DETECTED: 'face-detected',
  DARK_CLOTHES: 'dark-clothes',
  EYES_OPEN: 'eyes-open',
  HEAD_STRAIGHT: 'head-straight',
  FOREHEAD_VISIBLE: 'forehead-visible',
  NO_RED_EYE: 'no-red-eye',
  EVEN_LIGHTING: 'even-lighting',
  BLUR_CHECK: 'blur-check',
} as const;

// MediaPipe Face Detection
export const FACE_DETECTION_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite';

// Steps
export const STEPS: Array<{ id: string; label: string }> = [
  { id: 'upload', label: 'Upload' },
  { id: 'crop', label: 'Crop & Adjust' },
  { id: 'process', label: 'Process' },
  { id: 'download', label: 'Download' },
];
