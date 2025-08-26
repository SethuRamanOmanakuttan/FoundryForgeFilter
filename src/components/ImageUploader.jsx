import React, { useRef } from 'react';

export default function ImageUploader({ image, setImage }) {
  const fileInput = useRef();
  const handleChange = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };
  return (
    <div className="flex flex-col items-center">
      <button
        className="bg-cartoonyellow text-cartoonbrown font-cartoon px-4 py-2 rounded-cartoon border-cartoon border-cartoonborder border-cartoon mb-2 shadow-lg"
        onClick={() => fileInput.current.click()}
      >
        Upload Image
      </button>
      <input
        type="file"
        accept="image/*"
        ref={fileInput}
        onChange={handleChange}
        className="hidden"
      />
      {image && (
        <img
          src={image}
          alt="Uploaded"
          className="max-w-xs max-h-80 rounded-cartoon border-cartoon border-cartoonborder shadow-lg mt-2"
        />
      )}
    </div>
  );
} 