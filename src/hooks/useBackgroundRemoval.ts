'use client';

import { useState, useCallback } from 'react';
import { loadImage } from '@/lib/imageProcessing';

export function useBackgroundRemoval() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const removeBackground = useCallback(async (imageDataUrl: string): Promise<string> => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      const { removeBackground: removeBg } = await import('@imgly/background-removal');
      setProgress(10);

      const response = await fetch(imageDataUrl);
      const inputBlob = await response.blob();
      setProgress(20);

      const resultBlob: Blob = await removeBg(inputBlob, {
        progress: (key: string, current: number, total: number) => {
          if (total > 0) {
            setProgress(Math.round(20 + (current / total) * 70));
          }
          if (key) console.debug(`BG removal [${key}]: ${current}/${total}`);
        },
      });

      setProgress(90);

      // Composite onto white background
      const resultUrl = URL.createObjectURL(resultBlob);
      const img = await loadImage(resultUrl);
      URL.revokeObjectURL(resultUrl);

      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      setProgress(100);
      return canvas.toDataURL('image/jpeg', 0.95);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Background removal failed';
      console.error('Background removal error:', err);
      setError(message);
      throw new Error(message);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  return { removeBackground, isProcessing, progress, error };
}
