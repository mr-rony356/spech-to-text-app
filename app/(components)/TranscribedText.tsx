import React from 'react'
interface TranscribedTextProps {
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
}
const TranscribedText:React.FC<TranscribedTextProps> = ({ text, setText }) => {
  return (
    <div className="mb-4 min-w-full">
    <h2 className="text-xl font-semibold mb-2">Transcribed Text</h2>
    <small>You Can edit text Generate Cloned voice audio </small>
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
)
}

export default TranscribedText