'use client';

import { useState, useEffect } from 'react';
import { usePhoto } from '@/context/PhotoContext';
import { useImageProcessing } from '@/hooks/useImageProcessing';
import { getImageDimensions, getDataUrlSizeKB } from '@/lib/imageProcessing';
import { runAllValidations } from '@/lib/validation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Loader2, Zap } from 'lucide-react';

export default function ProcessingPreview() {
  const { state, dispatch } = usePhoto();
  const { processImage, isProcessing, error } = useImageProcessing();
  const { settings } = state;
  const [imageInfo, setImageInfo] = useState<{ width: number; height: number; sizeKB: number } | null>(null);

  const sourceImage = state.photo.processedDataUrl || state.photo.croppedDataUrl || state.photo.originalDataUrl;

  const handleProcess = async () => {
    if (!sourceImage) return;
    try {
      const result = await processImage({
        imageDataUrl: sourceImage,
        targetWidth: settings.photoWidth,
        targetHeight: settings.photoHeight,
        maxFileSizeKB: settings.photoMaxSizeKB,
        format: 'jpeg',
      });
      dispatch({ type: 'SET_FINAL_PHOTO', payload: result });
    } catch {
      // Error handled by hook
    }
  };

  // Get image info for final photo
  useEffect(() => {
    if (state.photo.finalDataUrl) {
      (async () => {
        const dims = await getImageDimensions(state.photo.finalDataUrl!);
        const sizeKB = await getDataUrlSizeKB(state.photo.finalDataUrl!);
        setImageInfo({ ...dims, sizeKB });

        // Run validations
        const results = runAllValidations(
          dims.width,
          dims.height,
          sizeKB,
          state.photo.faceDetection,
          state.photo.finalDataUrl,
          settings,
        );
        dispatch({ type: 'SET_VALIDATION_RESULTS', payload: results });
      })();
    }
  }, [state.photo.finalDataUrl, state.photo.faceDetection, settings, dispatch]);

  return (
    <Card title="Process & Preview">
      <div className="space-y-6">
        {/* Source preview */}
        {sourceImage && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Source Image:</p>
            <img
              src={sourceImage}
              alt="Source"
              className="max-h-64 rounded-lg border border-gray-200"
            />
          </div>
        )}

        {/* Process button */}
        <Button variant="primary" onClick={handleProcess} disabled={isProcessing || !sourceImage}>
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 mr-2" />
              Process to {settings.photoWidth}x{settings.photoHeight}
            </>
          )}
        </Button>

        {error && (
          <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
            {error}
          </div>
        )}

        {/* Final result */}
        {state.photo.finalDataUrl && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm font-medium text-green-700 mb-3">Processed Result:</p>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <img
                src={state.photo.finalDataUrl}
                alt="Processed"
                className="max-h-64 rounded-lg border border-green-300 shadow-sm"
              />
              {imageInfo && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Dimensions:</span>
                    <span className="font-medium">{imageInfo.width} x {imageInfo.height} px</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">File Size:</span>
                    <span className="font-medium">{imageInfo.sizeKB} KB</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-600">Format:</span>
                    <span className="font-medium">JPEG</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
