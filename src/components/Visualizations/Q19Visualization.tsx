import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q19Visualization: React.FC = () => {
  const categoryOrder = ["1", "2", "3", "4"];
  const categoryLabels: { [key: string]: string } = {
    "1": "Both a worker and a student",
    "2": "A worker (part-time or full-time)",
    "3": "A student (part-time or full-time)",
    "4": "Neither a worker nor a student",
  };

  return (
    <HorizontalBarChart
      questionId="Q19"
      title="At this time, you are:"
      dataField="employment_status"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      
    />
  );
};

export default Q19Visualization;