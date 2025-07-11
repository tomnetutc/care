import React from 'react';
import PieChart from '../PieChart/PieChart';

const Q38Visualization: React.FC = () => {
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
      questionId="Q38"
      title="Do you have a valid driver's license or permit?"
      dataField="license"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      categoryColors={categoryColors}
      valueMap={valueMap}
      alternateFields={["38"]}
      tooltipCountLabel="Responses"
      showLegend={true}
      showLabel={true}
    />
  );
};

export default Q38Visualization; 