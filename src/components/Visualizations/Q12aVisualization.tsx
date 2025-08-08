import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q12aVisualization: React.FC = () => {
  const categoryOrder = ["1", "2", "3", "4", "5"];
  
  const categoryLabels: {[key: string]: string} = {
    "1": "Extremely well",
    "2": "Very well",
    "3": "Moderately well",
    "4": "Slightly well",
    "5": "Not well at all"
  };
  
  const categoryColors = [
    "#2ba88c",  // Extremely well (cool)
    "#93c4b9",  // Very well
    "#ead97c",  // Moderately well
    "#f0b3ba",  // Slightly well
    "#e25b61"   // Not well at all (warm)
  ];
  
  return (
    <HorizontalBarChart
      questionId="Q12a"
      title="Reflecting on the last time you experienced extreme heat, how well did you cope with the situation?"
      dataField="ext_heat_cope"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      categoryColors={categoryColors}
      
    />
  );
};

export default Q12aVisualization;