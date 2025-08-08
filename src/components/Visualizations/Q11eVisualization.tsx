import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q11eVisualization: React.FC = () => {
  const categoryOrder = ["5", "4", "3", "2", "1"];
  
  const categoryLabels: {[key: string]: string} = {
    "1": "Not severe at all",
    "2": "Slightly severe",
    "3": "Moderately severe",
    "4": "Very severe",
    "5": "Extremely severe"
  };
  
  const categoryColors = [
    "#e25b61",   // Extreme impact (warm)
    "#f0b3ba",   // Significant impact
    "#ead97c",   // Moderate impact
    "#93c4b9",   // Minimal impact
    "#2ba88c"    // No impact (cool)
  ];
  
  return (
    <HorizontalBarChart
      questionId="Q11e"
      title="Thinking about the last time you experienced a neighborhood-wide power outage, how would you rate its impact on your daily life?"
      dataField="ext_powerout_impact_wlb"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      categoryColors={categoryColors}
      
    />
  );
};

export default Q11eVisualization;