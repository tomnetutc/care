import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q11bVisualization: React.FC = () => {
  const categoryOrder = ["5", "4", "3", "2", "1"];
  
  const categoryLabels: {[key: string]: string} = {
    "1": "Not severe at all",
    "2": "Slightly severe",
    "3": "Moderately severe", 
    "4": "Very severe",
    "5": "Extremely severe"
  };
  
  const categoryColors = [
    "#e25b61",   // Extremely severe
    "#f0b3ba",   // Very severe
    "#ead97c",   // Moderately severe
    "#93c4b9",   // Slightly severe
    "#2ba88c"    // Not severe at all
  ];
  
  return (
    <HorizontalBarChart
      questionId="Q11ba"
      title="Thinking about the last time you experienced extreme cold, how would you rate its impact on your daily life?"
      dataField="ext_cold_impact_wlb"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      categoryColors={categoryColors}
      labelWidth={180}
    />
  );
};

export default Q11bVisualization;