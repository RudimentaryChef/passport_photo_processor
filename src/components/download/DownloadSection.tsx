'use client';

import { usePhoto } from '@/context/PhotoContext';
import { dataUrlToBlob } from '@/lib/imageProcessing';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import SignatureUploader from '@/components/upload/SignatureUploader';
import { Download, RotateCcw, CheckCircle } from 'lucide-react';

export default function DownloadSection() {
  const { state, dispatch } = usePhoto();
  const { settings } = state;

  const downloadFile = (dataUrl: string, filename: string) => {
    const blob = dataUrlToBlob(dataUrl);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPhoto = () => {
    if (state.photo.finalDataUrl) {
      downloadFile(state.photo.finalDataUrl, `passport_photo_${settings.photoWidth}x${settings.photoHeight}.jpg`);
    }
  };

  const handleDownloadSignature = () => {
    if (state.signature.finalDataUrl) {
      downloadFile(state.signature.finalDataUrl, 'signature.jpg');
    }
  };

  const handleStartOver = () => {
    dispatch({ type: 'RESET' });
  };

  return (
    <div className="space-y-6">
      <Card title="Download Processed Photo">
        {state.photo.finalDataUrl ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600 mb-4">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Photo is ready for upload!</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <img
                src={state.photo.finalDataUrl}
                alt="Final passport photo"
                className="max-h-72 rounded-lg border-2 border-green-300 shadow-md"
              />
              <div className="space-y-3 text-sm">
                <p className="text-gray-600">
                  <span className="font-medium text-gray-900">Dimensions:</span>{' '}
                  {settings.photoWidth} x {settings.photoHeight} px
                </p>
                <p className="text-gray-600">
                  <span className="font-medium text-gray-900">Format:</span> JPEG
                </p>
                <p className="text-gray-600">
                  <span className="font-medium text-gray-900">Max Size:</span>{' '}
                  {settings.photoMaxSizeKB} KB
                </p>

                <Button variant="primary" size="lg" onClick={handleDownloadPhoto}>
                  <Download className="w-5 h-5 mr-2" />
                  Download Photo
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Process your photo first to enable download.</p>
        )}
      </Card>

      {/* Signature section */}
      <SignatureUploader />

      {state.signature.originalDataUrl && (
        <Card>
          <Button variant="primary" size="sm" onClick={handleDownloadSignature} disabled={!state.signature.finalDataUrl}>
            <Download className="w-4 h-4 mr-2" />
            Download Signature
          </Button>
        </Card>
      )}

      {/* Start over */}
      <div className="text-center">
        <Button variant="ghost" onClick={handleStartOver}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Start Over
        </Button>
      </div>
    </div>
  );
}
