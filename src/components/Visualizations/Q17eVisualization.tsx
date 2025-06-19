import React from 'react';
import LikertChart from '../LikertChart/LikertChart';

// Order of questions for power outage activity changes
const questionOrder = [
  "ext_powerout_eating_restaurant",
  "ext_powerout_indoor_restaurant",
  "ext_powerout_food_delivery",
  "ext_powerout_takeout_pickup",
  "ext_powerout_car_travel",
  "ext_powerout_walk_bike_mode",
  "ext_powerout_transit_use",
  "ext_powerout_stay_home",
  "ext_powerout_stay_family_friends",
  "ext_powerout_check_family_friends",
  "ext_powerout_volunteer_community"
];

// Labels for power outage activity change questions
const questionLabels = {
  "ext_powerout_eating_restaurant": "Eating outside at a restaurant",
  "ext_powerout_indoor_restaurant": "Eating indoors at a restaurant",
  "ext_powerout_food_delivery": "Having food delivered from a restaurant",
  "ext_powerout_takeout_pickup": "Picking up takeout from a restaurant",
  "ext_powerout_car_travel": "Using a car for traveling",
  "ext_powerout_walk_bike_mode": "Walking or cycling for transportation",
  "ext_powerout_transit_use": "Taking public transit",
  "ext_powerout_stay_home": "Staying at home",
  "ext_powerout_stay_family_friends": "Staying with friends and family",
  "ext_powerout_check_family_friends": "Checking in on friends and family",
  "ext_powerout_volunteer_community": "Volunteering to help my community"
};

// Response categories and their colors
const responseCategories = [
  "Less",
  "More",
  "About the same",
  "I don't usually do this activity"
];

const categoryColors = [
  "#e25b61", // Red for less
  "#2ba88c", // Green for more
  "#ead97c", // Yellow for about the same
  "#a0a0a0"  // Gray for "I don't usually do this activity"
];

const Q17eVisualization: React.FC = () => {
  return (
    <LikertChart
      questionId="Q17e"
      title="The next time there is a neighborhood-wide power outage, how would your level or frequency of participation in the following activities change when compared to your normal routine? Please select the most appropriate response for each activity."
      questionOrder={questionOrder}
      questionLabels={questionLabels}
      responseCategories={responseCategories}
      categoryColors={categoryColors}
      showSummaryTable={false}
    />
  );
};

export default Q17eVisualization;