import React from 'react';

/**
 * Component hiển thị 4 nút điều hướng xung quanh bàn cờ
 */
const DirectionControls = ({ onMove, disabled = false }) => {
  
  const handleClick = (direction) => {
    if (!disabled) {
      onMove(direction);
    }
  };

  return (
    <>
      {/* UP BUTTON */}
      <button 
        className="direction-btn direction-up"
        onClick={() => handleClick('UP')}
        disabled={disabled}
        aria-label="Move Up"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
        </svg>
      </button>

      {/* DOWN BUTTON */}
      <button 
        className="direction-btn direction-down"
        onClick={() => handleClick('DOWN')}
        disabled={disabled}
        aria-label="Move Down"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
        </svg>
      </button>

      {/* LEFT BUTTON */}
      <button 
        className="direction-btn direction-left"
        onClick={() => handleClick('LEFT')}
        disabled={disabled}
        aria-label="Move Left"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/>
        </svg>
      </button>

      {/* RIGHT BUTTON */}
      <button 
        className="direction-btn direction-right"
        onClick={() => handleClick('RIGHT')}
        disabled={disabled}
        aria-label="Move Right"
      >
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
        </svg>
      </button>
    </>
  );
};

export default DirectionControls;