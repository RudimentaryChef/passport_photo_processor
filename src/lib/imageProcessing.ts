export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const byteString = atob(parts[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mime });
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  const img = await loadImage(dataUrl);
  return { width: img.naturalWidth, height: img.naturalHeight };
}

export async function getDataUrlSizeKB(dataUrl: string): Promise<number> {
  const blob = dataUrlToBlob(dataUrl);
  return Math.round((blob.size / 1024) * 10) / 10;
}

export async function compressImageClient(
  dataUrl: string,
  maxSizeKB: number,
  startQuality: number = 92,
): Promise<string> {
  const img = await loadImage(dataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');
  ctx.drawImage(img, 0, 0);

  let quality = startQuality / 100;
  let result = canvas.toDataURL('image/jpeg', quality);
  let sizeKB = dataUrlToBlob(result).size / 1024;

  while (sizeKB > maxSizeKB && quality > 0.1) {
    quality -= 0.05;
    result = canvas.toDataURL('image/jpeg', quality);
    sizeKB = dataUrlToBlob(result).size / 1024;
  }

  return result;
}

export async function resizeImageClient(
  dataUrl: string,
  targetWidth: number,
  targetHeight: number,
): Promise<string> {
  const img = await loadImage(dataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
  return canvas.toDataURL('image/jpeg', 0.95);
}
