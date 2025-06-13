import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q11dVisualization: React.FC = () => {
  const categoryOrder = ["1", "2", "3", "4", "5"]; // Order from least to most severe
  
  const categoryLabels: {[key: string]: string} = {
    "1": "Not severe at all",
    "2": "Slightly severe",
    "3": "Moderately severe", 
    "4": "Very severe",
    "5": "Extremely severe"
  };
  
  const categoryColors = [
    "#2ba88c",  // Not severe at all - green
    "#93c4b9",  // Slightly severe - light green
    "#ead97c",  // Moderately severe - yellow
    "#f0b3ba",  // Very severe - light red
    "#e25b61"   // Extremely severe - red
  ];
  
  return (
    <HorizontalBarChart
      questionId="Q11d"
      title="Thinking about the last time you experienced a major earthquake, how would you rate its impact on your daily life?"
      dataField="ext_earthquake_impact_wlb"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      categoryColors={categoryColors}
      labelWidth={180}
    />
  );
};

export default Q11dVisualization;