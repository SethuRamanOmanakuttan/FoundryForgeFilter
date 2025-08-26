import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { FaceMesh } from '@mediapipe/face_mesh';

// Face mesh indices for the entire face outline - using more precise contour points
// These indices are based on the MediaPipe Face Mesh model
// Reference: https://github.com/google/mediapipe/blob/master/mediapipe/modules/face_geometry/data/canonical_face_model_uv_visualization.png

// Face contour indices - precise outline of the face
const FACE_CONTOUR = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109
];

// Left eye contour
const LEFT_EYE = [
  33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246
];

// Right eye contour
const RIGHT_EYE = [
  362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398
];

// Left eyebrow
const LEFT_EYEBROW = [
  70, 63, 105, 66, 107, 55, 65, 52, 53, 46
];

// Right eyebrow
const RIGHT_EYEBROW = [
  300, 293, 334, 296, 336, 285, 295, 282, 283, 276
];

// Nose contour
const NOSE = [
  168, 6, 197, 195, 5, 4, 1, 19, 94, 2, 164, 0, 11, 12, 13, 14, 15, 16, 17, 18, 200, 199, 175
];

// Lips contour
const LIPS = [
  // Upper outer lip
  61, 185, 40, 39, 37, 0, 267, 269, 270, 409,
  // Lower outer lip
  61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 308, 324, 318, 402, 317, 14, 87, 178, 88,
  // Upper inner lip
  78, 191, 80, 81, 82, 13, 312, 311, 310, 415,
  // Lower inner lip
  78, 95, 88, 178, 87, 14, 317, 402, 318, 324
];

// Combine all facial feature indices
const FACE_OUTLINE_INDICES = [
  ...FACE_CONTOUR,
  ...LEFT_EYE,
  ...RIGHT_EYE,
  ...LEFT_EYEBROW,
  ...RIGHT_EYEBROW,
  ...NOSE,
  ...LIPS
];

// Helper function to draw facial features as outlines
function drawFacialFeature(ctx, landmarks, indices, videoWidth, videoHeight, cropX, cropY, cropW, cropH, canvasWidth, canvasHeight) {
  if (indices.length === 0) return;
  
  ctx.beginPath();
  
  // Map the first point
  const firstIndex = indices[0];
  const firstPoint = landmarks[firstIndex];
  
  // Convert normalized coordinates to pixel values in the original video
  let x = firstPoint.x * videoWidth;
  let y = firstPoint.y * videoHeight;
  
  // Adjust for cropping
  x = ((x - cropX) / cropW) * canvasWidth;
  y = ((y - cropY) / cropH) * canvasHeight;
  
  ctx.moveTo(x, y);
  
  // Draw lines to each subsequent point
  for (let i = 1; i < indices.length; i++) {
    const index = indices[i];
    const point = landmarks[index];
    
    // Convert normalized coordinates to pixel values
    x = point.x * videoWidth;
    y = point.y * videoHeight;
    
    // Adjust for cropping
    x = ((x - cropX) / cropW) * canvasWidth;
    y = ((y - cropY) / cropH) * canvasHeight;
    
    ctx.lineTo(x, y);
  }
  
  // Close the path back to the first point
  ctx.closePath();
  ctx.stroke();
}

export default function FaceOverlay({ baseImage }) {
  const webcamRef = useRef();
  const [faceImage, setFaceImage] = useState(null);
  const [faceMesh, setFaceMesh] = useState(null);
  const [faceDetected, setFaceDetected] = useState(false);
  const requestRef = useRef();
  // Draggable state
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  // Position for the face image
  const [position, setPosition] = useState({ x: 0, y: 0 }); // Default position (centered)
  // Scale for the face overlay
  const [scale, setScale] = useState(1);
  // Green area detection
  const [greenAreaDetected, setGreenAreaDetected] = useState(false);
  
  // For getting image size
  const imgRef = useRef();
  // Canvas for analyzing the image
  const canvasRef = useRef();

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

  // Effect to detect green area in the base image
  useEffect(() => {
    if (!baseImage) return;
    
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      // Create canvas to analyze image
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      // Analyze the image to find green area
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      let greenPixels = [];
      // Look for green pixels (where green channel is significantly higher than red and blue)
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const index = (y * canvas.width + x) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          
          // Detect green area (green is dominant)
          if (g > 100 && g > r * 1.5 && g > b * 1.5) {
            greenPixels.push({ x, y });
          }
        }
      }
      
      // If green pixels found, calculate center position
      if (greenPixels.length > 0) {
        setGreenAreaDetected(true);
        
        // Calculate average position of green pixels
        const avgX = greenPixels.reduce((sum, pixel) => sum + pixel.x, 0) / greenPixels.length;
        const avgY = greenPixels.reduce((sum, pixel) => sum + pixel.y, 0) / greenPixels.length;
        
        // Convert to percentage of image dimensions
        const posX = (avgX / canvas.width) * 100;
        const posY = (avgY / canvas.height) * 100;
        
        // Update position
        setPos({ x: posX, y: posY });
        
        // Calculate appropriate scale based on green area size
        const minX = Math.min(...greenPixels.map(p => p.x));
        const maxX = Math.max(...greenPixels.map(p => p.x));
        const minY = Math.min(...greenPixels.map(p => p.y));
        const maxY = Math.max(...greenPixels.map(p => p.y));
        
        const greenWidth = maxX - minX;
        const greenHeight = maxY - minY;
        
        // Calculate scale based on green area dimensions and face overlay size
        const widthScale = greenWidth / 180; // 180px is our face width
        const heightScale = greenHeight / 200; // 200px is our face height
        
        // Use the smaller scale to ensure face fits within green area
        const newScale = Math.min(widthScale, heightScale) * 0.9; // 90% to ensure it fits nicely
        setScale(Math.max(0.5, Math.min(newScale, 2.0))); // Clamp between 0.5 and 2.0
      }
    };
    img.src = baseImage;
  }, [baseImage]);

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
        
        // Get coordinates for the entire face
        const xs = FACE_OUTLINE_INDICES.map(i => landmarks[i].x);
        const ys = FACE_OUTLINE_INDICES.map(i => landmarks[i].y);
        
        // Calculate bounding box
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);
        
        // Get the actual image from results
        const image = results.image;
        const w = image.width;
        const h = image.height;
        
        // Add padding around the face for a better crop
        const paddingX = 0.08; // 8% padding horizontally
        const paddingYTop = 0.1; // 10% padding on top
        const paddingYBottom = 0.05; // 5% padding on bottom
        
        // Calculate crop dimensions with padding
        const cropX = Math.max(0, (minX - paddingX) * w);
        const cropY = Math.max(0, (minY - paddingYTop) * h);
        const cropW = Math.min(w - cropX, ((maxX - minX) + 2 * paddingX) * w);
        const cropH = Math.min(h - cropY, ((maxY - minY) + paddingYTop + paddingYBottom) * h);
        
        // Fixed dimensions for the face image
        const FIXED_WIDTH = 180;
        const FIXED_HEIGHT = 200;
        
        // Create a canvas for the traced face
        const faceCanvas = document.createElement('canvas');
        faceCanvas.width = FIXED_WIDTH;
        faceCanvas.height = FIXED_HEIGHT;
        const faceCtx = faceCanvas.getContext('2d');
        
        // First draw the cropped face onto the canvas
        faceCtx.drawImage(
          image,
          cropX, cropY, cropW, cropH,
          0, 0, FIXED_WIDTH, FIXED_HEIGHT
        );
        
        // Apply subtle enhancements
        faceCtx.filter = 'brightness(1.05) contrast(1.1) saturate(1.1)';
        faceCtx.drawImage(faceCanvas, 0, 0);
        faceCtx.filter = 'none';
        
        // Create a path for clipping - using face contour
        faceCtx.save();
        faceCtx.beginPath();
        
        // Map the first point of face contour
        const firstIndex = FACE_CONTOUR[0];
        const firstPoint = landmarks[firstIndex];
        let x = ((firstPoint.x * w) - cropX) / cropW * FIXED_WIDTH;
        let y = ((firstPoint.y * h) - cropY) / cropH * FIXED_HEIGHT;
        faceCtx.moveTo(x, y);
        
        // Draw the face contour path
        for (let i = 1; i < FACE_CONTOUR.length; i++) {
          const index = FACE_CONTOUR[i];
          const point = landmarks[index];
          x = ((point.x * w) - cropX) / cropW * FIXED_WIDTH;
          y = ((point.y * h) - cropY) / cropH * FIXED_HEIGHT;
          faceCtx.lineTo(x, y);
        }
        
        // Close the path
        faceCtx.closePath();
        
        // Create a new canvas for the final traced face
        const tracedCanvas = document.createElement('canvas');
        tracedCanvas.width = FIXED_WIDTH;
        tracedCanvas.height = FIXED_HEIGHT;
        const tracedCtx = tracedCanvas.getContext('2d');
        
        // Clear the traced canvas
        tracedCtx.clearRect(0, 0, FIXED_WIDTH, FIXED_HEIGHT);
        
        // Clip to the face path and draw the face
        tracedCtx.save();
        tracedCtx.beginPath();
        
        // Redraw the face contour path on the traced canvas
        const firstPoint2 = landmarks[firstIndex];
        x = ((firstPoint2.x * w) - cropX) / cropW * FIXED_WIDTH;
        y = ((firstPoint2.y * h) - cropY) / cropH * FIXED_HEIGHT;
        tracedCtx.moveTo(x, y);
        
        for (let i = 1; i < FACE_CONTOUR.length; i++) {
          const index = FACE_CONTOUR[i];
          const point = landmarks[index];
          x = ((point.x * w) - cropX) / cropW * FIXED_WIDTH;
          y = ((point.y * h) - cropY) / cropH * FIXED_HEIGHT;
          tracedCtx.lineTo(x, y);
        }
        
        tracedCtx.closePath();
        tracedCtx.clip();
        
        // Draw the clean face image onto the clipped area
        tracedCtx.drawImage(faceCanvas, 0, 0);
        
        // Restore the context state
        tracedCtx.restore();
        
        // Use the traced canvas as our final image
        setFaceImage(tracedCanvas.toDataURL('image/png'));
      } else {
        setFaceDetected(false);
        setFaceImage(null);
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

  // Handle scale change
  const handleScaleChange = (e) => {
    setScale(parseFloat(e.target.value));
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
        <h2 className="text-xl font-bold mb-2">Face Overlay</h2>
        <p className="text-sm text-gray-600">Position your face in the webcam</p>
      </div>
      
      <div className="flex flex-col items-center">
        <img 
          ref={imgRef} 
          src={baseImage} 
          alt="Base" 
          className="max-w-xs max-h-80 rounded-cartoon border-cartoon border-cartoonborder shadow-lg" 
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
        
        {/* Face image displayed in a separate container below */}
        {faceImage && (
          <div className="mt-4 flex flex-col items-center">
            <div className="relative">
              <img
                src={faceImage}
                alt="Face"
                style={{
                  width: `${180 * scale}px`,
                  height: `${200 * scale}px`,
                  objectFit: 'contain',
                  borderRadius: '8px',
                  transform: `translate(${position.x}px, ${position.y}px)`,
                }}
                className="border-2 border-gray-300 shadow-md"
              />
            </div>
          </div>
        )}
        
        {/* Controls for face size and position */}
        <div className="mt-4 flex flex-col items-center w-full max-w-xs gap-4">
          {/* Scale control */}
          <div className="w-full">
            <label htmlFor="scale-slider" className="text-sm font-medium text-gray-700 mb-1 block">
              Face Size: {scale.toFixed(1)}x
            </label>
            <input
              id="scale-slider"
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={scale}
              onChange={handleScaleChange}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          {/* Position controls */}
          <div className="w-full grid grid-cols-2 gap-4">
            {/* Horizontal position */}
            <div>
              <label htmlFor="x-position" className="text-sm font-medium text-gray-700 mb-1 block">
                Horizontal: {position.x}px
              </label>
              <input
                id="x-position"
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
              <label htmlFor="y-position" className="text-sm font-medium text-gray-700 mb-1 block">
                Vertical: {position.y}px
              </label>
              <input
                id="y-position"
                type="range"
                min="-100"
                max="100"
                value={position.y}
                onChange={(e) => handlePositionChange('y', e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
          
          {greenAreaDetected && (
            <p className="text-xs text-green-600 mt-1">✓ Green area detected</p>
          )}
        </div>
      </div>
      
      {/* Show message if no face detected */}
      {!faceDetected && <div className="text-red-400 font-cartoon mt-2">No face detected. Please center your face in the webcam.</div>}
    </div>
  );
}
