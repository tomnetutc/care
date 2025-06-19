import React from 'react';
import LikertChart from '../LikertChart/LikertChart';

// Order of questions for cold event activity changes
const questionOrder = [
  "ext_cold_indoor_restaurant",
  "ext_cold_takeout_pickup",
  "ext_cold_food_delivery",
  "ext_cold_public_indoors",
  "ext_cold_wfh",
  "ext_cold_commute",
  "ext_cold_car_travel",
  "ext_cold_transit_use",
  "ext_cold_stay_home",
  "ext_cold_stay_family_friends",
  "ext_cold_check_family_friends",
  "ext_cold_volunteer_community"
];

// Labels for cold event activity questions
const questionLabels = {
  "ext_cold_indoor_restaurant": "Eating indoors at a restaurant",
  "ext_cold_takeout_pickup": "Picking up takeout from a restaurant",
  "ext_cold_food_delivery": "Having food delivered from a restaurant",
  "ext_cold_public_indoors": "Hanging out indoors in a public space (e.g., coffee shop, mall)",
  "ext_cold_wfh": "Working from home",
  "ext_cold_commute": "Working from the office",
  "ext_cold_car_travel": "Using a car for traveling",
  "ext_cold_transit_use": "Taking public transit",
  "ext_cold_stay_home": "Staying at home",
  "ext_cold_stay_family_friends": "Staying with friends and family",
  "ext_cold_check_family_friends": "Checking in on friends and family",
  "ext_cold_volunteer_community": "Volunteering to help my community"
};

// Response categories and their colors - correcting order to match data values
const responseCategories = [
  "Less",
  "More",
  "About the same",
  "I don't usually do this activity"
];

const categoryColors = [
  "#e25b61", // Red for "Less"
  "#2ba88c", // Green for "More"
  "#ead97c", // Yellow for "About the same"
  "#C4C4C4"  // Gray for "I don't usually do this activity"
];

const Q17bVisualization: React.FC = () => {
  return (
    <LikertChart
      questionId="Q17b"
      title="The next time there is an extreme cold event, how would your level or frequency of participation in the following activities change when compared to your normal routine?"
      questionOrder={questionOrder}
      questionLabels={questionLabels}
      responseCategories={responseCategories}
      categoryColors={categoryColors}
      showSummaryTable={false}
    />
  );
};

export default Q17bVisualization;