import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q46Visualization: React.FC = () => {
  const categoryOrder = [
    'Male',
    'Female',
    'Prefer not to answer',
    'Other',
  ];

  const categoryLabels: { [key: string]: string } = {
    'Male': 'Male',
    'Female': 'Female',
    'Prefer not to answer': 'Prefer not to answer',
    'Other': 'Other',
  };

  const valueMap: { [key: string]: string } = {
    '1': 'Male',
    '2': 'Female',
    '3': 'Prefer not to answer',
    '4': 'Other',
  };

  const categoryColors: { [key: string]: string } = {
    'Male': '#507dbc',
    'Female': '#507dbc',
    'Prefer not to answer': '#507dbc',
    'Other': '#507dbc',
  };

  return (
    <HorizontalBarChart
      questionId="Q46"
      title="What is your gender?"
      dataField="gender"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      categoryColors={categoryColors}
      valueMap={valueMap}
      alternateFields={['q46', 'gender_identity']}
      tooltipCountLabel="Responses"
    />
  );
};

export default Q46Visualization; 