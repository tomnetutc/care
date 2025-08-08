import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q7Visualization: React.FC = () => {
  const categoryOrder = ["5", "4", "3", "2", "1", "0"]; // Reversed order
  
  const categoryLabels: { [key: string]: string } = {
    "0": "Very poor",
    "1": "Poor",
    "2": "Fair",
    "3": "Good",
    "4": "Very Good",
    "5": "Excellent"
  };
  
  const categoryColors = [
    "#218066",  // 5: Excellent
    "#2ba88c",  // 4: Very Good
    "#93c4b9",  // 3: Good
    "#ead97c",  // 2: Fair
    "#f0b3ba",  // 1: Poor
    "#e25b61"   // 0: Very Poor
  ];
  
  return (
    <HorizontalBarChart
      questionId="Q7"
      title="How would you rate your personal access to quality healthcare? Please rate from 0 to 5, where 0 = very poor, and 5 = excellent"
      dataField="healthcare_quality"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      categoryColors={categoryColors}
    />
  );
};

export default Q7Visualization;