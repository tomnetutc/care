import React from 'react';
import LikertChart from '../LikertChart/LikertChart';

// Order of questions for restaurant adaptations during COVID-19
const questionOrder = [
  "covid_rest_buss_hours",
  "covid_rest_buss_out",
  "covid_rest_menu_reduc",
  "covid_rest_deliver_offer",
  "covid_rest_outdoor_offer"
];

// Labels for restaurant adaptation questions
const questionLabels = {
  covid_rest_buss_hours: "Reduced business hours",
  covid_rest_buss_out: "Went out of business",
  covid_rest_menu_reduc: "Reduced menu offerings",
  covid_rest_deliver_offer: "Offered takeout or delivery only (with no dine-in option)",
  covid_rest_outdoor_offer: "Offered outdoor dining only (with or without takeout/delivery)"
};

// Response categories for restaurant adaptations
const responseCategories = [
  "None or very few restaurants",
  "Some restaurants",
  "A lot of restaurants",
  "Not sure/I don't know"
];

// Color scheme for restaurant adaptations (light to dark progression)
const categoryColors = [
    '#F4E9AA',  // Some restaurants
    '#EAD97C',  // A lot of restaurants
    '#D1B856',  // Not sure/I don't know
    '#b6bebc',  // None or very few restaurants
];

const Q30Visualization: React.FC = () => {
  return (
    <LikertChart
      questionId="Q30"
      title="Thinking about the restaurants you visited before the COVID-19 pandemic, how did they adapt during the initial months of the pandemic (i.e., March to July 2020)? Please answer to the best of your knowledge."
      questionOrder={questionOrder}
      questionLabels={questionLabels}
      responseCategories={responseCategories}
      categoryColors={categoryColors}
      showSummaryTable={false}
    />
  );
};

export default Q30Visualization; 