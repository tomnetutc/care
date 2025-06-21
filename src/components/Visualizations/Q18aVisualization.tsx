import React from 'react';
import PieChart from '../PieChart/PieChart';

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
    "Yes": "#2ba88c", // Green for Yes
    "No": "#e25b61"   // Red for No
  };
  
  return (
    <PieChart
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
      showLegend={true}
      showLabel={true}
    />
  );
};

export default Q18aVisualization;