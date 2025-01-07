import React from 'react';

const PulsingMicButton = ({onClick}) => {
  return (
    <div className="mic-container">
      <div className="mic-rings-container">
        <div className="pulse-ring pulse-ring-1" />
        <div className="pulse-ring pulse-ring-2" />
        <div className="pulse-ring pulse-ring-3" />
      </div>
      <button className="mic-button"
        onClick={() => onClick()}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className=" w-12 h-12"  viewBox="0 0 24 24">
          <path fill="white" d="M19 9a1 1 0 0 1 1 1a8 8 0 0 1-6.999 7.938L13 20h3a1 1 0 0 1 0 2H8a1 1 0 0 1 0-2h3v-2.062A8 8 0 0 1 4 10a1 1 0 1 1 2 0a6 6 0 0 0 12 0a1 1 0 0 1 1-1m-7-8a4 4 0 0 1 4 4v5a4 4 0 1 1-8 0V5a4 4 0 0 1 4-4" />
        </svg>
      </button>
    </div>
  );
};

export default PulsingMicButton;