import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('sweetsDB');
    const products = await db.collection('items').find({}).toArray();
    return NextResponse.json(products);
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
  }
}