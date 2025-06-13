import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const Q5Visualization: React.FC = () => {
  const categoryOrder = [
    "Much better now",
    "Somewhat better now",
    "About the same",
    "Somewhat worse now",
    "Much worse now"
  ];
  
  const categoryLabels: { [key: string]: string } = {
    "Much better now": "Much better now",
    "Somewhat better now": "Somewhat better now",
    "About the same": "About the same",
    "Somewhat worse now": "Somewhat worse now",
    "Much worse now": "Much worse now"
  };
  
  const valueMap: { [key: string]: string } = {
    "1": "Much better now",
    "2": "Somewhat better now",
    "3": "About the same",
    "4": "Somewhat worse now",
    "5": "Much worse now"
  };
  
  const categoryColors: { [key: string]: string } = {
    "Much better now": "#2ba88c",
    "Somewhat better now": "#93c4b9",
    "About the same": "#ead97c",
    "Somewhat worse now": "#f0b3ba",
    "Much worse now": "#e25b61"
  };
  
  return (
    <HorizontalBarChart
      questionId="Q5"
      title="How would you compare your current satisfaction with your life to your satisfaction with life during the pandemic?"
      dataField="life_satisfaction_duringcovid"
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      categoryColors={categoryColors}
      valueMap={valueMap}
      alternateFields={[
        'life_satisfaction_during_pandemic',
        'life_satisfaction',
        'life_satisfaction_now_group',
        'q5_response',
        'satisfaction_comparison'
      ]}
      tooltipCountLabel="Responses"
    />
  );
};

export default Q5Visualization;