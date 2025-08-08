import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q9Visualization: React.FC = () => {
  const categoryOrder = ["1", "2", "3", "4"];
  
  const categoryLabels: {[key: string]: string} = {
    "1": "No, I am not currently responsible for providing care to anyone.",
    "2": "Yes, I provide care for someone within my household.",
    "3": "Yes, I provide care for someone outside of my household.", 
    "4": "Yes, I provide care for someone both within and outside of my household."
  };
  
  return (
    <HorizontalBarChart
      questionId="Q9"
      title="Are you responsible for providing care for others? This can include caring for young children, aging parents, friends in need, or any other individuals for whom you provide significant support or care."
      dataField="provide_care"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}

    />
  );
};

export default Q9Visualization;