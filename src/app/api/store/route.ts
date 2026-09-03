import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const storeInfo = await db.getStoreInfo();
    return NextResponse.json({ success: true, storeInfo });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch store info' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized: Admin authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const updated = await db.updateStoreInfo(body);
    return NextResponse.json({ success: true, storeInfo: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to update store info' },
      { status: 500 }
    );
  }
}
