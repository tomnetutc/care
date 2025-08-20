import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q42bVisualization: React.FC = () => {
  const categoryOrder = ['1', '2', '3', '4'];
  
  const categoryLabels: Record<string, string> = {
    '1': '1',
    '2': '2',
    '3': '3',
    '4': '4 or more'
  };

  return (
    <HorizontalBarChart
      questionId="Q42b"
      title="Number of Adults in Household (18+ years old)"
      dataField="hh_adult"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      
    />
  );
};

export default Q42bVisualization; 