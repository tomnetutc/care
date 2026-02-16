import './InfoBox.scss';
import React, { ReactNode } from 'react';
import Tooltip from '@mui/material/Tooltip';
import InfoIcon from '@mui/icons-material/Info';

interface InfoBoxProps {
  children: ReactNode;
  style?: React.CSSProperties;
}

const InfoBox: React.FC<InfoBoxProps> = ({ children, style }) => {
  // If style is provided, use inline positioning; otherwise use absolute positioning
  const containerStyle = style ? { ...style } : {};
  const containerClass = style ? 'info-box-inline' : 'info-box-position';
  
  return (
    <>
      <div className={containerClass} style={containerStyle}>
        <Tooltip title={children}>
          <InfoIcon className="info-icon" />
        </Tooltip>
      </div>
    </>
  );
};

export default InfoBox;

