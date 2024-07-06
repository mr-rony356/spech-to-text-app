import { NextResponse } from "next/server";
import fetch from "node-fetch";
import { Readable } from "stream";

export async function POST(request: Request) {
  try {
    const { voiceId, text } = await request.json();

    if (!voiceId || !text) {
      console.error("Missing voiceId or text");
      return NextResponse.json(
        { error: "Missing voiceId or text" },
        { status: 400 }
      );
    }

    const response = await fetch("https://api.play.ht/api/v2/tts", {
      method: "POST",
      headers: {
        accept: "text/event-stream",
        "content-type": "application/json",
        AUTHORIZATION: process.env.PLAYHT_API_SECRET_KEY as string,
        "X-USER-ID": process.env.PLAYHT_USER_ID as string,
      },
      body: JSON.stringify({
        text: text,
        voice: voiceId,
        voice_engine: 'PlayHT2.0',
        quality: 'premium',
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("PlayHT API Error:", errorData);
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorData}`
      );
    }

    const body = response.body as unknown as Readable;
    let currentEvent = "";
    let currentData = "";

    for await (const chunk of body) {
      const lines = chunk.toString().split("\n");
      for (const line of lines) {
        if (line.startsWith("event:")) {
          currentEvent = line.slice(7).trim();
        } else if (line.startsWith("data:")) {
          currentData = line.slice(5).trim();

          if (currentEvent === "completed" && currentData) {
            try {
              const parsedData = JSON.parse(currentData);
              if (parsedData.url) {
                return NextResponse.json({ audioUrl: parsedData.url });
              }
            } catch (parseError) {
              console.error("Error parsing JSON:", parseError);
            }
          }
        }

        // Reset for the next event
        if (line.trim() === "") {
          currentEvent = "";
          currentData = "";
        }
      }
    }

    throw new Error("No completed event with valid URL received");
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
