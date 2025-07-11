import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q39Visualization: React.FC = () => {
  const categoryOrder = [
    "1",
    "2",
    "3",
    "4"
  ];
  const categoryLabels: { [key: string]: string } = {
    "1": "Indoors",
    "2": "Outdoors",
    "3": "Combination of indoor and outdoor",
    "4": "Not applicable"
  };
  const valueMap: { [key: string]: string } = {
    "-8": "4"
  };
  return (
    <HorizontalBarChart
      questionId="Q39"
      title="Which of the following best describes your primary work environment?"
      dataField="work_environment"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      valueMap={valueMap}
      alternateFields={["39"]}
      labelWidth={260}
    />
  );
};

export default Q39Visualization; 