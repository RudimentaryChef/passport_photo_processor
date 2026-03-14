import type { FaceDetectionResult, CropArea, AppSettings } from '@/types';
import { loadImage } from './imageProcessing';

export function calculateAutoCrop(
  faceDetection: FaceDetectionResult,
  imageWidth: number,
  imageHeight: number,
  settings: AppSettings,
): CropArea {
  const { boundingBox } = faceDetection;
  const aspectRatio = settings.photoWidth / settings.photoHeight;
  const targetCoverage = settings.targetFaceCoveragePercent / 100;

  const faceCenterX = boundingBox.originX + boundingBox.width / 2;
  const faceCenterY = boundingBox.originY + boundingBox.height / 2;

  // Desired crop height so face height ≈ targetCoverage of the crop
  let cropHeight = boundingBox.height / targetCoverage;
  let cropWidth = cropHeight * aspectRatio;

  // Fit within image bounds
  if (cropWidth > imageWidth) {
    cropWidth = imageWidth;
    cropHeight = cropWidth / aspectRatio;
  }
  if (cropHeight > imageHeight) {
    cropHeight = imageHeight;
    cropWidth = cropHeight * aspectRatio;
  }

  // Center on face, with face slightly above center (10% from top)
  let cropX = faceCenterX - cropWidth / 2;
  let cropY = faceCenterY - cropHeight * 0.45;

  // Clamp to image bounds
  cropX = Math.max(0, Math.min(cropX, imageWidth - cropWidth));
  cropY = Math.max(0, Math.min(cropY, imageHeight - cropHeight));

  return {
    x: Math.round(cropX),
    y: Math.round(cropY),
    width: Math.round(cropWidth),
    height: Math.round(cropHeight),
  };
}

export async function getCroppedImage(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
): Promise<string> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return canvas.toDataURL('image/jpeg', 1.0);
}
