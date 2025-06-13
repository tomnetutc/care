import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q13dVisualization: React.FC = () => {
  const categoryOrder = ["1", "2", "3", "4", "5", "6"];
  
  const categoryLabels: {[key: string]: string} = {
    "1": "Very unlikely",
    "2": "Somewhat unlikely",
    "3": "Neither likely nor unlikely",
    "4": "Somewhat likely",
    "5": "Very likely",
    "6": "I'm not sure"
  };
  
  const categoryColors = [
    "#2ba88c",  // Very unlikely - green
    "#93c4b9",  // Somewhat unlikely - light green
    "#ead97c",  // Neither likely nor unlikely - yellow
    "#f0b3ba",  // Somewhat likely - light red
    "#e25b61",  // Very likely - red
    "#a0a0a0"   // I'm not sure - gray
  ];
  
  return (
    <HorizontalBarChart
      questionId="Q13d"
      title="In your opinion, how likely is it that your area will experience a major earthquake in the next 10 years?"
      dataField="ext_earthquake_likely_repeat"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      categoryColors={categoryColors}
      labelWidth={220}
    />
  );
};

export default Q13dVisualization;