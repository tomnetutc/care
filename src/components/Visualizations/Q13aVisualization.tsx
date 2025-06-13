import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q13aVisualization: React.FC = () => {
  const categoryOrder = ["1", "2", "3", "4", "5", "6"];

  const categoryLabels: {[key: string]: string} = {
    "1": "Very unlikely",
    "2": "Somewhat unlikely", 
    "3": "Neither likely nor unlikely",
    "4": "Somewhat likely",
    "5": "Very likely",
    "6": "I'm not sure"
  };
  
  // Updated colors to match the correct order
  const categoryColors = [
    "#2ba88c",   // Very likely (5) - cool/green
    "#93c4b9",   // Somewhat likely (4)
    "#ead97c",   // Neither likely nor unlikely (3) - neutral/yellow
    "#f0b3ba",   // Somewhat unlikely (2)
    "#e25b61",   // Very unlikely (1) - warm/red
    "#AAAAAA"    // I'm not sure (6) - gray
  ];
  
  return (
    <HorizontalBarChart
      questionId="Q13a"
      title="In your opinion, how likely is it that your area will experience extreme heat in the next 10 years?"
      dataField="ext_heat_likely_repeat"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      categoryColors={categoryColors}
      labelWidth={220}
    />
  );
};

export default Q13aVisualization;