import React from 'react';
import HorizontalBarChart from '../HorizontalBarChart/HorizontalBarChart';

const categoryOrder = [
  'tm_out_of_house',
  'tm_fresh_air',
  'tm_socialize',
  'tm_social_visibility',
  'tm_sense_of_belonging',
  'tm_meet_friends_family',
  'tm_activities_enjoy',
  'travel_motivation_other'
];

const categoryLabels: { [key: string]: string } = {
  'tm_out_of_house': 'To change my environment/get out of the house',
  'tm_fresh_air': 'For outdoor activities/fresh air',
  'tm_socialize': 'To socialize and see other people',
  'tm_social_visibility': 'To be seen by others/enjoy social visibility',
  'tm_sense_of_belonging': 'To feel a sense of community belonging',
  'tm_meet_friends_family': 'To meet up with friends and family',
  'tm_activities_enjoy': 'To do activities that I enjoy (e.g., watch a movie, exercise, eat out, etc.)',
  'travel_motivation_other': 'Other',
};

const categoryColors: { [key: string]: string } = {
  'tm_out_of_house': '#e25b61',
  'tm_fresh_air': '#f0b3ba',
  'tm_socialize': '#ead97c',
  'tm_social_visibility': '#93c4b9',
  'tm_sense_of_belonging': '#2ba88c',
  'tm_meet_friends_family': '#507dbc',
  'tm_activities_enjoy': '#b6bebc',
  'travel_motivation_other': '#a3923d',
};

// Custom processor for Q26
const processQ26Data = (filteredData: any[]) => {
  const total = filteredData.length;
  return categoryOrder.map((field) => {
    let count = 0;
    if (field === 'travel_motivation_other') {
      count = filteredData.filter(row => row[field] && String(row[field]).trim() !== '').length;
    } else {
      count = filteredData.filter(row => row[field] === '1' || row[field] === 1).length;
    }
    return {
      category: field,
      label: categoryLabels[field],
      count,
      percentage: total > 0 ? (count / total) * 100 : 0
    };
  });
};

const Q26Visualization: React.FC = () => (
  <HorizontalBarChart
    questionId="Q26"
    title="Apart from the reasons that generally require you to leave your home, such as to go to work, shop for necessities, do errands, keep appointments, or take children to school or other activities, what are the top three motivations for you to leave your home on a typical day? Please select up to three reasons."
    dataField="tm_out_of_house" // dummy, not used by processor
    categoryOrder={categoryOrder}
    categoryLabels={categoryLabels}
    categoryColors={categoryColors}
    labelWidth={300}
    dataProcessor={processQ26Data}
    tooltipCountLabel="Responses"
  />
);

export default Q26Visualization; 