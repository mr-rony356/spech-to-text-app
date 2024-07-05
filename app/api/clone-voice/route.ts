import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

export const POST = async (req: NextRequest) => {
  try {
    const { filename } = await req.json();

    if (!filename) {
      return NextResponse.json({ error: 'Filename  name  required' }, { status: 400 });
    }

    const formData = new FormData();
    formData.append('sample_file', fs.createReadStream(`public/uploads/${filename}`));
    formData.append('voice_name', 'Clonned Voice');

    const url = 'https://api.play.ht/api/v2/cloned-voices/instant';
    const options = {
      method: 'POST',
      headers: {
        accept: 'application/json',
        AUTHORIZATION: process.env.PLAYHT_API_SECRET_KEY!,
        'X-USER-ID': process.env.PLAYHT_USER_ID!,
      },
      body: formData,
    };

    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}: ${response.statusText}`);
    }

    const jsonResponse = await response.json();
    console.log(jsonResponse)
    return NextResponse.json(jsonResponse, { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
};
