import { put, del } from '@vercel/blob';
import { NextResponse } from 'next/server';

// Загрузка файла
export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename || !request.body) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  try {
    const blob = await put(filename, request.body, {
      access: 'public',
    });

    return NextResponse.json(blob);
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

// Удаление файла
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const urlToDelete = searchParams.get('url');

  if (!urlToDelete) {
    return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
  }

  try {
    await del(urlToDelete);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
  }
}
