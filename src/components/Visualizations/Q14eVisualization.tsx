import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q14eVisualization: React.FC = () => {
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
    "#218066",  // 0 (darkest green)
    "#2ba88c",  // 1
    "#93c4b9",  // 2
    "#ead97c",  // 3 (neutral/yellow)
    "#f0b3ba",  // 4
    "#e25b61"   // 5 (red)
  ];
  
  return (
    <HorizontalBarChart
      questionId="Q14e"
      title='How much do you feel the next neighborhood-wide power outage will affect you? Rate from 0 to 5, where 0 = "not at all", and 5 = "very much".'
      dataField="ext_powerout_affect"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      categoryColors={categoryColors}
      labelWidth={120}
    />
  );
};

export default Q14eVisualization;