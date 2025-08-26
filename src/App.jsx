import React, { useState } from 'react';
import ThemeProvider from './components/ThemeProvider';
import MainLayout from './components/MainLayout';
import FaceOverlay from './components/FaceOverlay';
import AdjustableFaceOverlay from './components/AdjustableFaceOverlay';

function App() {
  const [useAdjustable, setUseAdjustable] = useState(true);

  return (
    <ThemeProvider>
      <MainLayout>

        <div className="flex flex-col w-full h-full">
          {/* Toggle between overlay approaches - positioned to the left */}
          {/* <div className="mb-6 flex items-center ml-8 gap-3">
            <span className="font-medium text-lg">Choose Your Mode:</span>
            <button
              onClick={() => setUseAdjustable(false)}
              className={`px-4 py-2 rounded transition-all ${!useAdjustable ? 'scale-105' : ''}`}
              style={{
                backgroundColor: !useAdjustable ? 'var(--color-secondary)' : '#e2e8f0',
                color: !useAdjustable ? 'white' : 'var(--color-text)',
                border: `2px solid ${!useAdjustable ? 'var(--color-accent)' : 'transparent'}`
              }}
            >
              Classic Mode
            </button>
            <button
              onClick={() => setUseAdjustable(true)}
              className={`px-4 py-2 rounded transition-all ${useAdjustable ? 'scale-105' : ''}`}
              style={{
                backgroundColor: useAdjustable ? 'var(--color-secondary)' : '#e2e8f0',
                color: useAdjustable ? 'white' : 'var(--color-text)',
                border: `2px solid ${useAdjustable ? 'var(--color-accent)' : 'transparent'}`
              }}
            >
              Adjustable Mode
            </button>
          </div> */}

          <div className="w-full flex justify-center">
            {/* Main content with centered image */}
            <div 
              className="p-8 mx-auto max-w-7xl relative overflow-hidden" 
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--border-radius)',
              }}
            >

              
              {/* Center the image content */}
              <div className="flex justify-center items-center">
                {useAdjustable ? (
                  <AdjustableFaceOverlay />
                ) : (
                  <FaceOverlay baseImage={'/forge.png'} />
                )}
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    </ThemeProvider>
  );
}

export default App;
