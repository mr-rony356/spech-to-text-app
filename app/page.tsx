"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

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
          filename: uploadResult.filename,
        };
        console.log("Sending JSON to speech-to-text:", payload);

        const sttResponse = await fetch("/api/openai", {
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
          body: JSON.stringify({ filename: uploadResult.filename }),
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

  const onGenerateSpeech = async () => {
    setIsGeneratingSpeech(true);
    try {
      const response = await fetch("/api/generate-speech", {
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

      const data = await response.json();
      if (data.audioUrl) {
        setAudioUrl(data.audioUrl);
      } else {
        throw new Error("No audio URL received from the server");
      }
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
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={clonedVoiceId !== ""}
        >
          {clonedVoiceId !== ""
            ? "Audio Uploaded & Voice Cloned"
            : "Upload Audio & Clone Voice"}
        </button>
      </form>

      {isLoading && (
        <div className="mb-4">
          <p>We are working on your voice it may take up to 1 min..</p>
        </div>
      )}
{text &&
        <div className="mb-4 min-w-full">
        <h2 className="text-xl font-semibold mb-2">Transcribed Text :</h2>
        <small>You Can edit text Genarate Conned voice audio </small>
        <div className="flex items-center">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-96 p-2 border rounded text-black bg-gray-200"
            maxLength={500}
          />
          <span className="ml-2">{text.length}/5000</span>
        </div>
      </div>

}

      <button
        onClick={onGenerateSpeech}
        className={`bg-green-500 text-white px-4 py-2 rounded ${clonedVoiceId ? "" : "hidden"}`}
        disabled={isGeneratingSpeech}
      >
        {isGeneratingSpeech ? "Generating Speech..." : "Generate Speech"}
      </button>

      {audioUrl && (
        <div className="mt-4 flex justify-center flex-col gap-3">
          <h2 className="text-xl font-semibold mb-2 text-center my-4">Generated Audio</h2>
          <audio controls src={audioUrl} />
          <button
            className="bg-green-500 text-white px-4 py-2 rounded mt-2 "
            onClick={() => {
              const a = document.createElement("a");
              a.href = audioUrl;
              a.download = "generated-audio.mp3";
              a.click();
            }}
          >
            Download Audio
          </button>
        </div>
      )}
    </div>
  );
}
