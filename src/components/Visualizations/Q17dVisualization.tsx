import React from 'react';
import LikertChart from '../LikertChart/LikertChart';

// Order of questions for earthquake activity changes
const questionOrder = [
  "ext_earthquake_wfh",
  "ext_earthquake_car_travel",
  "ext_earthquake_walk_bike_mode",
  "ext_earthquake_transit_use",
  "ext_earthquake_stay_home",
  "ext_earthquake_stay_family_friends",
  "ext_earthquake_check_family_friends",
  "ext_earthquake_volunteer_community"
];

// Labels for earthquake activity change questions
const questionLabels = {
  ext_earthquake_wfh: "Working from home",
  ext_earthquake_car_travel: "Using a car for traveling",
  ext_earthquake_walk_bike_mode: "Walking or cycling for transportation",
  ext_earthquake_transit_use: "Taking public transit",
  ext_earthquake_stay_home: "Staying at home",
  ext_earthquake_stay_family_friends: "Staying with friends and family",
  ext_earthquake_check_family_friends: "Checking in on friends and family",
  ext_earthquake_volunteer_community: "Volunteering to help my community"
};

// Response categories for activity change
const responseCategories = [
  "Less",
  "More",
  "About the same",
  "I don't usually do this activity"
];

// Color gradient from red (less) to green (more)
const categoryColors = [
  "#e25b61", // Red for less
  "#2ba88c", // Green for more
  "#ead97c", // Yellow for about the same
  "#a0a0a0"  // Gray for "I don't usually do this activity"
];

const Q17dVisualization: React.FC = () => {
  return (
    <LikertChart
      questionId="Q17d"
      title="The next time there is a major earthquake, how would your level or frequency of participation in the following activities change when compared to your normal routine? Please select the most appropriate response for each activity."
      questionOrder={questionOrder}
      questionLabels={questionLabels}
      responseCategories={responseCategories}
      categoryColors={categoryColors}
      showSummaryTable={false}
    />
  );
};

export default Q17dVisualization;