import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q8Visualization: React.FC = () => {
  const categoryOrder = ["1", "2", "3", "4", "5"];
  
  const categoryLabels: {[key: string]: string} = {
    "1": "Very secure",
    "2": "Somewhat secure",
    "3": "Neither secure nor insecure", 
    "4": "Somewhat insecure",
    "5": "Very insecure"
  };
  
  const categoryColors = [
    "#2ba88c",  // Very secure
    "#93c4b9",  // Somewhat secure
    "#ead97c",  // Neither secure nor insecure
    "#f0b3ba",  // Somewhat insecure
    "#e25b61"   // Very insecure
  ];
  
  return (
    <HorizontalBarChart
      questionId="Q8"
      title="How financially secure do you feel, considering your current income, savings, debts, and expenses?"
      dataField="financial_secure"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      categoryColors={categoryColors}
      labelWidth={200}
    />
  );
};

export default Q8Visualization;