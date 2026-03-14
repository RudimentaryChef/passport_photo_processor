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
  startQuality: number = 98,
): Promise<string> {
  const img = await loadImage(dataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');
  ctx.drawImage(img, 0, 0);

  // Start high and drop slowly to preserve sharpness
  let quality = startQuality / 100;
  let result = canvas.toDataURL('image/jpeg', quality);
  let sizeKB = dataUrlToBlob(result).size / 1024;

  while (sizeKB > maxSizeKB && quality > 0.3) {
    quality -= 0.02;
    result = canvas.toDataURL('image/jpeg', quality);
    sizeKB = dataUrlToBlob(result).size / 1024;
  }

  return result;
}

/**
 * Horizontal box blur pass — used to build Gaussian approximation.
 */
function boxBlurH(src: Float64Array, dst: Float64Array, w: number, h: number, r: number) {
  const diameter = r + r + 1;
  for (let y = 0; y < h; y++) {
    const rowOffset = y * w;
    let val = src[rowOffset] * (r + 1);
    for (let x = 0; x < r; x++) val += src[rowOffset + x];
    for (let x = 0; x <= r; x++) {
      val += src[rowOffset + Math.min(x + r, w - 1)] - src[rowOffset];
      dst[rowOffset + x] = val / diameter;
    }
    for (let x = r + 1; x < w - r; x++) {
      val += src[rowOffset + x + r] - src[rowOffset + x - r - 1];
      dst[rowOffset + x] = val / diameter;
    }
    for (let x = w - r; x < w; x++) {
      val += src[rowOffset + w - 1] - src[rowOffset + x - r - 1];
      dst[rowOffset + x] = val / diameter;
    }
  }
}

/**
 * Vertical box blur pass.
 */
function boxBlurV(src: Float64Array, dst: Float64Array, w: number, h: number, r: number) {
  const diameter = r + r + 1;
  for (let x = 0; x < w; x++) {
    let val = src[x] * (r + 1);
    for (let y = 0; y < r; y++) val += src[y * w + x];
    for (let y = 0; y <= r; y++) {
      val += src[Math.min(y + r, h - 1) * w + x] - src[x];
      dst[y * w + x] = val / diameter;
    }
    for (let y = r + 1; y < h - r; y++) {
      val += src[(y + r) * w + x] - src[(y - r - 1) * w + x];
      dst[y * w + x] = val / diameter;
    }
    for (let y = h - r; y < h; y++) {
      val += src[(h - 1) * w + x] - src[(y - r - 1) * w + x];
      dst[y * w + x] = val / diameter;
    }
  }
}

/**
 * Gaussian blur approximation using 3 box blur passes.
 * radius controls blur strength (higher = more blur for unsharp mask to counteract).
 */
function gaussianBlur(channel: Float64Array, w: number, h: number, radius: number) {
  const tmp = new Float64Array(channel.length);
  // 3 passes of box blur approximates Gaussian
  for (let pass = 0; pass < 3; pass++) {
    boxBlurH(channel, tmp, w, h, radius);
    boxBlurV(tmp, channel, w, h, radius);
  }
}

/**
 * Apply unsharp mask to sharpen an image.
 * Uses Gaussian blur approximation with configurable radius for proper sharpening.
 *
 * amount: sharpening strength (1.0 = moderate, 2.0 = strong)
 * radius: blur radius for unsharp mask (larger = affects coarser detail, default 2)
 */
export async function sharpenImage(
  dataUrl: string,
  amount: number = 1.5,
  radius: number = 2,
): Promise<string> {
  const img = await loadImage(dataUrl);
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Failed to get canvas context');

  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = imageData;

  // Extract each channel as float for precision
  const channels: Float64Array[] = [];
  for (let c = 0; c < 3; c++) {
    const ch = new Float64Array(width * height);
    for (let i = 0; i < width * height; i++) {
      ch[i] = data[i * 4 + c];
    }
    channels.push(ch);
  }

  // Create blurred copies
  const blurredChannels = channels.map((ch) => {
    const blurred = new Float64Array(ch);
    gaussianBlur(blurred, width, height, radius);
    return blurred;
  });

  // Unsharp mask: result = original + amount * (original - blurred)
  for (let i = 0; i < width * height; i++) {
    for (let c = 0; c < 3; c++) {
      const original = channels[c][i];
      const blurred = blurredChannels[c][i];
      const sharpened = original + amount * (original - blurred);
      data[i * 4 + c] = Math.max(0, Math.min(255, Math.round(sharpened)));
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL('image/jpeg', 1.0);
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
  return canvas.toDataURL('image/jpeg', 1.0);
}
