import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q14dVisualization: React.FC = () => {
  const categoryOrder = ["0", "1", "2", "3", "4", "5"];
  
  const categoryLabels: {[key: string]: string} = {
    "0": "0",
    "1": "1",
    "2": "2",
    "3": "3",
    "4": "4",
    "5": "5"
  };
  
  // Color gradient from green (not at all) to red (very much)
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
      questionId="Q14d"
      title='How much do you feel the next major earthquake will affect you? Rate from 0 to 5, where 0 = "not at all", and 5 = "very much".'
      dataField="ext_earthquake_affect"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      categoryColors={categoryColors}
      labelWidth={120}
    />
  );
};

export default Q14dVisualization;