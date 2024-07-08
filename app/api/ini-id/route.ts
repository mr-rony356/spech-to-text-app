import { NextResponse } from "next/server";
import fetch from "node-fetch";

export async function POST(request: Request) {
  try {
    const { voiceId, text } = await request.json();

    if (!voiceId || !text) {
      return NextResponse.json(
        { error: "Missing voiceId or text" },
        { status: 400 }
      );
    }

    // Step 1: Initiate the TTS conversion
    const initResponse = await fetch("https://api.play.ht/api/v2/tts", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        AUTHORIZATION: process.env.PLAYHT_API_SECRET_KEY as string,
        "X-USER-ID": process.env.PLAYHT_USER_ID as string,
      },
      body: JSON.stringify({
        text: text,
        voice: voiceId,
        voice_engine: "PlayHT2.0",
        quality: "premium",
      }),
    });

    const initData = await initResponse.json();
    console.log("Play.ht API initial response:", initData);

    if (!initResponse.ok) {
      throw new Error(
        `HTTP error! status: ${initResponse.status}, message: ${JSON.stringify(initData)}`
      );
    }

    const taskId = initData.id;

    if (!taskId) {
      throw new Error("No task ID received from Play.ht API");
    }

    return NextResponse.json({ taskId });
  } catch (error) {
    console.error("Error in text-to-speech:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}
