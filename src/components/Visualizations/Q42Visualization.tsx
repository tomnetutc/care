import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q42Visualization: React.FC = () => {
  const categoryOrder = ['1', '2', '3', '4', '5'];
  
  const categoryLabels: Record<string, string> = {
    '1': '1',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5 or more'
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