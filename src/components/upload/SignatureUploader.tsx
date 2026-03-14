'use client';

import { useRef, useEffect } from 'react';
import { usePhoto } from '@/context/PhotoContext';
import { useFileUpload } from '@/hooks/useFileUpload';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { PenTool, RefreshCw, Upload } from 'lucide-react';
import { ACCEPTED_IMAGE_EXTENSIONS } from '@/lib/constants';

export default function SignatureUploader() {
  const { state, dispatch } = usePhoto();
  const { file, dataUrl, isDragging, error, handleDrop, handleDragOver, handleDragEnter, handleDragLeave, handleFileSelect, reset } = useFileUpload();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (file && dataUrl) {
      dispatch({ type: 'SET_SIGNATURE', payload: { file, dataUrl } });
    }
  }, [file, dataUrl, dispatch]);

  const hasSignature = !!state.signature.originalDataUrl;

  if (hasSignature) {
    return (
      <Card title="Signature Uploaded">
        <div className="flex flex-col items-center gap-4">
          <img
            src={state.signature.originalDataUrl!}
            alt="Signature"
            className="max-h-32 rounded-lg border border-gray-200"
          />
          <Button variant="secondary" size="sm" onClick={() => { reset(); dispatch({ type: 'SET_SIGNATURE', payload: { file: null as unknown as File, dataUrl: '' } }); }}>
            <RefreshCw className="w-3 h-3 mr-1" />
            Change Signature
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Upload Signature (Optional)">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
        }`}
        onClick={() => inputRef.current?.click()}
      >
        <input ref={inputRef} type="file" accept={ACCEPTED_IMAGE_EXTENSIONS} onChange={handleFileSelect} className="hidden" />
        <div className="flex flex-col items-center gap-2">
          {isDragging ? <Upload className="w-8 h-8 text-blue-500" /> : <PenTool className="w-8 h-8 text-gray-400" />}
          <p className="text-sm font-medium text-gray-600">Upload scanned signature</p>
          <p className="text-xs text-gray-400">Black/blue pen on white paper, under {state.settings.signatureMaxSizeKB}KB</p>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </Card>
  );
}
