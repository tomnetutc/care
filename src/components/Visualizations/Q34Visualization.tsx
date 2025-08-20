import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q34Visualization: React.FC = () => {
  const categoryOrder = ['1', '2', '3', '4', '5'];
  
  const categoryLabels: Record<string, string> = {
    '1': 'Every day',
    '2': 'A few times a week',
    '3': 'A few times a month',
    '4': 'Less than once a month',
    '5': 'Never'
  };

  const categoryColors = [
    "#A3923D",  // Darkest Yellow
    "#D1B856",  // Darker Yellow
    "#EAD97C",  // Anchor Yellow
    "#F4E9AA",  // Lightest Yellow
    "#b6bebc"   // Light Gray
  ];

  return (
    <HorizontalBarChart
      questionId="34"
      title="Before the COVID-19 pandemic, how often did you use public transit?"
      dataField="pre_covid_transit_use"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      categoryColors={categoryColors}
    />
  );
};

export default Q34Visualization; 