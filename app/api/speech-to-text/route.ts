import { NextResponse } from "next/server";
import { SpeechClient } from "@google-cloud/speech";
import fs from "fs";
import path from "path";

let speechClient: SpeechClient;

try {
//   const credentialsEnv = process.env.GOOGLE_APPLICATION_CREDENTIALS || "{}";
//   console.log("Parsing credentials:", credentialsEnv);
//   const credentials = JSON.parse(credentialsEnv);
  speechClient = new SpeechClient({
      "type": "service_account",
      "project_id": "voice-app-428120",
      "private_key_id": "e35fd8d27c809abeef22696ce722d0a5c76aa55c",
      "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDPFzc+EEUezv+t\nTHqQGKzPWnXXSmzAu9so2JbPgycuJtLf8Cnnul+PRWwAWX5LO/r396QQJfxcjV+A\nE3XBN6uwlGGZpYONfb302FvoVzlZaRy7gL2IHLnt3A5coCDA4QPtmrNtdFm8lOP0\nLmIpyGW5KR8NSEc1h3BPgWB4r6zy+v8a/bGGVK+AqxfGrOs51wx9RoIjet+jtk+w\nez6NL/o6beujPMj7zcqgF1frpwjDZjnq7UCKANWjN9XvOz3PcBFNm20NRn7bTRnn\nGHW/rsvH9jKeZxZcR2mVMPM55HcZH0fK9zqGviUegCBLqPn9AGah1VRcz0rpxVCz\nylnEa6bVAgMBAAECggEABr69lUyqh6yb03KX1QeCDMCS8S0dejCUMed4uq+4UA6X\n1I8/ZNVjRT4bB1mNiBifHcJSimvGUA29vs+YyK84wnKuyXZEi5BSe9NWjlcq88XS\nl6vY4IJOWa2Ox9xiUg3yLA7GHypIkvXG2p5Dzb3BzG8HByPOcp348z9Q8QAIfM3P\ngmJMtHuLv0IVQ1UHMNx7picHPvKMYYmmka0DHg0qYZy8GFU/0hEGIhfxpxHh4tQR\n6kmY01HUKNKCUuGkZ+V/aJc9FQq/937X5+Uj/0nvzVc6p1cFSve60Z+hbkiQ3SmN\nprynRRrO7Kt5cDsOH8+OWjW9jym5j/rPpaLksgK04QKBgQD5/+6FkqLmmQ1v8Mn0\nQq76Y4R9Ckyt1J5j+NUEPGmv7cq6THo84hBrwOWp/oxZ76G9qloQFH36x7CCyPI3\n7Fx7f/QD8Dj56RVgn6A+J+kMU7XPnOSQNmZkckiJLiLN1vVieFt8SUKtBLUFNsHJ\nfJz5FmP4HzNbIP8BylFXguEm4QKBgQDUD6ON1ziWlna50zuzMD4BsahY30dwu1TK\n09VD2jCqfVrhVnBWRjE9HhaECgDLGviYeQpYjjfZ8y89J9QTuWmZIXooByfiAI/i\nSVpY+1UAxcUeoK+IHkK/mD7EYiBT+JYx19BSTWxvN/U1SB0lLyoSaop7uUrlp9lf\nMuKEZrsidQKBgQDP9G+BlreA4CGIUyB62ZlZ2LxVkuKz2mAiwtLW4jX7zO7Mx18L\nE/Ua3Ott27r9+NJuxayDIbilicQvFl493JQVexsMx59tatCIfl+6NFKsGVnsKBMM\nTuQfe90Ql1sGJGAcGAfpu7sF1xuJCcJrCwg8Pr7Ln5CFpk3ZPGUrSUhmoQKBgQCz\nKctbKTzMLa99bHQB/n5E3B6Jh4tKOVt4SeTjANMhF+vSej9LBN7Q7jzDrdfhwZXK\n7GjLTMzvPUDqAF5zk7EeCWS1sOYHUcY+vw6wIxg8INtb9xKWhEqMqUpOjUEW8O2k\nituczYERrktjitvk8KYxDQaXZYNb6KYEgm9SwaDViQKBgQC5Niuv4ns+0N6OKOE5\nnHFnzq2IlZxrzHRDGlcMsQpuuExvbcLmv1snVC0EwTBRf/6Gj3bnEyQ8Jfzhyma0\nM7kmoFDQvR5ck5WeG/n+xoL+5JiepS14ATV7Hzs7Xhs8V0c6WFAh5MaUra4REdF3\nKURnVIQjT9AYS4ckZ4zEZ8kJHw==\n-----END PRIVATE KEY-----\n",
      "client_email": "eric-voice-app@voice-app-428120.iam.gserviceaccount.com",
      "client_id": "108835723501365105968",
      "auth_uri": "https://accounts.google.com/o/oauth2/auth",
      "token_uri": "https://oauth2.googleapis.com/token",
      "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
      "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/eric-voice-app%40voice-app-428120.iam.gserviceaccount.com",
      "universe_domain": "googleapis.com"
      });
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
