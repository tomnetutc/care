import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q12bVisualization: React.FC = () => {
  const categoryOrder = ["1", "2", "3", "4", "5"];
  
  const categoryLabels: {[key: string]: string} = {
    "1": "Extremely well (I managed the situation with ease and minimal impact)",
    "2": "Very well (I coped well and overcame challenges effectively)",
    "3": "Moderately well (I managed to cope with some difficulties)", 
    "4": "Not very well (I faced considerable challenges)",
    "5": "Not well at all (I struggled significantly to cope)"
  };
  
  const categoryColors = [
    "#2ba88c",  // Extremely well
    "#93c4b9",  // Very well
    "#ead97c",  // Moderately well
    "#f0b3ba",  // Not very well
    "#e25b61"   // Not well at all
  ];
  
  return (
    <HorizontalBarChart
      questionId="Q12b"
      title="Reflecting on the last time you experienced extreme cold, how well did you cope with the situation?"
      dataField="ext_cold_cope"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      categoryColors={categoryColors}
    />
  );
};

export default Q12bVisualization;