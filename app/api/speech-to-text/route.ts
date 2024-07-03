import { NextResponse } from "next/server";
import { SpeechClient } from "@google-cloud/speech";
import fs from "fs";
import path from "path";

let speechClient: SpeechClient;

try {
//   const credentialsEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS || "{}";
//   console.log("Parsing credentials:", credentialsEnv);
//   const credentials = JSON.parse(credentialsEnv);
  speechClient = new SpeechClient();
} catch (error) {
  console.error("Error initializing Speech-to-Text client:", error);
}

export async function POST(request: Request) {
  if (!speechClient) {
    return NextResponse.json(
      { error: "Speech-to-Text client not initialized" },
      { status: 500 }
    );
  }

  try {
    const data = await request.json();
    console.log("Received data:", data);
    const { filename } = data;

    if (!filename) {
      return NextResponse.json(
        { error: "Filename is required" },
        { status: 400 }
      );
    }

    // Read the audio file
    const filePath = path.join(process.cwd(), "public", "uploads", filename);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const file = fs.readFileSync(filePath);
    const audioBytes = file.toString("base64");

    // Configure the request
    const audio = {
      content: audioBytes,
    };
    const config = {
    encoding: "MP3" as const, // Specify MP3 encoding
      sampleRateHertz: 16000,
      languageCode: "en-US",
      enableWordTimeOffsets: false
    };
    const speechRequest = {
      audio: audio,
      config: config,
    };

    // Perform the speech recognition
    const [response] = await speechClient.recognize(speechRequest);
    const transcription =
      response.results
        ?.map((result) => result.alternatives?.[0]?.transcript ?? "")
        .join("\n") ?? "";
console.log("Transcription:", transcription);
    return NextResponse.json({ text: transcription });
  } catch (error) {
    console.error("Error in speech-to-text:", error);
    return NextResponse.json(
      { error: "Error converting speech to text" },
      { status: 500 }
    );
  }
}
