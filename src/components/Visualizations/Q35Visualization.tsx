import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q35Visualization: React.FC = () => {
  const categoryOrder = ['1', '2', '3', '4', '5'];
  
  const categoryLabels: Record<string, string> = {
    '1': 'Every day',
    '2': 'A few times a week',
    '3': 'A few times a month',
    '4': 'Less than once a month',
    '5': 'Never'
  };

  return (
    <HorizontalBarChart
      questionId="35"
      title="During the initial months of the COVID-19 pandemic (i.e., March to July 2020), how often did you use public transit?"
      dataField="covid_transit_use"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
    />
  );
};

export default Q35Visualization; 