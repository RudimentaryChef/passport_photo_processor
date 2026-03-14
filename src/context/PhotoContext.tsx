'use client';

import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import type {
  PhotoState,
  SignatureState,
  AppSettings,
  ValidationResult,
  CropArea,
  CropAreaPixels,
  FaceDetectionResult,
  ProcessingStep,
} from '@/types';
import { DEFAULT_SETTINGS } from '@/lib/constants';

export interface AppState {
  photo: PhotoState;
  signature: SignatureState;
  settings: AppSettings;
}

const initialPhotoState: PhotoState = {
  originalFile: null,
  originalDataUrl: null,
  croppedDataUrl: null,
  processedDataUrl: null,
  finalDataUrl: null,
  cropArea: null,
  croppedAreaPixels: null,
  faceDetection: null,
  validationResults: [],
  processingStep: 'upload',
};

const initialSignatureState: SignatureState = {
  originalFile: null,
  originalDataUrl: null,
  croppedDataUrl: null,
  finalDataUrl: null,
  validationResults: [],
};

const initialState: AppState = {
  photo: initialPhotoState,
  signature: initialSignatureState,
  settings: { ...DEFAULT_SETTINGS },
};

type Action =
  | { type: 'SET_ORIGINAL_PHOTO'; payload: { file: File; dataUrl: string } }
  | { type: 'SET_FACE_DETECTION'; payload: FaceDetectionResult | null }
  | { type: 'SET_CROP_AREA'; payload: CropArea }
  | { type: 'SET_CROPPED_AREA_PIXELS'; payload: CropAreaPixels }
  | { type: 'SET_CROPPED_PHOTO'; payload: string }
  | { type: 'SET_PROCESSED_PHOTO'; payload: string }
  | { type: 'SET_FINAL_PHOTO'; payload: string }
  | { type: 'SET_VALIDATION_RESULTS'; payload: ValidationResult[] }
  | { type: 'SET_STEP'; payload: ProcessingStep }
  | { type: 'SET_SIGNATURE'; payload: { file: File; dataUrl: string } }
  | { type: 'SET_FINAL_SIGNATURE'; payload: string }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'RESET' };

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_ORIGINAL_PHOTO':
      return {
        ...state,
        photo: {
          ...initialPhotoState,
          originalFile: action.payload.file,
          originalDataUrl: action.payload.dataUrl,
          processingStep: 'crop',
        },
      };
    case 'SET_FACE_DETECTION':
      return { ...state, photo: { ...state.photo, faceDetection: action.payload } };
    case 'SET_CROP_AREA':
      return { ...state, photo: { ...state.photo, cropArea: action.payload } };
    case 'SET_CROPPED_AREA_PIXELS':
      return { ...state, photo: { ...state.photo, croppedAreaPixels: action.payload } };
    case 'SET_CROPPED_PHOTO':
      return { ...state, photo: { ...state.photo, croppedDataUrl: action.payload } };
    case 'SET_PROCESSED_PHOTO':
      return { ...state, photo: { ...state.photo, processedDataUrl: action.payload } };
    case 'SET_FINAL_PHOTO':
      return { ...state, photo: { ...state.photo, finalDataUrl: action.payload } };
    case 'SET_VALIDATION_RESULTS':
      return { ...state, photo: { ...state.photo, validationResults: action.payload } };
    case 'SET_STEP':
      return { ...state, photo: { ...state.photo, processingStep: action.payload } };
    case 'SET_SIGNATURE':
      return {
        ...state,
        signature: { ...initialSignatureState, originalFile: action.payload.file, originalDataUrl: action.payload.dataUrl },
      };
    case 'SET_FINAL_SIGNATURE':
      return { ...state, signature: { ...state.signature, finalDataUrl: action.payload } };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'RESET':
      return { ...initialState, settings: state.settings };
    default:
      return state;
  }
}

interface PhotoContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const PhotoContext = createContext<PhotoContextValue | undefined>(undefined);

export function PhotoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <PhotoContext.Provider value={{ state, dispatch }}>
      {children}
    </PhotoContext.Provider>
  );
}

export function usePhoto(): PhotoContextValue {
  const context = useContext(PhotoContext);
  if (context === undefined) {
    throw new Error('usePhoto must be used within a PhotoProvider');
  }
  return context;
}
