import React from 'react';

export default function MainLayout({ children }) {
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center" style={{ fontFamily: 'var(--font-primary)' }}>
      {/* Background with subtle gradient */}
      <div className="fixed inset-0 z-0 overflow-hidden" style={{ 
        background: 'linear-gradient(135deg, var(--color-background) 0%, var(--color-surface) 100%)',
        boxShadow: 'inset 0 0 100px rgba(212, 175, 55, 0.05)'
      }}></div>
      
      {/* Decorative gold accents */}
      <div className="fixed top-0 left-0 w-full h-2" style={{ 
        background: 'var(--color-secondary)',
        boxShadow: '0 0 10px var(--color-secondary)'
      }}></div>
      <div className="fixed bottom-0 left-0 w-full h-2" style={{ 
        background: 'var(--color-secondary)',
        boxShadow: '0 0 10px var(--color-secondary)'
      }}></div>
      
      {/* Header */}
      <div className="relative z-10 w-full max-w-4xl mx-auto mt-8 mb-4 text-center">
        <h1 className="text-4xl font-bold animate-pulsate" style={{ 
          color: 'var(--color-secondary)',
          textShadow: '1px 1px 3px rgba(0,0,0,0.3)'
        }}>
          Forge Master Filter
        </h1>

      </div>
      
      {/* Content container with elegant styling */}
      <div 
        className="relative z-10 p-8 w-full max-w-4xl mx-auto mb-8" 
        style={{
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--border-radius)',
          border: '2px solid var(--color-accent)',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(212, 175, 55, 0.1)',
          color: 'var(--color-text)',
          transition: 'all 0.5s ease',
        }}>
        {children}
      </div>
      
      {/* Elegant footer */}
      {/* <div className="w-full text-center py-4" style={{ 
        color: 'var(--color-secondary)', 
        fontSize: '1rem',
        fontWeight: '300',
        letterSpacing: '1px'
      }}>
        <span style={{ 
          borderTop: '2px solid var(--color-accent)', 
          paddingTop: '0.5rem',
          display: 'inline-block',
        }}>
          Foundry Face App © 2025
        </span>
      </div> */}
    </div>
  );
} 