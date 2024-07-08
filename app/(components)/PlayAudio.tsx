import React from 'react'

interface PlayAudioProps {
  audioUrl: string;
}

const PlayAudio: React.FC<PlayAudioProps> = ({ audioUrl }) => {
  return (
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
)
}

export default PlayAudio