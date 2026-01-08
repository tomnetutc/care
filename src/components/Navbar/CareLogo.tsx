import React from 'react';

export const CareLogo: React.FC<{ size?: number }> = ({ size = 40 }) => {
  return (
    <div 
      style={{
        width: size,
        height: size,
        background: '#6dafa0',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 60 60" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="30" cy="30" r="24" stroke="white" strokeWidth="2.5" fill="none"/>
        <circle cx="30" cy="30" r="5" fill="white"/>
        <circle cx="30" cy="15" r="4" fill="white"/>
        <circle cx="15" cy="30" r="4" fill="white"/>
        <circle cx="45" cy="30" r="4" fill="white"/>
        <circle cx="22" cy="40" r="4" fill="white"/>
        <circle cx="38" cy="40" r="4" fill="white"/>
        <line x1="30" y1="30" x2="30" y2="19" stroke="white" strokeWidth="2"/>
        <line x1="30" y1="30" x2="19" y2="30" stroke="white" strokeWidth="2"/>
        <line x1="30" y1="30" x2="41" y2="30" stroke="white" strokeWidth="2"/>
        <line x1="30" y1="30" x2="24" y2="38" stroke="white" strokeWidth="2"/>
        <line x1="30" y1="30" x2="36" y2="38" stroke="white" strokeWidth="2"/>
      </svg>
    </div>
  );
};

