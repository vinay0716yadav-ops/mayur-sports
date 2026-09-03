import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    const expectedPassword = process.env.ADMIN_PASSWORD || 'Manoj@1010';

    if (password === expectedPassword) {
      // In a lightweight setup, return a signed-like verification token
      const token = Buffer.from(`mayur-admin-authenticated-${Date.now()}`).toString('base64');
      return NextResponse.json({
        success: true,
        message: 'Authentication successful',
        token,
      });
    }

    return NextResponse.json(
      { success: false, message: 'Invalid admin passcode. Please try again.' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Authentication error' },
      { status: 500 }
    );
  }
}
