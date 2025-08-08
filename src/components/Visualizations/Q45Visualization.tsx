import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

// Age group categories based on the new age_category field
const categoryOrder = ['1', '2', '3', '4', '5', '6'];
const categoryLabels: Record<string, string> = {
  '1': '18-24 years',
  '2': '25-34 years',
  '3': '35-44 years',
  '4': '45-54 years',
  '5': '55-64 years',
  '6': '65+ years',
};

const Q45Visualization: React.FC = () => {
  return (
    <HorizontalBarChart
      questionId="Q45"
      title={"What is your age group?"}
      dataField="age_category"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      
    />
  );
};

export default Q45Visualization; 