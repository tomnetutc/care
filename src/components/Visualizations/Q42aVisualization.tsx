import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q42aVisualization: React.FC = () => {
  const categoryOrder = ['0', '1', '2', '3'];
  
  const categoryLabels: Record<string, string> = {
    '0': '0 children',
    '1': '1 child',
    '2': '2 children',
    '3': '3+ children'
  };

  return (
    <HorizontalBarChart
      questionId="Q42a"
      title="Number of Children in Household (under 18 years old)"
      dataField="hh_child"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      
    />
  );
};

export default Q42aVisualization; 