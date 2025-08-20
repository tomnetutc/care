import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const categoryOrder = [
  'American Indian or Alaska Native',
  'Asian',
  'Black or African American',
  'Native Hawaiian or Pacific Islander',
  'White',
  'Other',
  'Multiple races',
  'Prefer not to answer',
];

const categoryLabels: { [key: string]: string } = {
  'American Indian or Alaska Native': 'American Indian or Alaska Native',
  'Asian': 'Asian',
  'Black or African American': 'Black or African American',
  'Native Hawaiian or Pacific Islander': 'Native Hawaiian or Pacific Islander',
  'White': 'White',
  'Other': 'Other',
  'Multiple races': 'Multiple races',
  'Prefer not to answer': 'Prefer not to answer',
};

const multiSelectFields: Record<string, string> = {
  race_indian_native: 'American Indian or Alaska Native',
  race_asian: 'Asian',
  race_black: 'Black or African American',
  race_native_pacific: 'Native Hawaiian or Pacific Islander',
  race_white: 'White',
  race_other: 'Other',
  race_prefer_not_to_answer: 'Prefer not to answer',
};

const categoryColors: { [key: string]: string } = {
  'American Indian or Alaska Native': '#507dbc',
  'Asian': '#507dbc',
  'Black or African American': '#507dbc',
  'Native Hawaiian or Pacific Islander': '#507dbc',
  'White': '#507dbc',
  'Other': '#507dbc',
  'Multiple': '#507dbc',
  'Prefer not to answer': '#507dbc',
};

// Custom processor for the new logic
const dataProcessor = (filteredData: any[], options: any) => {
  const counts: Record<string, number> = {};
  categoryOrder.forEach(cat => { counts[cat] = 0; });
  let validRespondents = 0;

  filteredData.forEach(row => {
    // Gather which races were selected (excluding 'Prefer not to answer')
    const selectedRaces = Object.entries(multiSelectFields)
      .filter(([field, cat]) => cat !== 'Prefer not to answer' && (row[field] === '1' || (cat === 'Other' && row[field] && String(row[field]).trim() !== '' && row[field] !== '0' && row[field] !== '-8')))
      .map(([field, cat]) => cat);
    const preferNot = row['race_prefer_not_to_answer'] === '1';
    // If nothing selected, skip
    if (selectedRaces.length === 0 && !preferNot) return;
    validRespondents++;
    if (selectedRaces.length === 1) {
      counts[selectedRaces[0]]++;
    } else if (selectedRaces.length > 1) {
      counts['Multiple races']++;
    } else if (preferNot && selectedRaces.length === 0) {
      counts['Prefer not to answer']++;
    }
  });

  // Build data array
  return categoryOrder.map(category => ({
    category,
    label: categoryLabels[category] || category,
    count: counts[category],
    percentage: validRespondents > 0 ? (counts[category] / validRespondents) * 100 : 0,
  }));
};

const Q48Visualization: React.FC = () => {
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
      tooltipCountLabel="Respondents"
      dataProcessor={dataProcessor}
    />
  );
};

export default Q48Visualization; 