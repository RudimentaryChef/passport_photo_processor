'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';
import { usePhoto } from '@/context/PhotoContext';
import { getCroppedImage } from '@/lib/cropUtils';
import { calculateAutoCrop } from '@/lib/cropUtils';
import { getImageDimensions } from '@/lib/imageProcessing';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Scissors, Wand2, ZoomIn, ZoomOut } from 'lucide-react';

export default function PhotoCropper() {
  const { state, dispatch } = usePhoto();
  const { originalDataUrl, faceDetection } = state.photo;
  const { settings } = state;

  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  const aspectRatio = settings.photoWidth / settings.photoHeight;

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleApplyCrop = async () => {
    if (!originalDataUrl || !croppedAreaPixels) return;
    setIsCropping(true);
    try {
      const croppedImage = await getCroppedImage(originalDataUrl, croppedAreaPixels);
      dispatch({ type: 'SET_CROPPED_PHOTO', payload: croppedImage });
      dispatch({
        type: 'SET_CROPPED_AREA_PIXELS',
        payload: croppedAreaPixels,
      });
    } catch (err) {
      console.error('Crop error:', err);
    } finally {
      setIsCropping(false);
    }
  };

  const handleAutoCrop = async () => {
    if (!originalDataUrl || !faceDetection) return;
    try {
      const dims = await getImageDimensions(originalDataUrl);
      const autoCrop = calculateAutoCrop(faceDetection, dims.width, dims.height, settings);

      // Calculate crop and zoom for react-easy-crop
      const imgAspect = dims.width / dims.height;
      const cropAspect = aspectRatio;

      // Approximate zoom level based on face size vs image size
      const faceRatio = autoCrop.height / dims.height;
      const newZoom = 1 / faceRatio;

      setZoom(Math.min(3, Math.max(1, newZoom)));

      // Center on the face
      const centerX = (autoCrop.x + autoCrop.width / 2) / dims.width;
      const centerY = (autoCrop.y + autoCrop.height / 2) / dims.height;
      setCrop({
        x: (centerX - 0.5) * dims.width * (newZoom > 1 ? 0.5 : 1),
        y: (centerY - 0.5) * dims.height * (newZoom > 1 ? 0.5 : 1),
      });
    } catch (err) {
      console.error('Auto-crop error:', err);
    }
  };

  if (!originalDataUrl) {
    return (
      <Card title="Crop Photo">
        <p className="text-gray-500">Upload a photo first to start cropping.</p>
      </Card>
    );
  }

  return (
    <Card title="Crop Photo">
      <div className="space-y-4">
        {/* Cropper */}
        <div className="relative h-96 bg-gray-900 rounded-lg overflow-hidden">
          <Cropper
            image={originalDataUrl}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <ZoomOut className="w-4 h-4 text-gray-400" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1"
          />
          <ZoomIn className="w-4 h-4 text-gray-400" />
        </div>

        <div className="flex gap-3">
          {faceDetection && (
            <Button variant="secondary" onClick={handleAutoCrop}>
              <Wand2 className="w-4 h-4 mr-2" />
              Auto Crop
            </Button>
          )}
          <Button variant="primary" onClick={handleApplyCrop} disabled={isCropping || !croppedAreaPixels}>
            <Scissors className="w-4 h-4 mr-2" />
            {isCropping ? 'Cropping...' : 'Apply Crop'}
          </Button>
        </div>

        {/* Cropped Preview */}
        {state.photo.croppedDataUrl && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Cropped Preview:</p>
            <img
              src={state.photo.croppedDataUrl}
              alt="Cropped preview"
              className="max-h-48 rounded-lg border border-gray-200 shadow-sm"
            />
          </div>
        )}
      </div>
    </Card>
  );
}
