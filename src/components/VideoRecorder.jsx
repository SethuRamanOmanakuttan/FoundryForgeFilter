import React, { useRef } from 'react';
import Webcam from 'react-webcam';

export default function VideoRecorder({ onCapture }) {
  const webcamRef = useRef();
  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    onCapture(imageSrc);
  };
  return (
    <div className="flex flex-col items-center">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/png"
        className="rounded-cartoon border-cartoon border-cartoonborder shadow-lg mb-2"
        width={240}
        height={180}
      />
      <button
        className="bg-cartoonyellow text-cartoonbrown font-cartoon px-4 py-2 rounded-cartoon border-cartoon border-cartoonborder border-cartoon shadow-lg"
        onClick={capture}
      >
        Capture Mouth
      </button>
    </div>
  );
} 