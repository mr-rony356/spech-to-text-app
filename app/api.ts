// api.ts

import axios from "axios";

const API_BASE_URL = "/api"; // Adjust this if your API base URL is different

interface ApiResponse<T> {
  data: T;
  status: number;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function transcribeAudio(audioUrl: string): Promise<string> {
  try {
    const response: ApiResponse<{ text: string }> = await api.post(
      "/speech-to-text",
      { audioUrl }
    );
    return response.data.text;
  } catch (error) {
    console.error("Error in transcribeAudio:", error);
    throw new Error("Failed to transcribe audio");
  }
}

// api.ts

// ... (previous code remains the same)

export async function cloneVoice(
  audioUrl: string,
  voiceName: string
): Promise<string> {
  try {
    const response: ApiResponse<{ id: string }> = await api.post(
      "/clone-voice",
      {
        audio_url: audioUrl,
        voice_name: voiceName,
      }
    );
    return response.data.id;
  } catch (error) {
    console.error("Error in cloneVoice:", error);
    throw new Error("Failed to clone voice");
  }
}

// ... (rest of the file remains the same)
export async function generateSpeech(
  voiceId: string,
  text: string
): Promise<string> {
  try {
    const response: ApiResponse<{ taskId: string }> = await api.post(
      "/initiate-text-to-speech",
      { voiceId, text }
    );
    return response.data.taskId;
  } catch (error) {
    console.error("Error in generateSpeech:", error);
    throw new Error("Failed to initiate speech generation");
  }
}

// api.ts

// ... (previous imports and setup)

interface TTSStatusResponse {
  id: string;
  status: string;
  output?: {
    url: string;
    duration: number;
    size: number;
  };
}

export async function pollTTSStatus(taskId: string): Promise<string> {
  const maxRetries = 120;
  const pollInterval = 3000; // 3 seconds

  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log("loading TTS status");
      const response: ApiResponse<TTSStatusResponse> = await api.get(
        `/check-tts-status?taskId=${taskId}`
      );

      if (response.data.status === "complete" && response.data.output?.url) {
        console.log("TTS generation complete. URL:", response.data.output.url);
        return response.data.output.url;
      }

      if (response.data.status === "error") {
        throw new Error("TTS generation failed");
      }

      console.log("TTS status:", response.data.status);
    } catch (error) {
      console.error("Error in pollTTSStatus:", error);
      throw error;
    }

    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }

  throw new Error("Timeout: Audio generation did not complete in time");
}
