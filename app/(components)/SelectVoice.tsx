import React, { useEffect, useState } from "react";
interface Voice {
  id: string;
  name: string;
  // Add other properties as needed
}

const SelectVoice: React.FC<{
  setClonedVoiceId: React.Dispatch<React.SetStateAction<string>>;
  setText: React.Dispatch<React.SetStateAction<string>>;
}> = ({ setClonedVoiceId, setText }) => {
  const [isLoadingVoices, setIsLoadingVoices] = useState(true);
  const [error, setError] = useState("");
  const [voices, setVoices] = useState<Voice[]>([]);

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
      setVoices(voices.filter((voice) => voice.id !== voiceId));
    } catch (error) {
      console.error("Error deleting voice:", error);
      setError("Failed to delete voice");
    }
  };
  const selectVoice = async (voiceId: string) => {
    setClonedVoiceId(voiceId);

    setText(`Hey its a cloned voice Please feel free to adjust the text`);
  };

  return (
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
          {voices.map((voice, index) => (
            <li
              key={voice.id}
              className="flex justify-between items-center space-x-2"
            >
              <span>
                {index + 1}. {voice.name}
              </span>
              <button
                onClick={() => selectVoice(voice.id)}
                className="bg-green-500 text-white px-2 py-1 rounded"
              >
                Select Voice
              </button>
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
    </div>
  );
};

export default SelectVoice;
