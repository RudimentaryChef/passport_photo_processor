'use client';

import { useState } from 'react';
import { usePhoto } from '@/context/PhotoContext';
import { useBackgroundRemoval } from '@/hooks/useBackgroundRemoval';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import { Eraser, AlertTriangle } from 'lucide-react';

export default function BackgroundRemover() {
  const { state, dispatch } = usePhoto();
  const { removeBackground, isProcessing, progress, error } = useBackgroundRemoval();
  const [bgRemoved, setBgRemoved] = useState(false);

  const sourceImage = state.photo.croppedDataUrl || state.photo.originalDataUrl;

  const handleRemoveBackground = async () => {
    if (!sourceImage) return;
    try {
      const result = await removeBackground(sourceImage);
      dispatch({ type: 'SET_PROCESSED_PHOTO', payload: result });
      setBgRemoved(true);
    } catch {
      // Error is handled by the hook
    }
  };

  if (!sourceImage) {
    return null;
  }

  return (
    <Card title="Background Removal">
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          Remove the background and replace it with white. This uses an AI model that runs entirely in your browser.
        </p>

        {!bgRemoved && !isProcessing && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700">
              First-time use downloads a ~40MB AI model (cached for future use). This may take a moment.
            </p>
          </div>
        )}

        {isProcessing && (
          <ProgressBar progress={progress} label="Processing background removal..." />
        )}

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={handleRemoveBackground}
            disabled={isProcessing}
          >
            <Eraser className="w-4 h-4 mr-2" />
            {isProcessing ? 'Removing...' : bgRemoved ? 'Re-run Removal' : 'Remove Background'}
          </Button>
        </div>

        {state.photo.processedDataUrl && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">After Background Removal:</p>
            <img
              src={state.photo.processedDataUrl}
              alt="Background removed"
              className="max-h-48 rounded-lg border border-gray-200 shadow-sm"
            />
          </div>
        )}
      </div>
    </Card>
  );
}
