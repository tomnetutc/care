
import React from 'react';
import LikertChart from '../LikertChart/LikertChart';

// Order of questions for lifestyle preferences
const questionOrder = [
  "att_travel_satisfaction",
  "att_weather_concern",
  "att_weather_influence",
  "att_shop_instore",
  "att_mixed_use_neighborhood",
  "att_tech_ability",
  "att_environment_friendly",
  "att_transit_proximity",
  "att_tech_learning_frustration",
  "att_spacious_home",
  "att_physical_activity",
  "att_group_energy",
  "att_social_drain",
  "att_public_social"
];

// Labels for attitude questions
const questionLabels = {
  att_travel_satisfaction: "My daily travel routine is generally satisfactory",
  att_weather_concern: "I worry about bad weather on my travel route",
  att_weather_influence: "Weather forecasts significantly influence my plans for outdoor activities",
  att_shop_instore: "I prefer to shop in a store rather than online",
  att_mixed_use_neighborhood: "I like the idea of having stores, restaurants, and offices mixed among the homes in my area",
  att_tech_ability: "I am confident in my ability to use modern technologies",
  att_environment_friendly: "I am committed to an environmentally-friendly lifestyle",
  att_transit_proximity: "I prefer to live close to transit, even if it means I'll have a smaller home and live in a more densely populated area",
  att_tech_learning_frustration: "Learning how to use new technologies is often frustrating for me",
  att_spacious_home: "I prefer to live in a spacious home, even if it is farther from public transportation or many places I go",
  att_physical_activity: "I try to incorporate physical activity into my daily routine whenever possible",
  att_group_energy: "I feel energized when I am part of a large group",
  att_social_drain: "I often feel drained after spending a few hours around people",
  att_public_social: "I enjoy the chance to meet people unexpectedly, interact with strangers, or make new acquaintances when I go out"
};

// Response categories and their colors
const responseCategories = [
  "Strongly disagree", 
  "Somewhat disagree", 
  "Neutral",
  "Somewhat agree", 
  "Strongly agree"
];

const categoryColors = [
  "#e25b61", // Strong red for strongly disagree
  "#f0b3ba", // Light red for somewhat disagree
  "#ead97c", // Yellow for neutral
  "#93c4b9", // Light green for somewhat agree
  "#2ba88c"  // Strong green for strongly agree
];

const Q1Visualization: React.FC = () => {
  return (
    <LikertChart
      questionId="Q1"
      title="First, we want to learn about your lifestyle preferences. Please rate your agreement with the following statements."
      questionOrder={questionOrder}
      questionLabels={questionLabels}
      responseCategories={responseCategories}
      categoryColors={categoryColors}
      showSummaryTable={true}
    />
  );
};

export default Q1Visualization;