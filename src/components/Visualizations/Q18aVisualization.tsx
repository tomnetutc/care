import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q18aVisualization: React.FC = () => {
  const categoryOrder = [
    "Yes",
    "No"
  ];
  
  const categoryLabels: { [key: string]: string } = {
    "Yes": "Yes",
    "No": "No"
  };
  
  const valueMap: { [key: string]: string } = {
    "1": "Yes",
    "2": "No"
  };
  
  const categoryColors: { [key: string]: string } = {
    "Yes": "#507dbc", // Orange color as shown in image
    "No": "#507dbc"   // Same color for both bars
  };
  
  return (
    <HorizontalBarChart
      questionId="Q18a"
      title="Is your current residence equipped with air conditioning?"
      dataField="ext_heat_ac_equipped"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      categoryColors={categoryColors}
      valueMap={valueMap}
      alternateFields={[
        'ac_equipped', 
        'q18a'
      ]}
      tooltipCountLabel="Responses"
    />
  );
};

export default Q18aVisualization;