"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import SelectVoice from "./(components)/SelectVoice";
import PlayAudio from "./(components)/PlayAudio";
import TranscribedText from "./(components)/TranscribedText";
import {
  cloneVoice,
  transcribeAudio,
  generateSpeech,
  pollTTSStatus,
} from "./api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
interface FormData {
  audio: FileList;
  description: string;
  labels: string;
  voiceName: string; // New field for voice name
}
export default function Home() {
  const [text, setText] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [clonedVoiceId, setClonedVoiceId] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { isValid },
  } = useForm<FormData>();

  const onUpload: SubmitHandler<FormData> = async (data) => {
    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append("file", data.audio[0]);
      formData.append("description", data.description);
      formData.append("labels", data.labels);
      formData.append("voiceName", data.voiceName); // Add voice name to formData

      const uploadResult = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!uploadResult.ok) throw new Error("Upload failed");

      const { audio_url, filename } = await uploadResult.json();
      console.log("Audio uploaded successfully:", filename);

      const transcribedText = await transcribeAudio(audio_url);
      setText(transcribedText);

      const voiceId = await cloneVoice(audio_url, data.voiceName);
      setClonedVoiceId(voiceId);

      toast.success(`Voice "${data.voiceName}" cloned successfully!`);
    } catch (error) {
      console.error("Error processing audio:", error);
      toast.error("Failed to process audio. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  // Home.tsx

  const onGenerateSpeech = async () => {
    setAudioUrl("");
    setIsProcessing(true);

    try {
      const taskId = await generateSpeech(clonedVoiceId, text);
      const audioUrl = await pollTTSStatus(taskId);
      setAudioUrl(audioUrl);
      toast.success("Speech generated successfully!");
    } catch (error) {
      console.error("Error generating speech:", error);
      toast.error("Failed to generate speech. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };
  return (
    <div className="container mx-auto p-4 flex flex-col items-center gap-6 w-full">
      <h1 className="text-4xl font-bold mb-4 text-center my-8">
        AI Voice Cloning App
      </h1>
      <div className="flex flex-col items-center gap-20 md:flex-row">
        <form onSubmit={handleSubmit(onUpload)} className="mb-4 space-y-4">
          <div>
            <label htmlFor="voiceName" className="block mb-2 ">
              Voice Name:
            </label>
            <input
              id="voiceName"
              type="text"
              {...register("voiceName", { required: true })}
              className="w-48 px-3 py-2 border rounded text-black"
              placeholder="name for your voice"
            />
          </div>
          <div>
            <input
              type="file"
              accept="audio/*"
              {...register("audio", { required: true })}
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Upload & Clone Voice
          </button>
        </form>
        <SelectVoice setClonedVoiceId={setClonedVoiceId} setText={setText} />
      </div>
      {isProcessing && <p>Processing... This may take up to a minute.</p>}
      {text && <TranscribedText text={text} setText={setText} />}
      <button
        onClick={onGenerateSpeech}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={!clonedVoiceId || isProcessing}
      >
        Generate Speech
      </button>

      {audioUrl && (
        <div className="flex flex-col items-center gap-20 md:flex-row my-12">
          <PlayAudio audioUrl={audioUrl} />
        </div>
      )}
        <ToastContainer position="bottom-right" autoClose={5000} />
    </div>
  );
}
