import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q48Visualization: React.FC = () => {
  const categoryOrder = [
    'American Indian or Alaska Native',
    'Asian',
    'Black or African American',
    'Native Hawaiian or Pacific Islander',
    'White',
    'Other',
    'Prefer not to answer',
  ];

  const categoryLabels: { [key: string]: string } = {
    'American Indian or Alaska Native': 'American Indian or Alaska Native',
    'Asian': 'Asian',
    'Black or African American': 'Black or African American',
    'Native Hawaiian or Pacific Islander': 'Native Hawaiian or Pacific Islander',
    'White': 'White',
    'Prefer not to answer': 'Prefer not to answer',
    'Other': 'Other',
  };

  // Map CSV fields to categories for multi-select
  const multiSelectFields: Record<string, string> = {
    race_indian_native: 'American Indian or Alaska Native',
    race_asian: 'Asian',
    race_black: 'Black or African American',
    race_native_pacific: 'Native Hawaiian or Pacific Islander',
    race_white: 'White',
    race_prefer_not_to_answer: 'Prefer not to answer',
    race_other: 'Other',
  };

  const categoryColors: { [key: string]: string } = {
    'American Indian or Alaska Native': '#507dbc',
    'Asian': '#507dbc',
    'Black or African American': '#507dbc',
    'Native Hawaiian or Pacific Islander': '#507dbc',
    'White': '#507dbc',
    'Prefer not to answer': '#507dbc',
    'Other': '#507dbc',
  };

  return (
    <HorizontalBarChart
      questionId="Q48"
      title="What is your race? Please select all that apply."
      dataField="race_indian_native" // Not used for multiSelect, but required by prop
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      categoryColors={categoryColors}
      multiSelectFields={multiSelectFields}
      percentageDenominator="uniqueRespondents"
      tooltipCountLabel="Responses"
    />
  );
};

export default Q48Visualization; 