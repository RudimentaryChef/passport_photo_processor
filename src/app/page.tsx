'use client';

import { PhotoProvider, usePhoto } from '@/context/PhotoContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import StepIndicator from '@/components/layout/StepIndicator';
import PhotoUploader from '@/components/upload/PhotoUploader';
import PhotoCropper from '@/components/crop/PhotoCropper';
import BackgroundRemover from '@/components/processing/BackgroundRemover';
import ProcessingPreview from '@/components/processing/ProcessingPreview';
import ValidationChecklist from '@/components/validation/ValidationChecklist';
import DownloadSection from '@/components/download/DownloadSection';
import SettingsPanel from '@/components/ui/SettingsPanel';
import Button from '@/components/ui/Button';
import { STEPS } from '@/lib/constants';
import { ArrowLeft, ArrowRight } from 'lucide-react';

function AppContent() {
  const { state, dispatch } = usePhoto();
  const { processingStep } = state.photo;

  const goToStep = (step: string) => {
    dispatch({
      type: 'SET_STEP',
      payload: step as 'upload' | 'crop' | 'process' | 'download',
    });
  };

  const canGoNext = () => {
    switch (processingStep) {
      case 'upload':
        return !!state.photo.originalDataUrl;
      case 'crop':
        return !!state.photo.croppedDataUrl;
      case 'process':
        return !!state.photo.finalDataUrl;
      default:
        return false;
    }
  };

  const nextStep = () => {
    const currentIndex = STEPS.findIndex((s) => s.id === processingStep);
    if (currentIndex < STEPS.length - 1) {
      goToStep(STEPS[currentIndex + 1].id);
    }
  };

  const prevStep = () => {
    const currentIndex = STEPS.findIndex((s) => s.id === processingStep);
    if (currentIndex > 0) {
      goToStep(STEPS[currentIndex - 1].id);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <StepIndicator currentStep={processingStep} steps={STEPS} />

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content area */}
          <div className="lg:col-span-2">
            {processingStep === 'upload' && <PhotoUploader />}
            {processingStep === 'crop' && (
              <div className="space-y-6">
                <PhotoCropper />
                <BackgroundRemover />
              </div>
            )}
            {processingStep === 'process' && <ProcessingPreview />}
            {processingStep === 'download' && <DownloadSection />}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <SettingsPanel />
            {processingStep !== 'upload' && (
              <ValidationChecklist results={state.photo.validationResults} />
            )}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="mt-8 flex justify-between items-center">
          <div>
            {processingStep !== 'upload' && (
              <Button variant="secondary" onClick={prevStep}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
          </div>
          <div>
            {processingStep !== 'download' && (
              <Button
                variant="primary"
                onClick={nextStep}
                disabled={!canGoNext()}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function Home() {
  return (
    <PhotoProvider>
      <AppContent />
    </PhotoProvider>
  );
}
