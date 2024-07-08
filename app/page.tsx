"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import SelectVoice from "./(components)/SelectVoice";
import PlayAudio from "./(components)/PlayAudio";
import TranscribedText from "./(components)/TranscribedText";

type FormData = {
  audio: FileList;
  description: string;
  labels: string;
};

export default function Home() {
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [clonedVoiceId, setClonedVoiceId] = useState("");
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit } = useForm<FormData>();
  const onUpload = async (data: FormData) => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", data.audio[0]);
    formData.append("description", data.description);
    formData.append("labels", data.labels);

    try {
      console.log("Uploading audio...");

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Upload failed: ${uploadResponse.statusText}`);
      }

      const uploadResult = await uploadResponse.json();

      if (uploadResult.success) {
        console.log("Audio upload successful:", uploadResult.filename);

        const payload = {
          audioUrl: uploadResult.audio_url,
        };
        console.log("Sending JSON to speech-to-text:", payload);

        const sttResponse = await fetch("/api/speech-to-text", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!sttResponse.ok) {
          throw new Error(`Speech-to-text failed: ${sttResponse.statusText}`);
        }

        const sttResult = await sttResponse.json();

        setText(sttResult.text);
        console.log("Transcribed text:", sttResult.text);

        // Clone the voice
        const cloneResponse = await fetch("/api/clone-voice", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ audio_url: uploadResult.audio_url }),
        });

        if (!cloneResponse.ok) {
          throw new Error(`Voice cloning failed: ${cloneResponse.statusText}`);
        }

        const cloneResult = await cloneResponse.json();
        setClonedVoiceId(cloneResult.id);
        console.log("Voice cloned, ID:", cloneResult.id);
      }
    } catch (error) {
      console.error("Error processing audio:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
    }
  };

  const pollTTSStatus = async (taskId: string) => {
    try {
      let retries = 0;
      const pollInterval = 4000; // 4 seconds
      const maxRetries = 120; // 8 minutes

      while (retries < maxRetries) {
        const response = await fetch(`/api/check-tts-status?taskId=${taskId}`);
        const statusData = await response.json();

        if (statusData.status === "complete" && statusData.output && statusData.output.url) {
          return statusData.output.url;
        }

        retries += 1;
        await new Promise((resolve) => setTimeout(resolve, pollInterval));
      }

      throw new Error("Timeout: Audio generation did not complete in time");
    } catch (error) {
      console.error("Error in polling TTS status:", error);
      throw error;
    }
  };

  const onGenerateSpeech = async () => {
    setIsGeneratingSpeech(true);
    try {
      const response = await fetch("/api/initiate-text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          voiceId: clonedVoiceId,
          text: text,
        }),
      });

      if (!response.ok) {
        throw new Error(`Speech generation failed: ${response.statusText}`);
      }

      const { taskId } = await response.json();
      console.log("TTS task initiated, taskId:", taskId);

      const audioUrl = await pollTTSStatus(taskId);
      setAudioUrl(audioUrl);
    } catch (error) {
      console.error("Error generating speech:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsGeneratingSpeech(false);
    }
  };



  return (
    <div className="container mx-auto p-4 flex flex-col items-center gap-6 w-full">
      <h1 className="text-4xl font-bold mb-4 text-center my-8">
        AI Voice Cloning App
      </h1>
      <form onSubmit={handleSubmit(onUpload)} className="mb-4 space-x-4">
        <input
          type="file"
          accept="audio/*"
          {...register("audio", { required: true })}
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50 disabled:bg-gray-500"
          disabled={clonedVoiceId !== ""}
        >
          {clonedVoiceId !== ""
            ? "Audio Uploaded & Voice Cloned"
            : "Upload Audio & Clone Voice"}
        </button>
      </form>
      <SelectVoice/>
      {isLoading && (
        <div className="mb-4">
          <p>We are working on your voice it may take up to 1 min..</p>
        </div>
      )}
      {text && (
        <TranscribedText text={text}  setText={setText} />
      )}
      <button
        onClick={onGenerateSpeech}
        className={`bg-green-500 text-white px-4 py-2 rounded ${
          clonedVoiceId ? "" : "hidden"
        }`}
        disabled={isGeneratingSpeech}
      >
        {isGeneratingSpeech ? "Generating Speech..." : "Generate Speech"}
      </button>
      {audioUrl && (
        <PlayAudio audioUrl={audioUrl} />
      )}
    </div>
  );
}
