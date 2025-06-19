import React from 'react';
import LikertChart from '../LikertChart/LikertChart';

// Order of questions for activity changes during heat events
const questionOrder = [
  "ext_heat_indoor_restaurant",
  "ext_heat_takeout_pickup",
  "ext_heat_food_delivery",
  "ext_heat_public_indoors",
  "ext_heat_wfh",
  "ext_heat_commute",
  "ext_heat_car_travel",
  "ext_heat_public_transit",
  "ext_heat_stay_home",
  "ext_heat_stay_family_friends",
  "ext_heat_check_family_friends",
  "ext_heat_volunteer_community"
];

// Labels for activity changes during heat
const questionLabels = {
  ext_heat_indoor_restaurant: "Eating indoors at a restaurant",
  ext_heat_takeout_pickup: "Picking up takeout from a restaurant",
  ext_heat_food_delivery: "Having food delivered from a restaurant",
  ext_heat_public_indoors: "Hanging out indoors in a public space (e.g., coffee shop, mall)",
  ext_heat_wfh: "Working from home",
  ext_heat_commute: "Working from the office",
  ext_heat_car_travel: "Using a car for traveling",
  ext_heat_public_transit: "Taking public transit",
  ext_heat_stay_home: "Staying at home",
  ext_heat_stay_family_friends: "Staying with friends and family",
  ext_heat_check_family_friends: "Checking in on friends and family",
  ext_heat_volunteer_community: "Volunteering to help my community"
};

// Response categories and their colors for activity change
const responseCategories = [
  "Much less", 
  "Somewhat less", 
  "About the same",
  "Somewhat more", 
  "Much more"
];

const categoryColors = [
  "#e25b61", // Red for much less
  "#f0b3ba", // Light red for somewhat less
  "#ead97c", // Yellow for about the same
  "#93c4b9", // Light green for somewhat more
  "#2ba88c"  // Strong green for much more
];

const Q17aVisualization: React.FC = () => {
  return (
    <LikertChart
      questionId="Q17a"
      title="The next time there is an extreme heat event, how would your level or frequency of participation in the following activities change when compared to your normal routine? Please select the most appropriate response for each activity."
      questionOrder={questionOrder}
      questionLabels={questionLabels}
      responseCategories={responseCategories}
      categoryColors={categoryColors}
      showSummaryTable={false}
    />
  );
};

export default Q17aVisualization;