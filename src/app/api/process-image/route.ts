import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      imageDataUrl,
      targetWidth = 630,
      targetHeight = 810,
      maxFileSizeKB = 250,
    } = body;

    if (!imageDataUrl) {
      return NextResponse.json(
        { success: false, error: 'No image data provided' },
        { status: 400 }
      );
    }

    // Decode base64 to buffer
    const base64Data = imageDataUrl.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');

    // Iterative quality reduction to meet size target
    let quality = 95;
    let outputBuffer: Buffer;

    do {
      outputBuffer = await sharp(imageBuffer)
        .resize(targetWidth, targetHeight, {
          fit: 'cover',
          position: 'centre',
        })
        .jpeg({ quality, mozjpeg: true })
        .toBuffer();

      if (outputBuffer.length / 1024 <= maxFileSizeKB) break;
      quality -= 3;
    } while (quality > 15);

    const fileSizeKB = Math.round((outputBuffer.length / 1024) * 10) / 10;

    if (fileSizeKB > maxFileSizeKB) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot compress to ${maxFileSizeKB}KB. Smallest achieved: ${fileSizeKB}KB at quality ${quality}`,
        },
        { status: 400 }
      );
    }

    const resultDataUrl = `data:image/jpeg;base64,${outputBuffer.toString('base64')}`;

    return NextResponse.json({
      success: true,
      imageDataUrl: resultDataUrl,
      fileSizeKB,
      width: targetWidth,
      height: targetHeight,
      quality,
    });
  } catch (error) {
    console.error('Image processing error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
