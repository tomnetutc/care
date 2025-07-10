import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const categoryOrder = [
  'Improvement in frequency or reliability',
  'Decreased concerns over health and safety',
  'Started working in a new job that requires travel to the office',
  'Change in my work location',
  'New return to office policy',
  'Moved to a new home that is more accessible',
  'Decrease in the cost of using public transit',
  'Changes in my financial situation',
  'Got rid of personal vehicle',
  'Lifestyle or personal preference changes',
  'Other',
];

const categoryLabels: Record<string, string> = {
  'Improvement in frequency or reliability': 'Improvement in frequency or reliability',
  'Decreased concerns over health and safety': 'Decreased concerns over health and safety',
  'Started working in a new job that requires travel to the office': 'Started working in a new job that requires travel to the office',
  'Change in my work location': 'Change in my work location',
  'New return to office policy': 'New return to office policy',
  'Moved to a new home that is more accessible': 'Moved to a new home that is more accessible',
  'Decrease in the cost of using public transit': 'Decrease in the cost of using public transit',
  'Changes in my financial situation': 'Changes in my financial situation',
  'Got rid of personal vehicle': 'Got rid of personal vehicle',
  'Lifestyle or personal preference changes': 'Lifestyle or personal preference changes',
  'Other': 'Other',
};

const multiSelectFields: Record<string, string> = {
  pcti_improve_reliabiity: 'Improvement in frequency or reliability',
  pcti_decreased_healthy_concerns: 'Decreased concerns over health and safety',
  pcti_new_job: 'Started working in a new job that requires travel to the office',
  pcti_change_work_location: 'Change in my work location',
  pcti_return_office: 'New return to office policy',
  pcti_moved: 'Moved to a new home that is more accessible',
  pcti_transit_less_cost: 'Decrease in the cost of using public transit',
  pcti_financial_changes: 'Changes in my financial situation',
  pcti_no_personal_vehicle: 'Got rid of personal vehicle',
  pcti_lifestyle_changes: 'Lifestyle or personal preference changes',
  post_covid_transit_increase_other: 'Other',
};

const Q36bVisualization: React.FC = () => {
  return (
    <HorizontalBarChart
      questionId="36b"
      title="You indicated that you use public transit more than you did before the COVID-19 pandemic. What are the reasons for this change? Please select all that apply."
      dataField="pcti_improve_reliability" // Not used for multiSelectFields, but required by prop
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      multiSelectFields={multiSelectFields}
      percentageDenominator="uniqueRespondents"
      labelWidth={300}
    />
  );
};

export default Q36bVisualization; 