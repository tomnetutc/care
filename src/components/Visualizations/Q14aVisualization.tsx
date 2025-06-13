import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q14aVisualization: React.FC = () => {
  const categoryOrder = ["0", "1", "2", "3", "4", "5"];
  
  const categoryLabels: {[key: string]: string} = {
    "0": "0",
    "1": "1",
    "2": "2",
    "3": "3",
    "4": "4",
    "5": "5"
  };
  
  const categoryColors = [
    "#218066",  // 0
    "#2ba88c",  // 1
    "#93c4b9",  // 2
    "#ead97c",  // 3 (neutral/yellow)
    "#f0b3ba",  // 4
    "#e25b61"   // Very much (warm/red)
  ];
  
  return (
    <HorizontalBarChart
      questionId="Q14a"
      title={'How much do you feel the next extreme heat event will affect you? Rate from 0 to 5, where 0 = "not at all", and 5 = "very much".'}
      dataField="ext_heat_affect"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      categoryColors={categoryColors}
      labelWidth={120}
    />
  );
};

export default Q14aVisualization;