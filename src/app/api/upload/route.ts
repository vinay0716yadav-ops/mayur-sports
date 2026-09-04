import { NextResponse } from 'next/server';
import { processProductImage } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Admin authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { image } = body;

    if (!image || typeof image !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Image data URL is required' },
        { status: 400 }
      );
    }

    const permanentUrl = await processProductImage(image);
    return NextResponse.json({ success: true, url: permanentUrl });
  } catch (error) {
    console.error('Upload route error:', error);
    return NextResponse.json(
      { success: false, message: 'Image upload failed' },
      { status: 500 }
    );
  }
}
