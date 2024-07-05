"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

type FormData = {
  audio: FileList;
  description: string;
  labels: string;
};
interface Voice {
  id: string;
  name: string;
  // Add other properties as needed
}

export default function Home() {
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [clonedVoiceId, setClonedVoiceId] = useState("");
  const [isGeneratingSpeech, setIsGeneratingSpeech] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit } = useForm<FormData>();
  const [voices, setVoices] = useState([]);
  const [error, setError] = useState("");
  const [isLoadingVoices, setIsLoadingVoices] = useState(true);
  useEffect(() => {
    const fetchVoices = async () => {
      try {
        const response = await fetch("/api/get-list");
        if (!response.ok) {
          throw new Error("Failed to fetch voices");
        }
        const data = await response.json();
        setVoices(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setIsLoadingVoices(false);
      }
    };

    fetchVoices();
  }, []);

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
  const deleteVoice = async (voiceId: string) => {
    try {
      const response = await fetch("/api/delete-voice", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ voice_id: voiceId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete voice");
      }

      const data = await response.json();
      console.log("Delete response:", data);

      // Remove the deleted voice from the state
      setVoices(voices.filter((voice: Voice) => voice.id !== voiceId));
    } catch (error) {
      console.error("Error deleting voice:", error);
      setError("Failed to delete voice");
    }
  };
  const refreshVoices = async () => {
    setIsLoadingVoices(true);
    setError("");
    try {
      const response = await fetch("/api/get-list");
      if (!response.ok) {
        throw new Error("Failed to fetch voices");
      }
      const data = await response.json();
      setVoices(data);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoadingVoices(false);
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
      <div>
        <div className="flex gap-4">

        <h1 className="text-2xl">Available Cloned Voices</h1>
        <button
          onClick={refreshVoices}
          className="bg-blue-500 text-white p-1 px-2 rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          aria-label="Refresh voice list"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        </div>

        {isLoadingVoices ? (
          <p>Loading voices...</p>
        ) : error ? (
          <p>Error: {error}</p>
        ) : voices.length === 0 ? (
          <p className="text-center">No voices found.</p>
        ) : (
          <ul className="flex flex-col gap-4 my-6">
            {voices.map((voice: Voice, index) => (
              <li key={voice.id} className="flex justify-between items-center">
                <span>
                  {index + 1}. {voice.name}
                </span>
                <button
                  onClick={() => deleteVoice(voice.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete Voice
                </button>
              </li>
            ))}
          </ul>
        )}
        <small>For now You can only use one clonned voice at a time </small>
      </div>{" "}
      {isLoading && (
        <div className="mb-4">
          <p>We are working on your voice it may take up to 1 min..</p>
        </div>
      )}
      {text && (
        <div className="mb-4 min-w-full">
          <h2 className="text-xl font-semibold mb-2">Transcribed Text</h2>
          <small>You Can edit text Genarate Colned voice audio </small>
          <div className="flex items-center my-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-64 p-2 border rounded text-black bg-gray-200"
              maxLength={500}
            />
            <span className="ml-2">{text.length}/5000</span>
          </div>
        </div>
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
        <div className="mt-4 flex justify-center flex-col gap-3">
          <h2 className="text-xl font-semibold mb-2 text-center my-4">
            Generated Audio
          </h2>
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
