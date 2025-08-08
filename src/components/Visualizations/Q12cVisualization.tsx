import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q12cVisualization: React.FC = () => {
  const categoryOrder = ["1", "2", "3", "4", "5"]; // Order from best coping to worst
  
  const categoryLabels: {[key: string]: string} = {
    "1": "Extremely well (I managed the situation with ease and minimal impact)",
    "2": "Very well (I coped well and overcame challenges effectively)",
    "3": "Moderately well (I managed to cope with some difficulties)",
    "4": "Not very well (I faced considerable challenges)",
    "5": "Not well at all (I struggled significantly to cope)"
  };
  
  // Colors from green (best coping) to red (worst coping)
  const categoryColors = [
    "#2ba88c",  // Extremely well - Strong green
    "#93c4b9",  // Very well - Light green
    "#ead97c",  // Moderately well - Yellow
    "#f0b3ba",  // Not very well - Light red
    "#e25b61"   // Not well at all - Strong red
  ];
  
  return (
    <HorizontalBarChart
      questionId="Q12c"
      title="Reflecting on the last time you experienced major flooding, how well did you cope with the situation?"
      dataField="ext_flooding_cope"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      categoryColors={categoryColors}
    />
  );
};

export default Q12cVisualization;