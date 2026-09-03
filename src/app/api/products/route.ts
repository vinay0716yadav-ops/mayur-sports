import { NextResponse } from 'next/server';
import { db } from '@/lib/store';
import { Product } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await db.getProducts();
    return NextResponse.json({ success: true, products });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

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
    const {
      name,
      category,
      brand,
      price,
      mrp,
      stockStatus,
      stockCount,
      description,
      features,
      imageUrl,
      badge,
      featured,
    } = body;

    if (!name || !category || !price) {
      return NextResponse.json(
        { success: false, message: 'Name, Category, and Price are required' },
        { status: 400 }
      );
    }

    const newProduct = await db.createProduct({
      name: String(name).trim(),
      category,
      brand: brand ? String(brand).trim() : 'General',
      price: Number(price),
      mrp: mrp ? Number(mrp) : Number(price),
      stockStatus: stockStatus || 'IN_STOCK',
      stockCount: stockCount !== undefined ? Number(stockCount) : 10,
      description: description ? String(description).trim() : '',
      features: Array.isArray(features) ? features : [],
      imageUrl: imageUrl && String(imageUrl).trim().length > 0 
        ? String(imageUrl).trim() 
        : 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=800&q=80',
      badge: badge ? String(badge).trim() : '',
      featured: Boolean(featured),
    });

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Failed to create product' },
      { status: 500 }
    );
  }
}
