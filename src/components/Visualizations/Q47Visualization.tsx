import React from 'react';
import PieChart from '../PieChart/PieChart';

const Q47Visualization: React.FC = () => {
  const categoryOrder = [
    'Yes',
    'No',
  ];

  const categoryLabels: { [key: string]: string } = {
    'Yes': 'Yes',
    'No': 'No',
  };

  const valueMap: { [key: string]: string } = {
    '1': 'Yes',
    '2': 'No',
  };

  const categoryColors: { [key: string]: string } = {
    'Yes': '#89c4f4',
    'No': '#507dbc'
  };

  return (
    <PieChart
      questionId="Q47"
      title="Are you Hispanic or Latino origin?"
      dataField="hispanic"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      categoryColors={categoryColors}
      valueMap={valueMap}
      alternateFields={['q47', 'hispanic_latino']}
      tooltipCountLabel="Responses"
      showLegend={true}
      showLabel={true}
    />
  );
};

export default Q47Visualization; 