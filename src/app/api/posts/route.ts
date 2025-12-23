// This API route is deprecated and has been replaced by a Server Action
// located in /src/app/lib/actions/posts.ts.

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ error: 'This endpoint is deprecated.' }, { status: 410 });
}

export async function POST() {
  return NextResponse.json({ error: 'This endpoint is deprecated. Use the `upsertPost` Server Action instead.' }, { status: 410 });
}
