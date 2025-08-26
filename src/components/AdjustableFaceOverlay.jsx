import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import html2canvas from 'html2canvas';

export default function AdjustableFaceOverlay() {
  const webcamRef = useRef(null);
  const containerRef = useRef(null);
  
  // State for position and scale of the webcam feed
  const [position, setPosition] = useState({ x: 50, y: 50 }); // Center position (in percentage)
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Handle mouse down for dragging
  const handleMouseDown = (e) => {
    if (!containerRef.current) return;
    
    setDragging(true);
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - containerRect.left;
    const y = e.clientY - containerRect.top;
    
    setDragStart({ x, y });
  };
  
  // Handle mouse move for dragging
  const handleMouseMove = (e) => {
    if (!dragging || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
    
    const x = e.clientX - containerRect.left;
    const y = e.clientY - containerRect.top;
    
    const deltaX = x - dragStart.x;
    const deltaY = y - dragStart.y;
    
    // Update position in percentage terms
    setPosition(prev => ({
      x: Math.max(0, Math.min(100, prev.x + (deltaX / containerWidth) * 100)),
      y: Math.max(0, Math.min(100, prev.y + (deltaY / containerHeight) * 100))
    }));
    
    setDragStart({ x, y });
  };
  
  // Handle mouse up to end dragging
  const handleMouseUp = () => {
    setDragging(false);
  };
  
  // Handle scale change
  const handleScaleChange = (e) => {
    setScale(parseFloat(e.target.value));
  };
  
  // Add and remove event listeners
  useEffect(() => {
    if (dragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, dragStart]);
  
  // Handle taking a screenshot with overlay
  const handleScreenshot = () => {
    if (containerRef.current && webcamRef.current) {
      // First get the webcam image
      const webcamImage = webcamRef.current.getScreenshot();
      
      // Create a new canvas with the same dimensions as the container
      const canvas = document.createElement('canvas');
      const containerWidth = containerRef.current.offsetWidth;
      const containerHeight = containerRef.current.offsetHeight;
      canvas.width = containerWidth;
      canvas.height = containerHeight;
      
      // Get the 2D context of the canvas
      const ctx = canvas.getContext('2d');
      
      // Create a new image for the webcam screenshot
      const webcamImg = new Image();
      webcamImg.onload = () => {
        // Calculate the position and scale for the webcam image
        const scaledWidth = containerWidth * scale;
        const scaledHeight = containerHeight * scale;
        const x = (containerWidth * position.x / 100) - (scaledWidth / 2);
        const y = (containerHeight * position.y / 100) - (scaledHeight / 2);
        
        // Draw the webcam image with the correct position and scale
        ctx.drawImage(webcamImg, x, y, scaledWidth, scaledHeight);
        
        // Create a new image for the overlay
        const overlayImg = new Image();
        overlayImg.onload = () => {
          // Draw the overlay image on top
          ctx.drawImage(overlayImg, 0, 0, containerWidth, containerHeight);
          
          // Convert canvas to data URL
          const imageData = canvas.toDataURL('image/png');
          
          // Create a temporary link element
          const downloadLink = document.createElement('a');
          downloadLink.href = imageData;
          downloadLink.download = 'forge-master-filter.png';
          
          // Append to the document, trigger click, and remove
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        };
        overlayImg.src = '/overlay.png';
      };
      webcamImg.src = webcamImage;
    }
  };
  
  return (
    <div className="w-full">
      {/* Header with title */}
      {/* <div className="text-center mb-6">
        <h2 style={{ 
          color: 'var(--color-secondary)', 
          fontSize: '2.2rem', 
          fontWeight: '700',
          letterSpacing: '1.5px',
          marginBottom: '0.5rem',
          textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
          background: 'linear-gradient(to bottom, #d4af37, #aa8c30)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>Forge Master Filter</h2>
        <p style={{ color: 'var(--color-text)', opacity: '0.8' }}>Craft your perfect image</p>
      </div> */}
      
      <div className="flex flex-row items-start justify-center" style={{ maxWidth: '1200px', margin: '40px auto', position: 'relative' }}>
        <div 
          ref={containerRef}
          className="relative overflow-hidden mx-auto"
          style={{ 
            width: '800px', 
            height: '600px',
            cursor: dragging ? 'grabbing' : 'grab',
            borderRadius: '12px',
            border: '1px solid var(--color-accent)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(212, 175, 55, 0.2)',
            background: 'var(--color-background)',
            marginLeft: 'auto',
            marginRight: 'auto',
            marginTop: '20px',
            marginBottom: '20px'
          }}
          onMouseDown={handleMouseDown}
        >
        {/* Camera feed layer (adjustable) */}
        <div
          className="absolute"
          style={{
            transform: `translate(-50%, -50%) scale(${scale})`,
            left: `${position.x}%`,
            top: `${position.y}%`,
            transformOrigin: 'center',
            width: '100%',
            height: '100%'
          }}
        >
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/png"
            width={900}
            height={675}
            mirrored={true}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        </div>
        
        {/* Overlay image with transparent face area */}
        <img
          src="/overlay.png"
          alt="Overlay"
          className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
        />
        
        {/* Subtle gold corner accents */}
        <div className="absolute top-0 left-0 w-16 h-16" style={{ 
          borderTop: '2px solid var(--color-secondary)', 
          borderLeft: '2px solid var(--color-secondary)' 
        }}></div>
        <div className="absolute top-0 right-0 w-16 h-16" style={{ 
          borderTop: '2px solid var(--color-secondary)', 
          borderRight: '2px solid var(--color-secondary)' 
        }}></div>
        <div className="absolute bottom-0 left-0 w-16 h-16" style={{ 
          borderBottom: '2px solid var(--color-secondary)', 
          borderLeft: '2px solid var(--color-secondary)' 
        }}></div>
        <div className="absolute bottom-0 right-0 w-16 h-16" style={{ 
          borderBottom: '2px solid var(--color-secondary)', 
          borderRight: '2px solid var(--color-secondary)' 
        }}></div>
      </div>
      
      <div style={{
        width: '300px',
        padding: '20px',
        backgroundColor: 'var(--color-surface)',
        borderRadius: '16px',
        border: '1px solid var(--color-accent)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        marginLeft: '30px',
        marginTop: '20px',
        marginBottom: '20px',
        height: 'fit-content'
      }}>
        {/* Capture button at the top */}
        <div className="flex justify-center mb-4">
          <button
            onClick={handleScreenshot}
            style={{
              backgroundColor: 'var(--color-secondary)',
              color: 'var(--color-surface)',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: 'bold',
              letterSpacing: '1px',
              boxShadow: '0 4px 16px rgba(212, 175, 55, 0.4)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.5)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 16px rgba(212, 175, 55, 0.4)';
            }}
          >
            CAPTURE IMAGE
          </button>
        </div>
        
        {/* Divider */}
        <div style={{
          height: '1px',
          background: 'linear-gradient(to right, transparent, var(--color-accent), transparent)',
          margin: '10px 0 20px'
        }}></div>
        
        {/* Camera size control - sleek shorter slider */}
        <div style={{ 
          width: '90%', 
          margin: '0 auto',
          marginBottom: '20px'
        }}>
          <div className="flex items-center justify-center mb-2">
            <span style={{ 
              color: 'var(--color-secondary)', 
              fontWeight: '600',
              letterSpacing: '1px',
              fontSize: '14px'
            }}>
              SIZE
            </span>
          </div>
          <div className="relative" style={{ padding: '0 8px' }}>
            <div style={{ 
              position: 'absolute', 
              top: '50%', 
              left: '8px', 
              right: '8px',
              height: '3px',
              background: 'linear-gradient(to right, var(--color-accent), var(--color-secondary))',
              transform: 'translateY(-50%)',
              borderRadius: '4px',
              zIndex: '0'
            }}></div>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.05"
              value={scale}
              onChange={handleScaleChange}
              style={{
                width: '100%',
                height: '20px',
                appearance: 'none',
                background: 'transparent',
                outline: 'none',
                opacity: '1',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                position: 'relative',
                zIndex: '1'
              }}
            />
            <div style={{
              position: 'absolute',
              left: `calc(${((scale - 0.5) / 1.5) * 100}% + 8px)`,
              top: '50%',
              width: '16px',
              height: '16px',
              backgroundColor: 'var(--color-secondary)',
              border: '2px solid var(--color-surface)',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 3px 10px rgba(212, 175, 55, 0.6)',
              pointerEvents: 'none',
              zIndex: '0'
            }}></div>
          </div>
        </div>
        
        {/* Arrow controls in a straight line with more spacing */}
        <div className="flex items-center justify-center gap-4">
          <button 
            onClick={() => setPosition(prev => ({ ...prev, x: Math.max(0, prev.x - 3) }))}
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-secondary)',
              border: '2px solid var(--color-accent)',
              borderRadius: '12px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.15s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = 'rgba(212, 175, 55, 0.15)';
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.25)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'var(--color-surface)';
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
            }}
          >
            ←
          </button>
          
          <button 
            onClick={() => setPosition(prev => ({ ...prev, y: Math.max(0, prev.y - 3) }))}
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-secondary)',
              border: '2px solid var(--color-accent)',
              borderRadius: '12px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.15s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = 'rgba(212, 175, 55, 0.15)';
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.25)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'var(--color-surface)';
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
            }}
          >
            ↑
          </button>
          
          <button 
            onClick={() => setPosition(prev => ({ ...prev, y: Math.min(100, prev.y + 3) }))}
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-secondary)',
              border: '2px solid var(--color-accent)',
              borderRadius: '12px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.15s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = 'rgba(212, 175, 55, 0.15)';
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.25)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'var(--color-surface)';
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
            }}
          >
            ↓
          </button>
          
          <button 
            onClick={() => setPosition(prev => ({ ...prev, x: Math.min(100, prev.x + 3) }))}
            style={{
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-secondary)',
              border: '2px solid var(--color-accent)',
              borderRadius: '12px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.15s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = 'rgba(212, 175, 55, 0.15)';
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.25)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'var(--color-surface)';
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
            }}
          >
            →
          </button>
        </div>
        
        {/* Fine adjustment hint */}
        <div className="flex justify-center mt-4">
          <p style={{ 
            color: 'var(--color-secondary)', 
            opacity: '0.7', 
            fontSize: '0.8rem',
            fontStyle: 'italic'
          }}>
            Drag image directly for fine adjustments
          </p>
        </div>
        
        <p className="text-sm text-center mt-4" style={{ color: 'var(--color-text)', opacity: 0.7 }}>
          Drag the image or use sliders to position your face perfectly
        </p>
        
        {/* Divider */}
        <div style={{
          height: '1px',
          background: 'linear-gradient(to right, transparent, var(--color-accent), transparent)',
          margin: '20px 0'
        }}></div>
        
        {/* Share button */}
        <div className="flex justify-center">
          <button
            onClick={() => {
              const tweetText = encodeURIComponent("⚒️ Just leveled up! Completed @the_web3compass 15 Days of Foundry challenge. Check out my transformation into the ultimate Forge Master! 🔥 #FoundryMaster #Web3Wizard");
              window.open(`https://twitter.com/intent/tweet?text=${tweetText}`, '_blank');
            }}
            style={{
              backgroundColor: 'var(--color-secondary)',
              color: 'var(--color-surface)',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '14px',
              fontWeight: 'bold',
              boxShadow: '0 2px 8px rgba(212, 175, 55, 0.3)'
            }}
          >
            Share on Twitter
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
