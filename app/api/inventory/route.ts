import { NextRequest, NextResponse } from 'next/server';
import { createInventory, getInventoryByProduct } from '@/lib/inventory';

// GET /api/inventory?productId=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get('productId');
  if (!productId) {
    return NextResponse.json({ error: 'productId is required' }, { status: 400 });
  }
  const inventory = await getInventoryByProduct(productId);
  return NextResponse.json(inventory);
}

// POST /api/inventory
export async function POST(req: NextRequest) {
  const data = await req.json();
  // TODO: 데이터 유효성 검사 필요
  const id = await createInventory(data);
  return NextResponse.json({ id });
} 