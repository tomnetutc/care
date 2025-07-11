import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q32Visualization: React.FC = () => {
  const categoryOrder = [
    "Every day",
    "A few times a week",
    "A few times a month",
    "Less than once a month",
    "Never"
  ];
  
  const categoryLabels: { [key: string]: string } = {
    "Every day": "Every day",
    "A few times a week": "A few times a week",
    "A few times a month": "A few times a month",
    "Less than once a month": "Less than once a month",
    "Never": "Never"
  };
  
  const valueMap: { [key: string]: string } = {
    "1": "Every day",
    "2": "A few times a week",
    "3": "A few times a month",
    "4": "Less than once a month",
    "5": "Never"
  };
  
  const categoryColors = [
    "#507dbc",  // Every day
    "#507dbc",  // A few times a week
    "#507dbc",  // A few times a month
    "#507dbc",  // Less than once a month
    "#507dbc"   // Never
  ];
  
  return (
    <HorizontalBarChart
      questionId="Q32"
      title="How often do you currently use public transit?"
      dataField="transit_freq"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      categoryColors={categoryColors}
      valueMap={valueMap}
      tooltipCountLabel="Responses"
    />
  );
};

export default Q32Visualization; 