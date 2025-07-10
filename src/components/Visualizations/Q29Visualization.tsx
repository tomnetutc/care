import React from 'react';
import LikertChart from '../LikertChart/LikertChart';

// Order of questions for dining changes during COVID-19
const questionOrder = [
  "covid_freq_indoor_dine",
  "covid_freq_outdoor_dine", 
  "covid_freq_pickup",
  "covid_freq_delivery",
  "covid_freq_cook",
  "covid_freq_take_food_out"
];

// Labels for dining change questions
const questionLabels = {
  covid_freq_indoor_dine: "Dining indoors at restaurants",
  covid_freq_outdoor_dine: "Dining outdoors at restaurants",
  covid_freq_pickup: "Ordering takeout for pickup",
  covid_freq_delivery: "Using delivery services",
  covid_freq_cook: "Cooking at home",
  covid_freq_take_food_out: "Taking food from home to eat elsewhere (e.g., a park)"
};

// Response categories for COVID-19 dining changes
const responseCategories = [
  "Decreased",
  "Stayed the same", 
  "Increased",
  "Not applicable"
];

// Color scheme for dining changes (red for decreased, yellow for same, green for increased, gray for N/A)
const categoryColors = [
  "#e25b61", // Red for decreased
  "#ead97c", // Yellow for stayed the same
  "#2ba88c", // Green for increased
  "#cccccc"  // Gray for not applicable
];

const Q29Visualization: React.FC = () => {
  return (
    <LikertChart
      questionId="Q29"
      title="During the initial months of the COVID-19 pandemic (i.e., March to July 2020), how did your dining patterns change? For each of the following activities, indicate whether your frequency increased, stayed the same, or decreased. If you did not do a certain activity either before or during this period, select not applicable."
      questionOrder={questionOrder}
      questionLabels={questionLabels}
      responseCategories={responseCategories}
      categoryColors={categoryColors}
      showSummaryTable={false}
    />
  );
};

export default Q29Visualization; 