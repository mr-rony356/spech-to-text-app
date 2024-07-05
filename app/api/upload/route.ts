import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  const data = await request.formData();
  const file: File | null = data.get('file') as unknown as File;

  if (!file) {
    return NextResponse.json({ success: false });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const filename = `${file.name}`;
  const filePath = path.join(process.cwd(), 'public', 'uploads', filename);

  try {
    await writeFile(filePath, buffer);
    return NextResponse.json({ success: true, filename });
  } catch (error) {
    console.error('Error saving file:', error);
    return NextResponse.json({ success: false });
  }
}