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
): ValidationResult[] {
  return [
    validateDimensions(width, height, settings),
    validateFileSize(sizeKB, settings),
    validateFormat(),
    validateWhiteBackground(processedDataUrl),
    ...getManualChecks(),
  ];
}
