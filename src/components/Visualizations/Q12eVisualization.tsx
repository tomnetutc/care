import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q12eVisualization: React.FC = () => {
  const categoryOrder = ["1", "2", "3", "4", "5"]; // Order from best coping to worst coping
  
  const categoryLabels: {[key: string]: string} = {
    "1": "Extremely well (I managed the situation with ease and minimal impact)",
    "2": "Very well (I coped well and overcame challenges effectively)",
    "3": "Moderately well (I managed to cope with some difficulties)",
    "4": "Not very well (I faced considerable challenges)",
    "5": "Not well at all (I struggled significantly to cope)"
  };
  
  // For coping ability, we use a gradient where green is positive (coped well)
  // and red is negative (didn't cope well)
  const categoryColors = [
    "#2ba88c",  // Extremely well - green
    "#93c4b9",  // Very well - light green
    "#ead97c",  // Moderately well - yellow
    "#f0b3ba",  // Not very well - light red
    "#e25b61"   // Not well at all - red
  ];
  
  return (
    <HorizontalBarChart
      questionId="Q12e"
      title="Reflecting on the last time you experienced a neighborhood-wide power outage, how well did you cope with the situation?"
      dataField="ext_powerout_cope"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      categoryColors={categoryColors}
      labelWidth={380} // Increased width to accommodate longer labels
    />
  );
};

export default Q12eVisualization;