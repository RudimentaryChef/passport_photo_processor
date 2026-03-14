'use client';

import { useState, useCallback } from 'react';
import type { ProcessImageRequest, ProcessImageResponse } from '@/types';
import { compressImageClient } from '@/lib/imageProcessing';

export function useImageProcessing() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processImage = useCallback(async (request: ProcessImageRequest): Promise<string> => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/process-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) throw new Error(`Server responded with ${response.status}`);

      const data: ProcessImageResponse = await response.json();
      if (!data.success || !data.imageDataUrl) {
        throw new Error(data.error ?? 'Server processing failed');
      }

      return data.imageDataUrl;
    } catch (serverError) {
      console.warn('Server processing failed, using client-side fallback:', serverError);
      try {
        const result = await compressImageClient(request.imageDataUrl, request.maxFileSizeKB, 90);
        setError('Used client-side compression (server unavailable)');
        return result;
      } catch (clientError) {
        const msg = clientError instanceof Error ? clientError.message : 'Processing failed';
        setError(msg);
        throw new Error(msg);
      }
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return { processImage, isProcessing, error };
}
