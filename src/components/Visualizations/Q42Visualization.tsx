import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q42Visualization: React.FC = () => {
  const categoryOrder = ['1', '2', '3', '4', '5'];
  
  const categoryLabels: Record<string, string> = {
    '1': '1 person',
    '2': '2 people',
    '3': '3 people',
    '4': '4 people',
    '5': '5+ people'
  };

  return (
    <HorizontalBarChart
      questionId="Q42"
      title="Household Size Distribution"
      dataField="hh_size"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      
    />
  );
};

export default Q42Visualization; 