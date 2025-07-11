import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q49Visualization: React.FC = () => {
  const categoryOrder = [
    'Less than high school',
    'High school graduate',
    'Some college',
    'Vocational/technical training',
    'Associate degree',
    "Bachelor's degree",
    'Graduate/post-graduate degree',
  ];

  const categoryLabels: { [key: string]: string } = {
    'Less than high school': 'Less than high school',
    'High school graduate': 'High school graduate',
    'Some college': 'Some college',
    'Vocational/technical training': 'Vocational/technical training',
    'Associate degree': 'Associate degree',
    "Bachelor's degree": "Bachelor's degree",
    'Graduate/post-graduate degree': 'Graduate/post-graduate degree',
  };

  const valueMap: { [key: string]: string } = {
    '1': 'Less than high school',
    '2': 'High school graduate',
    '3': 'Some college',
    '4': 'Vocational/technical training',
    '5': 'Associate degree',
    '6': "Bachelor's degree",
    '7': 'Graduate/post-graduate degree',
  };

  const categoryColors: { [key: string]: string } = {
    'Less than high school': '#507dbc',
    'High school graduate': '#507dbc',
    'Some college': '#507dbc',
    'Vocational/technical training': '#507dbc',
    'Associate degree': '#507dbc',
    "Bachelor's degree": '#507dbc',
    'Graduate/post-graduate degree': '#507dbc',
  };

  return (
    <HorizontalBarChart
      questionId="Q49"
      title="What is the highest level of education you have completed?"
      dataField="educ"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      categoryColors={categoryColors}
      valueMap={valueMap}
      alternateFields={['q49', 'education_level']}
      tooltipCountLabel="Responses"
    />
  );
};

export default Q49Visualization; 