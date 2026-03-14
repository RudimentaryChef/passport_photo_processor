'use client';

import { useState, useCallback, useRef } from 'react';
import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_SIZE_MB } from '@/lib/constants';

interface UseFileUploadReturn {
  file: File | null;
  dataUrl: string | null;
  isDragging: boolean;
  error: string | null;
  handleDrop: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragEnter: (e: React.DragEvent) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  reset: () => void;
}

export function useFileUpload(
  acceptedTypes: string[] = ACCEPTED_IMAGE_TYPES,
  maxSizeMB: number = MAX_UPLOAD_SIZE_MB,
): UseFileUploadReturn {
  const [file, setFile] = useState<File | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dragCounter = useRef(0);

  const processFile = useCallback((f: File) => {
    setError(null);

    if (!acceptedTypes.includes(f.type)) {
      setError(`Invalid file type. Accepted: ${acceptedTypes.join(', ')}`);
      return;
    }

    if (f.size > maxSizeMB * 1024 * 1024) {
      setError(`File too large. Maximum: ${maxSizeMB}MB`);
      return;
    }

    setFile(f);
    const reader = new FileReader();
    reader.onloadend = () => setDataUrl(reader.result as string);
    reader.onerror = () => setError('Failed to read file');
    reader.readAsDataURL(f);
  }, [acceptedTypes, maxSizeMB]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  }, [processFile]);

  const reset = useCallback(() => {
    setFile(null);
    setDataUrl(null);
    setError(null);
    setIsDragging(false);
    dragCounter.current = 0;
  }, []);

  return {
    file, dataUrl, isDragging, error,
    handleDrop, handleDragOver, handleDragEnter, handleDragLeave,
    handleFileSelect, reset,
  };
}
