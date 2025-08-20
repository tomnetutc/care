import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const categoryOrder = [
  'Increased concerns over health and safety',        // 36.7% - highest
  'Acquired a personal vehicle',                      // 25.5%
  'Lifestyle or personal preference changes',         // 25.0%
  'Changed job or work location',                     // 20.8%
  'Changes in my financial situation',                // 19.2%
  'Decrease in transit frequency or reliability',     // 16.2%
  'Shifted to work from home',                        // 15.2%
  'Moved to a new home that is less transit accessible', // 14.9%
  'Increase in the cost of public transit',           // 11.5%
  'Other',                                            // 0.0% - lowest
];

const categoryLabels: Record<string, string> = {
  'Decrease in transit frequency or reliability': 'Decrease in transit frequency or reliability',
  'Increased concerns over health and safety': 'Increased concerns over health and safety',
  'Changed job or work location': 'Changed job or work location',
  'Shifted to work from home': 'Shifted to work from home',
  'Moved to a new home that is less transit accessible': 'Moved to a new home that is less transit accessible',
  'Increase in the cost of public transit': 'Increase in the cost of public transit',
  'Changes in my financial situation': 'Changes in my financial situation',
  'Acquired a personal vehicle': 'Acquired a personal vehicle',
  'Lifestyle or personal preference changes': 'Lifestyle or personal preference changes',
  'Other': 'Other',
};

const multiSelectFields: Record<string, string> = {
  pctr_less_reliable: 'Decrease in transit frequency or reliability',
  pctr_health_concerns: 'Increased concerns over health and safety',
  pctr_changed_job: 'Changed job or work location',
  pctr_wfh: 'Shifted to work from home',
  pctr_moved: 'Moved to a new home that is less transit accessible',
  pctr_transit_cost: 'Increase in the cost of public transit',
  pctr_financial_change: 'Changes in my financial situation',
  pctr_acquire_vehicle: 'Acquired a personal vehicle',
  pctr_lifestyle_change: 'Lifestyle or personal preference changes',
  post_covid_transit_reduce_other: 'Other',
};

const Q36aVisualization: React.FC = () => {
  return (
    <HorizontalBarChart
      questionId="36a"
      title="You indicated that you use public transit now less than you did before the COVID-19 pandemic. What are the reasons for this change? Please select the top three reasons."
      dataField="pctr_less_reliable" // Not used for multiSelectFields, but required by prop
      categoryOrder={categoryOrder}
      categoryLabels={categoryLabels}
      multiSelectFields={multiSelectFields}
      percentageDenominator="uniqueRespondents"
      
    />
  );
};

export default Q36aVisualization; 