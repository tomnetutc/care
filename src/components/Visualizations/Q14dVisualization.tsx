import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q14dVisualization: React.FC = () => {
  const categoryOrder = ["5", "4", "3", "2", "1", "0"];
  
  const categoryLabels: {[key: string]: string} = {
    "0": "0 - Not at all",
    "1": "1",
    "2": "2",
    "3": "3",
    "4": "4",
    "5": "5 - Very much"
  };
  
  const categoryColors = [
    "#e25b61",   // 5 (Very much - warm/red)
    "#f0b3ba",   // 4
    "#ead97c",   // 3 (neutral/yellow)
    "#93c4b9",   // 2
    "#2ba88c",   // 1
    "#218066"    // 0 (Not at all - cool/green)
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