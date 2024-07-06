// app/api/check-speech-status/route.ts

import { NextResponse } from "next/server";
import fetch from "node-fetch";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('taskId');

  if (!taskId) {
    return NextResponse.json({ error: "Missing taskId" }, { status: 400 });
  }

  try {
    const response = await fetch(`https://api.play.ht/api/v2/tts/${taskId}`, {
      headers: {
        AUTHORIZATION: process.env.PLAYHT_API_SECRET_KEY as string,
        "X-USER-ID": process.env.PLAYHT_USER_ID as string,
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("PlayHT API Error:", errorData);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorData}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in checking text-to-speech status:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "An unknown error occurred" },
      { status: 500 }
    );
  }
}