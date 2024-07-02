'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function Home() {
  const [text, setText] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const { register, handleSubmit } = useForm();

  const onUpload = async (data:any) => {
    const formData = new FormData();
    formData.append('file', data.audio[0]);

    try {
      // Displaying loading state while uploading
      console.log('Uploading audio...');
      
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadResult = await uploadResponse.json();

      if (uploadResult.success) {
        // Feedback that the upload was successful
        console.log('Audio upload successful:', uploadResult.filename);

        // Prepare the JSON payload
        const payload = { filename: uploadResult.filename };

        // Log the JSON payload
        console.log('Sending JSON to speech-to-text:', payload);

        // Call the speech-to-text API
        const sttResponse = await fetch('/api/speech-to-text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const sttResult = await sttResponse.json();

        setText(sttResult.text);
        console.log('Transcribed text:', sttResult.text);
      }
    } catch (error) {
      console.error('Error processing audio:', error);
    }
  };

  const onGenerateSpeech = async () => {
    // Placeholder for text-to-speech API integration
    // For now, let's set a dummy audio URL
    setAudioUrl('/dummy-audio.wav');
  };

  return (
    <div className="container mx-auto p-4 flex flex-col items-center gap-6 w-full">
      <h1 className="text-4xl font-bold mb-4 text-center my-8">Ai Voice Cloning App</h1>

      <form onSubmit={handleSubmit(onUpload)} className="mb-4">
        <input type="file" accept="audio/*" {...register('audio')} />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
          disabled={text.length > 0} // Disable upload button if text is already transcribed
        >
          {text.length > 0 ? 'Audio Uploaded' : 'Upload Audio'}
        </button>
      </form>

      {text && (
        <div className="mb-4 min-w-full">
          <h2 className="text-xl font-semibold mb-2">Transcribed Text:</h2>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-96 p-2 border rounded text-black bg-gray-200"
          />
        </div>
      )}

      <button
        onClick={onGenerateSpeech}
        className={`bg-green-500 text-white px-4 py-2 rounded ${text ? '' : 'hidden'}`}
      >
        Generate Speech
      </button>

      {audioUrl && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Generated Audio:</h2>
          <audio controls src={audioUrl} />
        </div>
      )}
      <small>Created by Omor faruk Rony</small>
    </div>
  );
}
