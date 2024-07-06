import { NextResponse } from "next/server";
import fetch from "node-fetch";

export async function POST(request: Request) {
  try {
    const { requestId } = await request.json();
    
    const statusResponse = await fetch(`https://api.play.ht/api/v2/tts/status/${requestId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        AUTHORIZATION: process.env.PLAYHT_API_SECRET_KEY as string,
        "X-USER-ID": process.env.PLAYHT_USER_ID as string,
      },
    });

    if (!statusResponse.ok) {
      const errorData = await statusResponse.text();
      throw new Error(`HTTP error! status: ${statusResponse.status}, message: ${errorData}`);
    }

    const statusData = await statusResponse.json();

    if (statusData.status === "completed" && statusData.url) {
      return NextResponse.json({ audioUrl: statusData.url });
    } else if (statusData.status === "failed") {
      throw new Error("TTS processing failed");
    } else {
      // Return status data to the client, they can keep polling if necessary
      return NextResponse.json({ status: statusData.status });
    }

  } catch (error:any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
