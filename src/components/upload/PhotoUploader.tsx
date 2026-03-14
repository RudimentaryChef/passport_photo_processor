'use client';

import { useRef, useEffect } from 'react';
import { usePhoto } from '@/context/PhotoContext';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useFaceDetection } from '@/hooks/useFaceDetection';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Upload, ImageIcon, RefreshCw, Loader2 } from 'lucide-react';
import { ACCEPTED_IMAGE_EXTENSIONS } from '@/lib/constants';

export default function PhotoUploader() {
  const { state, dispatch } = usePhoto();
  const { file, dataUrl, isDragging, error, handleDrop, handleDragOver, handleDragEnter, handleDragLeave, handleFileSelect, reset } = useFileUpload();
  const { faceDetection, isDetecting, error: faceError } = useFaceDetection(dataUrl);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync file upload to context
  useEffect(() => {
    if (file && dataUrl) {
      dispatch({ type: 'SET_ORIGINAL_PHOTO', payload: { file, dataUrl } });
    }
  }, [file, dataUrl, dispatch]);

  // Sync face detection to context
  useEffect(() => {
    if (faceDetection) {
      dispatch({ type: 'SET_FACE_DETECTION', payload: faceDetection });
    }
  }, [faceDetection, dispatch]);

  const hasPhoto = !!state.photo.originalDataUrl;

  if (hasPhoto) {
    return (
      <Card title="Photo Uploaded">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <img
              src={state.photo.originalDataUrl!}
              alt="Uploaded photo"
              className="max-h-80 rounded-lg shadow-md"
            />
            {isDetecting && (
              <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center">
                <div className="flex items-center gap-2 text-white bg-black/50 px-3 py-2 rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Detecting face...</span>
                </div>
              </div>
            )}
          </div>

          {faceDetection && (
            <div className="text-sm text-green-600 flex items-center gap-1">
              Face detected ({Math.round(faceDetection.confidence * 100)}% confidence)
            </div>
          )}

          {faceError && (
            <div className="text-sm text-amber-600">{faceError}</div>
          )}

          <Button
            variant="secondary"
            onClick={() => {
              reset();
              dispatch({ type: 'RESET' });
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Change Photo
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Upload Photo">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_EXTENSIONS}
          onChange={handleFileSelect}
          className="hidden"
        />
        <div className="flex flex-col items-center gap-3">
          {isDragging ? (
            <ImageIcon className="w-12 h-12 text-blue-500" />
          ) : (
            <Upload className="w-12 h-12 text-gray-400" />
          )}
          <div>
            <p className="text-lg font-medium text-gray-700">
              {isDragging ? 'Drop your photo here' : 'Drag & drop your photo'}
            </p>
            <p className="text-sm text-gray-500 mt-1">or click to browse files</p>
            <p className="text-xs text-gray-400 mt-2">Supports JPEG, PNG, WebP, HEIC (max 10MB)</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </div>
      )}
    </Card>
  );
}
