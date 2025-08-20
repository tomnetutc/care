import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q11aVisualization: React.FC = () => {
  const categoryOrder = ["5", "4", "3", "2", "1"];
  
  const categoryLabels: {[key: string]: string} = {
    "1": "Not severe at all",
    "2": "Slightly severe",
    "3": "Moderately severe",
    "4": "Very severe",
    "5": "Extremely severe"
  };
  
  const categoryColors = [
    "#A3923D",  // Darkest Yellow
    "#D1B856",  // Darker Yellow
    "#EAD97C",  // Anchor Yellow
    "#F4E9AA",  // Lightest Yellow
    "#b6bebc"   // Light Gray
  ];
  
  return (
    <HorizontalBarChart
      questionId="Q11a"
      title="Thinking about the last time you experienced extreme heat, how would you rate its impact on your daily life?"
      dataField="ext_heat_impact_wlb"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      categoryColors={categoryColors}
      
    />
  );
};

export default Q11aVisualization;