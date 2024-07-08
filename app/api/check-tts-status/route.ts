import { NextRequest, NextResponse } from "next/server";
import fetch from "node-fetch";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json(
        { error: "Missing taskId" },
        { status: 400 }
      );
    }

    // Poll for the task status
    const statusResponse = await fetch(
      `https://api.play.ht/api/v2/tts/${taskId}?format=event-stream`,
      {
        method: "GET",
        headers: {
          AUTHORIZATION: process.env.PLAYHT_API_SECRET_KEY as string,
          "X-USER-ID": process.env.PLAYHT_USER_ID as string,
        },
      }
    );

    const statusData = await statusResponse.json();
    console.log("Play.ht API status response:", statusData);

    if (!statusResponse.ok) {
      throw new Error(
        `HTTP error! status: ${statusResponse.status}, message: ${JSON.stringify(statusData)}`
      );
    }

    return NextResponse.json(statusData);
  } catch (error) {
    console.error("Error checking status:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 }
    );
  }
}
