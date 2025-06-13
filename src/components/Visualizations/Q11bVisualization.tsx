import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q11bVisualization: React.FC = () => {
  const categoryOrder = ["1", "2", "3", "4", "5"];
  
  const categoryLabels: {[key: string]: string} = {
    "1": "Not severe at all",
    "2": "Slightly severe",
    "3": "Moderately severe", 
    "4": "Very severe",
    "5": "Extremely severe"
  };
  
  const categoryColors = [
    "#2ba88c",  // No impact
    "#93c4b9",  // Minor impact
    "#ead97c",  // Moderate impact
    "#f0b3ba",  // Significant impact
    "#e25b61"   // Severe impact
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