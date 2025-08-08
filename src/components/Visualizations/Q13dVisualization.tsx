import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q13dVisualization: React.FC = () => {
  const categoryOrder = ["5", "4", "3", "2", "1", "6"];
  
  const categoryLabels: {[key: string]: string} = {
    "1": "Very unlikely",
    "2": "Somewhat unlikely",
    "3": "Neither likely nor unlikely",
    "4": "Somewhat likely",
    "5": "Very likely",
    "6": "I'm not sure"
  };
  
  // Reversed colors to match semantic meaning
  const categoryColors = [
    "#e25b61",   // Very likely (5) - warm/red
    "#f0b3ba",   // Somewhat likely (4)
    "#ead97c",   // Neither likely nor unlikely (3) - neutral/yellow
    "#93c4b9",   // Somewhat unlikely (2)
    "#2ba88c",   // Very unlikely (1) - cool/green
    "#AAAAAA"    // I'm not sure (6) - gray
  ];
  
  return (
    <HorizontalBarChart
      questionId="Q13d"
      title="In your opinion, how likely is it that your area will experience a major earthquake in the next 10 years?"
      dataField="ext_earthquake_likely_repeat"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      categoryColors={categoryColors}
      
    />
  );
};

export default Q13dVisualization;