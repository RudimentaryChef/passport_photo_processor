'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { FaceDetectionResult } from '@/types';
import { FACE_DETECTION_MODEL_URL } from '@/lib/constants';

let detectorPromise: Promise<InstanceType<typeof import('@mediapipe/tasks-vision').FaceDetector>> | null = null;

async function getOrCreateDetector() {
  if (detectorPromise) return detectorPromise;

  detectorPromise = (async () => {
    const { FaceDetector, FilesetResolver } = await import('@mediapipe/tasks-vision');
    const vision = await FilesetResolver.forVisionTasks(
      'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
    );
    return await FaceDetector.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: FACE_DETECTION_MODEL_URL,
        delegate: 'GPU',
      },
      runningMode: 'IMAGE',
      minDetectionConfidence: 0.5,
    });
  })();

  return detectorPromise;
}

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

export function useFaceDetection(imageDataUrl: string | null) {
  const [faceDetection, setFaceDetection] = useState<FaceDetectionResult | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const latestUrlRef = useRef(imageDataUrl);
  latestUrlRef.current = imageDataUrl;

  const detect = useCallback(async (dataUrl: string) => {
    setIsDetecting(true);
    setError(null);
    setFaceDetection(null);

    try {
      const detector = await getOrCreateDetector();
      const img = await loadImageElement(dataUrl);

      if (latestUrlRef.current !== dataUrl) return;

      const result = detector.detect(img);

      if (!result.detections || result.detections.length === 0) {
        setError('No face detected in the image.');
        return;
      }

      const detection = result.detections[0];
      const bbox = detection.boundingBox;
      if (!bbox) {
        setError('Face detection returned no bounding box.');
        return;
      }

      const faceCoveragePercent = (bbox.height / img.naturalHeight) * 100;
      const keypoints = (detection.keypoints ?? []).map((kp) => ({
        x: kp.x,
        y: kp.y,
        name: kp.name ?? undefined,
      }));

      setFaceDetection({
        boundingBox: {
          originX: bbox.originX,
          originY: bbox.originY,
          width: bbox.width,
          height: bbox.height,
        },
        keypoints,
        confidence: detection.categories?.[0]?.score ?? 0,
        faceCoveragePercent,
      });
    } catch (err) {
      if (latestUrlRef.current !== dataUrl) return;
      console.error('Face detection error:', err);
      setError(err instanceof Error ? err.message : 'Face detection failed');
    } finally {
      if (latestUrlRef.current === dataUrl) {
        setIsDetecting(false);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !imageDataUrl) {
      setFaceDetection(null);
      setError(null);
      setIsDetecting(false);
      return;
    }
    detect(imageDataUrl);
  }, [imageDataUrl, detect]);

  return { faceDetection, isDetecting, error };
}
