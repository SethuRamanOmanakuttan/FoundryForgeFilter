import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { FaceMesh } from '@mediapipe/face_mesh';

// Face portion indices - including lips, nose, and part of cheeks
const FACE_PORTION_INDICES = [
  // Lips
  61, 185, 40, 39, 37, 0, 267, 269, 270, 409,
  61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88,
  78, 191, 80, 81, 82, 13, 312, 311, 310, 415,
  78, 95, 88, 178, 87, 14, 317, 402, 318, 324,
  // Nose
  168, 6, 197, 195, 5, 4, 1, 19, 94, 2, 164, 0, 11, 12, 13, 14, 15, 16, 17, 18, 200, 199, 175,
  // Lower face portion
  152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109
];

export default function LipOverlay({ baseImage }) {
  const webcamRef = useRef();
  const [facePortionImage, setFacePortionImage] = useState(null);
  const [faceMesh, setFaceMesh] = useState(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const requestRef = useRef();
  // Draggable state
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  // Position for the face image
  const [position, setPosition] = useState({ x: 0, y: 0 }); // Default position (centered)

  // For getting image size
  const imgRef = useRef();

  useEffect(() => {
    try {
      const faceMeshInstance = new FaceMesh({
        locateFile: (file) => {
          // Use a specific version to ensure compatibility
          return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh@0.4.1633559619/${file}`;
        },
      });
      
      faceMeshInstance.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      
      setFaceMesh(faceMeshInstance);
    } catch (error) {
      console.error('Error initializing FaceMesh:', error);
    }
  }, []);

  useEffect(() => {
    if (!faceMesh) return;
    let running = true;
    const process = async () => {
      if (!webcamRef.current || !webcamRef.current.video) {
        requestRef.current = requestAnimationFrame(process);
        return;
      }
      try {
        const video = webcamRef.current.video;
        if (video.readyState === 4) { // HAVE_ENOUGH_DATA
          await faceMesh.send({ image: video });
        }
      } catch (error) {
        console.error('Error processing video frame:', error);
      }
      if (running) requestRef.current = requestAnimationFrame(process);
    };
    faceMesh.onResults((results) => {
      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0 && results.image) {
        setFaceDetected(true);
        const landmarks = results.multiFaceLandmarks[0];
        
        // Get the actual image from results
        const image = results.image;
        const w = image.width;
        const h = image.height;
        
        // Create a canvas to capture the entire face image
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        
        // Draw the entire face image to the canvas
        ctx.drawImage(image, 0, 0, w, h);
        
        // Apply subtle enhancements to make the face look better
        ctx.filter = 'brightness(1.05) contrast(1.1) saturate(1.1)';
        ctx.drawImage(canvas, 0, 0);
        ctx.filter = 'none';
        
        // Convert the canvas to a data URL and set it as the face portion image
        setFacePortionImage(canvas.toDataURL('image/png'));
      } else {
        setFaceDetected(false);
        setFacePortionImage(null);
      }
    });
    requestRef.current = requestAnimationFrame(process);
    return () => {
      running = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [faceMesh]);

  // Drag handlers
  const onMouseDown = (e) => {
    if (!imgRef.current) return;
    setDragging(true);
    const imgRect = imgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - imgRect.left;
    const mouseY = e.clientY - imgRect.top;
    setDragOffset({ x: mouseX, y: mouseY });
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };
  const onMouseMove = (e) => {
    if (!dragging || !imgRef.current) return;
    const imgRect = imgRef.current.getBoundingClientRect();
    let x = ((e.clientX - imgRect.left) / imgRect.width) * 100;
    let y = ((e.clientY - imgRect.top) / imgRect.height) * 100;
    // Clamp
    x = Math.max(0, Math.min(100, x));
    y = Math.max(0, Math.min(100, y));
    setPos({ x, y });
  };
  const onMouseUp = () => {
    setDragging(false);
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
  };
  
  // Handle position changes
  const handlePositionChange = (axis, value) => {
    setPosition(prev => ({
      ...prev,
      [axis]: parseInt(value, 10)
    }));
  };

  if (!baseImage) return null;
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold mb-2">Lip Overlay</h2>
        <p className="text-sm text-gray-600">Position your face in the webcam</p>
      </div>
      
      <div className="flex flex-col items-center">
        <img 
          ref={imgRef} 
          src={baseImage} 
          alt="Base" 
          className="max-w-xs max-h-60 rounded-cartoon border-cartoon border-cartoonborder shadow-lg" 
        />
        
        {/* Webcam is hidden but running */}
        <div style={{ position: 'fixed', left: '-9999px', opacity: 0, pointerEvents: 'none' }}>
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/png"
            width={320}
            height={240}
            mirrored={true}
          />
        </div>
        
        {/* Face portion image displayed in a separate container below */}
        {facePortionImage && (
          <div className="mt-4 flex flex-col items-center">
            <div className="relative">
              <img
                src={facePortionImage}
                alt="Face Image"
                style={{
                  width: '200px',
                  height: '150px',
                  objectFit: 'cover',
                  borderRadius: '1.5rem',
                  transform: `translate(${position.x}px, ${position.y}px)`,
                }}
                className="border-2 border-gray-300 shadow-md"
              />
            </div>
          </div>
        )}
        
        {/* Position controls */}
        <div className="mt-4 flex flex-col items-center w-full max-w-xs gap-4">
          <div className="w-full grid grid-cols-2 gap-4">
            {/* Horizontal position */}
            <div>
              <label htmlFor="lip-x-position" className="text-sm font-medium text-gray-700 mb-1 block">
                Horizontal: {position.x}px
              </label>
              <input
                id="lip-x-position"
                type="range"
                min="-100"
                max="100"
                value={position.x}
                onChange={(e) => handlePositionChange('x', e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            
            {/* Vertical position */}
            <div>
              <label htmlFor="lip-y-position" className="text-sm font-medium text-gray-700 mb-1 block">
                Vertical: {position.y}px
              </label>
              <input
                id="lip-y-position"
                type="range"
                min="-100"
                max="100"
                value={position.y}
                onChange={(e) => handlePositionChange('y', e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Show message if no face detected */}
      {!faceDetected && <div className="text-red-400 font-cartoon mt-2">No face detected. Please center your face in the webcam.</div>}
    </div>
  );
} 