import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q49Visualization: React.FC = () => {
  const categoryOrder = [
    'Less than high school',
    'High school graduate',
    'Some college Degree',
    "Bachelor's degree",
    'Graduate/post-graduate degree',
  ];

  const categoryLabels: { [key: string]: string } = {
    'Less than high school': 'Less than high school',
    'High school graduate': 'High school graduate',
    'Some college Degree': 'Some college Degree',
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
    'Some college Degree': '#507dbc',
    "Bachelor's degree": '#507dbc',
    'Graduate/post-graduate degree': '#507dbc',
  };

  // Custom processor to combine Some college, Vocational/technical training, and Associate degree
  const dataProcessor = (filteredData: any[], options: any) => {
    const counts: Record<string, number> = {};
    categoryOrder.forEach(cat => { counts[cat] = 0; });
    
    filteredData.forEach(row => {
      const educValue = row.educ || row.q49 || row.education_level;
      if (!educValue || educValue === '-8') return;
      
      if (educValue === '3' || educValue === '4' || educValue === '5') {
        // Combine Some college (3), Vocational/technical training (4), and Associate degree (5)
        counts['Some college Degree']++;
      } else if (educValue === '1') {
        counts['Less than high school']++;
      } else if (educValue === '2') {
        counts['High school graduate']++;
      } else if (educValue === '6') {
        counts["Bachelor's degree"]++;
      } else if (educValue === '7') {
        counts['Graduate/post-graduate degree']++;
      }
    });

    return categoryOrder.map(category => ({
      category,
      label: categoryLabels[category] || category,
      count: counts[category],
      percentage: filteredData.length > 0 ? (counts[category] / filteredData.length) * 100 : 0
    }));
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
      dataProcessor={dataProcessor}
    />
  );
};

export default Q49Visualization; 