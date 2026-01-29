import { NextResponse } from 'next/server';
import { checkKVConnection } from '@/lib/kv';

export async function GET() {
  try {
    const isHealthy = await checkKVConnection();
    return NextResponse.json({ ok: isHealthy }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
