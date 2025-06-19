import React from 'react';
import LikertChart from '../LikertChart/LikertChart';

// Order of questions for activity changes during flooding events
const questionOrder = [
  "ext_flooding_wfh",
  "ext_flooding_car_travel",
  "ext_flooding_walk_bike_mode",
  "ext_flooding_transit_use",
  "ext_flooding_stay_home",
  "ext_flooding_stay_family_friends",
  "ext_flooding_check_family_friends",
  "ext_flooding_volunteer_community"
];

// Labels for activity changes during flooding
const questionLabels = {
  ext_flooding_wfh: "Working from home",
  ext_flooding_car_travel: "Using a car for traveling",
  ext_flooding_walk_bike_mode: "Walking or cycling for transportation",
  ext_flooding_transit_use: "Taking public transit",
  ext_flooding_stay_home: "Staying at home",
  ext_flooding_stay_family_friends: "Staying with friends and family",
  ext_flooding_check_family_friends: "Checking in on friends and family",
  ext_flooding_volunteer_community: "Volunteering to help my community"
};

// Updated response categories according to provided information
const responseCategories = [
  "Less",
  "More",
  "About the same",
  "I don't usually do this activity"
];

// Updated color scheme for 4 categories
const categoryColors = [
  "#e25b61", // Red for less
  "#2ba88c", // Green for more
  "#ead97c", // Yellow for about the same
  "#a0a0a0"  // Gray for "I don't usually do this activity"
];

const Q17cVisualization: React.FC = () => {
  return (
    <LikertChart
      questionId="Q17c"
      title="The next time there is a major flooding event, how would your level or frequency of participation in the following activities change when compared to your normal routine? Please select the most appropriate response for each activity."
      questionOrder={questionOrder}
      questionLabels={questionLabels}
      responseCategories={responseCategories}
      categoryColors={categoryColors}
      showSummaryTable={false}
    />
  );
};

export default Q17cVisualization;