import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

async function uploadAudioToCloudinary(audioFile: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", audioFile);
  formData.append("upload_preset", "mgf79dzn");
  formData.append("resource_type", "audio");

  try {
    const response = await axios.post(
      "https://api.cloudinary.com/v1_1/dpgvsl8ap/upload",
      formData
    );
    return response.data.secure_url;
  } catch (error) {
    console.error("Error uploading audio to Cloudinary:", error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const audioUrl = await uploadAudioToCloudinary(file);

    return NextResponse.json({ 
      success: true,
      audio_url: audioUrl
    }, { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}