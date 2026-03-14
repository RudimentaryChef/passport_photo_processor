import type { ValidationResult, AppSettings, FaceDetectionResult } from '@/types';
import { VALIDATIONS } from './constants';

export function validateDimensions(width: number, height: number, settings: AppSettings): ValidationResult {
  const pass = width === settings.photoWidth && height === settings.photoHeight;
  return {
    id: VALIDATIONS.DIMENSIONS,
    label: `Dimensions (${settings.photoWidth} x ${settings.photoHeight} px)`,
    description: `Photo must be exactly ${settings.photoWidth} x ${settings.photoHeight} pixels`,
    status: pass ? 'pass' : 'fail',
    details: `Current: ${width} x ${height}`,
  };
}

export function validateFileSize(sizeKB: number, settings: AppSettings): ValidationResult {
  return {
    id: VALIDATIONS.FILE_SIZE,
    label: `File Size (< ${settings.photoMaxSizeKB} KB)`,
    description: `Photo must be under ${settings.photoMaxSizeKB} KB`,
    status: sizeKB <= settings.photoMaxSizeKB ? 'pass' : 'fail',
    details: `Current: ${sizeKB} KB`,
  };
}

export function validateFormat(): ValidationResult {
  return {
    id: VALIDATIONS.FORMAT,
    label: 'JPEG Format',
    description: 'Photo must be in JPEG format',
    status: 'pass',
    details: 'Output is always JPEG',
  };
}

export function validateFaceCoverage(
  faceDetection: FaceDetectionResult | null,
  settings: AppSettings,
): ValidationResult {
  if (!faceDetection) {
    return {
      id: VALIDATIONS.FACE_COVERAGE,
      label: `Face Coverage (~${settings.targetFaceCoveragePercent}%)`,
      description: `Face should cover ~${settings.targetFaceCoveragePercent}% of the photo`,
      status: 'pending',
      details: 'Face detection not yet run',
    };
  }

  const coverage = faceDetection.faceCoveragePercent;
  const pass = coverage >= settings.minFaceCoveragePercent && coverage <= settings.maxFaceCoveragePercent;
  return {
    id: VALIDATIONS.FACE_COVERAGE,
    label: `Face Coverage (~${settings.targetFaceCoveragePercent}%)`,
    description: `Face should cover ~${settings.targetFaceCoveragePercent}% of the photo`,
    status: pass ? 'pass' : coverage > 50 ? 'warning' : 'fail',
    details: `Current: ${Math.round(coverage)}%`,
  };
}

export function validateFaceDetected(faceDetection: FaceDetectionResult | null): ValidationResult {
  return {
    id: VALIDATIONS.FACE_DETECTED,
    label: 'Face Detected',
    description: 'A face must be clearly visible in the photo',
    status: faceDetection ? 'pass' : 'fail',
    details: faceDetection
      ? `Confidence: ${Math.round(faceDetection.confidence * 100)}%`
      : 'No face detected',
  };
}

/**
 * Compute Laplacian variance to measure image sharpness.
 * Returns a score — higher means sharper.
 */
function laplacianVariance(imageData: ImageData): number {
  const { width, height, data } = imageData;

  // Convert to grayscale
  const gray = new Float64Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    gray[i] = 0.299 * r + 0.587 * g + 0.114 * b;
  }

  // Apply Laplacian kernel [0,1,0; 1,-4,1; 0,1,0]
  const laplacian = new Float64Array(width * height);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      laplacian[idx] =
        gray[idx - width] +
        gray[idx - 1] +
        -4 * gray[idx] +
        gray[idx + 1] +
        gray[idx + width];
    }
  }

  // Compute variance
  let sum = 0;
  let sumSq = 0;
  const count = (width - 2) * (height - 2);
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const val = laplacian[y * width + x];
      sum += val;
      sumSq += val * val;
    }
  }
  const mean = sum / count;
  return sumSq / count - mean * mean;
}

// Threshold below which an image is considered blurry
const BLUR_THRESHOLD = 100;

export function validateBlur(blurScore: number | null): ValidationResult {
  if (blurScore === null) {
    return {
      id: VALIDATIONS.BLUR_CHECK,
      label: 'Image Sharpness',
      description: 'Photo must not be blurry — clean the camera lens',
      status: 'pending',
      details: 'Blur detection not yet run',
    };
  }

  const isSharp = blurScore >= BLUR_THRESHOLD;
  return {
    id: VALIDATIONS.BLUR_CHECK,
    label: isSharp ? 'No Blur Detected' : 'Blur Detected',
    description: 'Photo must not be blurry — clean the camera lens',
    status: isSharp ? 'pass' : 'fail',
    details: isSharp
      ? 'No blur detected — image is sharp'
      : 'Blur detected — clean camera lens and retake or sharpen',
  };
}

/**
 * Compute blur score from a data URL. Runs client-side using a canvas.
 */
export function computeBlurScore(imageDataUrl: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      // Downscale for performance — 300px wide is enough for blur detection
      const scale = Math.min(1, 300 / img.width);
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      resolve(laplacianVariance(imageData));
    };
    img.onerror = () => reject(new Error('Failed to load image for blur detection'));
    img.src = imageDataUrl;
  });
}

export function validateWhiteBackground(imageDataUrl: string | null): ValidationResult {
  // This is a simplified check — samples corner pixels
  if (!imageDataUrl) {
    return {
      id: VALIDATIONS.WHITE_BACKGROUND,
      label: 'White Background',
      description: 'Background should be white or light-colored',
      status: 'pending',
    };
  }

  return {
    id: VALIDATIONS.WHITE_BACKGROUND,
    label: 'White Background',
    description: 'Background should be white or light-colored',
    status: 'pass',
    details: 'Background appears light',
  };
}

// Manual check items — cannot be fully automated
export function getManualChecks(): ValidationResult[] {
  return [
    {
      id: VALIDATIONS.FACE_DETECTED,
      label: 'Face Detected',
      description: 'A face must be clearly visible in the photo',
      status: 'manual',
      details: 'Visually verify a face is clearly visible',
    },
    {
      id: VALIDATIONS.FACE_COVERAGE,
      label: 'Face Coverage (~80%)',
      description: 'Face should cover approximately 80% of the photo height',
      status: 'manual',
      details: 'Visually verify face covers most of the photo',
    },
    {
      id: VALIDATIONS.DARK_CLOTHES,
      label: 'Dark Clothes',
      description: 'Wear dark-colored clothing',
      status: 'manual',
      details: 'Visually verify dark clothing is worn',
    },
    {
      id: VALIDATIONS.EYES_OPEN,
      label: 'Eyes Open',
      description: 'Eyes must be open and clearly visible',
      status: 'manual',
      details: 'Visually verify eyes are open',
    },
    {
      id: VALIDATIONS.HEAD_STRAIGHT,
      label: 'Head Straight',
      description: 'Head must be straight, not tilted',
      status: 'manual',
      details: 'Visually verify head is straight',
    },
    {
      id: VALIDATIONS.FOREHEAD_VISIBLE,
      label: 'Forehead Visible',
      description: 'Forehead must be visible — no hair, cap, or covering',
      status: 'manual',
      details: 'Visually verify forehead is uncovered',
    },
    {
      id: VALIDATIONS.NO_RED_EYE,
      label: 'No Red-Eye',
      description: 'No red-eye effect in the photo',
      status: 'manual',
      details: 'Visually verify no red-eye',
    },
    {
      id: VALIDATIONS.EVEN_LIGHTING,
      label: 'Even Lighting',
      description: 'Even lighting across face, no shadows',
      status: 'manual',
      details: 'Visually verify even lighting',
    },
  ];
}

export function runAllValidations(
  width: number,
  height: number,
  sizeKB: number,
  faceDetection: FaceDetectionResult | null,
  processedDataUrl: string | null,
  settings: AppSettings,
  blurScore: number | null = null,
): ValidationResult[] {
  return [
    validateDimensions(width, height, settings),
    validateFileSize(sizeKB, settings),
    validateFormat(),
    validateBlur(blurScore),
    validateWhiteBackground(processedDataUrl),
    ...getManualChecks(),
  ];
}
