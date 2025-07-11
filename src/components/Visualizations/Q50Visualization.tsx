import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q50Visualization: React.FC = () => {
  const categoryOrder = [
    'No',
    'Yes, I have had this condition for 6 months or less',
    'Yes, I have had this condition for more than 6 months',
    'Yes, I have had this condition for my entire life',
  ];

  const categoryLabels: { [key: string]: string } = {
    'No': 'No',
    'Yes, I have had this condition for 6 months or less': 'Yes, I have had this condition for 6 months or less',
    'Yes, I have had this condition for more than 6 months': 'Yes, I have had this condition for more than 6 months',
    'Yes, I have had this condition for my entire life': 'Yes, I have had this condition for my entire life',
  };

  const valueMap: { [key: string]: string } = {
    '1': 'No',
    '2': 'Yes, I have had this condition for 6 months or less',
    '3': 'Yes, I have had this condition for more than 6 months',
    '4': 'Yes, I have had this condition for my entire life',
  };

  const categoryColors: { [key: string]: string } = {
    'No': '#507dbc',
    'Yes, I have had this condition for 6 months or less': '#507dbc',
    'Yes, I have had this condition for more than 6 months': '#507dbc',
    'Yes, I have had this condition for my entire life': '#507dbc',
  };

  return (
    <HorizontalBarChart
      questionId="Q50"
      title="Do you have a condition or disability that makes it difficult to travel outside of the home?"
      dataField="travel_disability"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      categoryColors={categoryColors}
      valueMap={valueMap}
      alternateFields={['q50', 'disability_travel']}
      tooltipCountLabel="Responses"
      labelWidth={260}
    />
  );
};

export default Q50Visualization; 