import { NextResponse } from "next/server";
import { SpeechClient } from "@google-cloud/speech";
import { Storage } from "@google-cloud/storage";
import fs from "fs";
import path from "path";

let speechClient: SpeechClient;
let storage: Storage;

try {
  speechClient = new SpeechClient({
    keyFilename: 'google-credentials.json',
  });
  storage = new Storage({
    keyFilename: 'google-credentials.json',
  });
} catch (error) {
  console.error("Error initializing Google Cloud clients:", error);
}

const bucketName = 'rony-bucket'; // Replace with your GCS bucket name

export async function POST(request: Request) {
  if (!speechClient || !storage) {
    return NextResponse.json(
      { error: "Google Cloud clients not initialized" },
      { status: 500 }
    );
  }

  try {
    const data = await request.json() as { filename?: string };
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

    // Upload file to Google Cloud Storage
    const bucket = storage.bucket(bucketName);
    const gcsFileName = `audio-${Date.now()}-${filename}`;
    await bucket.upload(filePath, {
      destination: gcsFileName,
    });

    const gcsUri = `gs://${bucketName}/${gcsFileName}`;

    // Configure the request
    const audio = {
      uri: gcsUri,
    };
    const config = {
      encoding: "MP3" as const,
      sampleRateHertz: 16000,
      languageCode: "en-US",
      enableWordTimeOffsets: false
    };
    const speechRequest = {
      audio: audio,
      config: config,
    };

    // Starts a long running recognition operation
    const [operation] = await speechClient.longRunningRecognize(speechRequest);

    // Wait for the operation to complete
    const [response] = await operation.promise();

    // Extract the transcription
    const transcription = response.results
      ?.map((result) => result.alternatives?.[0]?.transcript ?? "")
      .join("\n") ?? "";

    console.log("Transcription:", transcription);

    // Delete the file from GCS after transcription
    await bucket.file(gcsFileName).delete();

    return NextResponse.json({ text: transcription });
  } catch (error) {
    console.error("Error in speech-to-text:", error);
    return NextResponse.json(
      { error: "Error converting speech to text" },
      { status: 500 }
    );
  }
}