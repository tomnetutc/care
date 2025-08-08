import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q42cVisualization: React.FC = () => {
  const categoryOrder = ['0', '1', '2'];
  
  const categoryLabels: Record<string, string> = {
    '0': '0 older persons',
    '1': '1 older person',
    '2': '2+ older persons'
  };

  return (
    <HorizontalBarChart
      questionId="Q42c"
      title="Number of Older Persons in Household (65+ years old)"
      dataField="hh_old"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      
    />
  );
};

export default Q42cVisualization; 