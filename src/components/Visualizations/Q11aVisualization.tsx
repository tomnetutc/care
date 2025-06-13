import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q11aVisualization: React.FC = () => {
  const categoryOrder = ["1", "2", "3", "4", "5"];
  
  const categoryLabels: {[key: string]: string} = {
    "1": "No impact",
    "2": "Minimal impact",
    "3": "Moderate impact",
    "4": "Significant impact",
    "5": "Extreme impact"
  };
  
  const categoryColors = [
    "#2ba88c",  // No impact (cool)
    "#93c4b9",  // Minimal impact
    "#ead97c",  // Moderate impact
    "#f0b3ba",  // Significant impact
    "#e25b61"   // Extreme impact (warm)
  ];
  
  return (
    <HorizontalBarChart
      questionId="Q11a"
      title="Thinking about the last time you experienced extreme heat, how would you rate its impact on your daily life?"
      dataField="ext_heat_impact_wlb"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      categoryColors={categoryColors}
      labelWidth={180}
    />
  );
};

export default Q11aVisualization;