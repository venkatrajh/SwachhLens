import React from 'react';
import { AmbientObjects } from './AmbientObjects';

export const AppBackground = ({ children }) => {
  return (
    <div
      style={{
        position: 'relative',
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        transition: 'var(--transition-theme)'
      }}
    >
      {/* Ambient Municipal Background Objects & Soft Cyan Volumes */}
      <AmbientObjects />

      {/* Foreground Content Layer */}
      <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
};
