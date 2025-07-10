import React from 'react';
import LikertChart from '../LikertChart/LikertChart';

// Order of questions for factors influencing out-of-home activity
const questionOrder = [
  'imp_travel_dist',
  'imp_location',
  'imp_dist_from_community',
  'imp_cost',
  'imp_activity_type',
  'imp_park_avail',
  'imp_public_transit_access',
  'imp_location_safety',
  'imp_family_friends_join',
  'imp_weather',
  'imp_disability_access',
];

// Labels for each factor
const questionLabels = {
  imp_travel_dist: 'The distance I need to travel',
  imp_location: 'Whether it is in a convenient location',
  imp_dist_from_community: 'The significance of the location in my community (e.g., a popular "community hangout")',
  imp_cost: 'The cost of participating in the activity',
  imp_activity_type: 'The type of activity (e.g., outdoor, cultural, leisure)',
  imp_park_avail: 'Availability of parking',
  imp_public_transit_access: 'Ease of access via public transportation',
  imp_location_safety: 'Safety and security of the location',
  imp_family_friends_join: 'Whether friends or family will be joining',
  imp_weather: 'Weather conditions at the time of the activity',
  imp_disability_access: 'Accessibility for people with disabilities',
};

// Response categories and their colors
const responseCategories = [
  'Not at all important',
  'Slightly important',
  'Moderately important',
  'Very important',
  'Extremely important',
];

const categoryColors = [
  '#e25b61', // Not at all important - red
  '#f0b3ba', // Slightly important - light red
  '#ead97c', // Moderately important - yellow
  '#93c4b9', // Very important - light green
  '#2ba88c', // Extremely important - strong green
];

const Q25Visualization: React.FC = () => {
  return (
    <LikertChart
      questionId="Q25"
      title="When deciding to participate in an activity outside your home, how important are the following factors? Please select the most appropriate response."
      questionOrder={questionOrder}
      questionLabels={questionLabels}
      responseCategories={responseCategories}
      categoryColors={categoryColors}
      showSummaryTable={false}
    />
  );
};

export default Q25Visualization; 