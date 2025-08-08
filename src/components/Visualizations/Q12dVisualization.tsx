import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q12dVisualization: React.FC = () => {
  const categoryOrder = ["1", "2", "3", "4", "5"]; // Order from best coping to worst
  
  const categoryLabels: {[key: string]: string} = {
    "1": "Extremely well (I managed the situation with ease and minimal impact)",
    "2": "Very well (I coped well and overcame challenges effectively)",
    "3": "Moderately well (I managed to cope with some difficulties)",
    "4": "Not very well (I faced considerable challenges)",
    "5": "Not well at all (I struggled significantly to cope)"
  };
  
  // Reverse color order compared to impact question since here 1 is positive and 5 is negative
  const categoryColors = [
    "#2ba88c",  // Extremely well - green
    "#93c4b9",  // Very well - light green
    "#ead97c",  // Moderately well - yellow
    "#f0b3ba",  // Not very well - light red
    "#e25b61"   // Not well at all - red
  ];
  
  return (
    <HorizontalBarChart
      questionId="Q12d"
      title="Reflecting on the last time you experienced a major earthquake, how well did you cope with the situation?"
      dataField="ext_earthquake_cope"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      categoryColors={categoryColors}
    />
  );
};

export default Q12dVisualization;