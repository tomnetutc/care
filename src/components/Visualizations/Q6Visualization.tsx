import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q6Visualization: React.FC = () => {
  const categoryOrder = ["1", "2", "3", "4", "5"];
  
  const categoryLabels: {[key: string]: string} = {
    "1": "Very strong",
    "2": "Somewhat strong",
    "3": "Neither strong nor weak", 
    "4": "Somewhat weak",
    "5": "Very weak"
  };
  
  const categoryColors = [
    "#2ba88c",  // Very strong
    "#93c4b9",  // Somewhat strong
    "#ead97c",  // Neither strong nor weak
    "#f0b3ba",  // Somewhat weak
    "#e25b61"   // Very weak
  ];
  
  return (
    <HorizontalBarChart
      questionId="Q6"
      title="How strong are your current social relationships and connections in your neighborhood/community?"
      dataField="social_connect_strength"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      categoryColors={categoryColors}
    />
  );
};

export default Q6Visualization;