import React from 'react';
import LikertChart from '../LikertChart/LikertChart';

// Order of questions for extreme events experience
const questionOrder = [
  "exp_ext_heat",
  "exp_ext_cold",
  "exp_maj_flooding",
  "exp_maj_earthquake",
  "exp_hurr_tor",
  "exp_wildfire",
  "exp_power_outage",
  "exp_pandemic"
];

// Labels for extreme events experience questions
const questionLabels = {
  "exp_ext_heat": "Extreme heat (significantly above normal temperatures for your area)",
  "exp_ext_cold": "Extreme cold (significantly below normal temperatures for your area)",
  "exp_maj_flooding": "Major flooding",
  "exp_maj_earthquake": "Major earthquake (magnitude 6.0 or greater)",
  "exp_hurr_tor": "Hurricane/tornado",
  "exp_wildfire": "Wildfire",
  "exp_power_outage": "Neighborhood-wide power outage (not related to unpaid bills)",
  "exp_pandemic": "Pandemic or epidemic (significantly affecting your community)"
};

// Response categories and their colors
const responseCategories = [
  "Never",
  "More than 3 years ago",
  "1-3 years ago",
  "1-12 months ago",
  "Within the last month"
];

const categoryColors = [
  "#E2E2DC",  // Light Gray
  "#F4E9AA",  // Lightest Yellow
  "#EAD97C",  // Anchor Yellow
  "#D1B856",  // Darker Yellow
  "#A3923D"   // Darkest Yellow
];

const Q10Visualization: React.FC = () => {
  return (
    <LikertChart
      questionId="Q10"
      title="When was the last time you personally experienced each
        of the following extreme events or disruptions? Please consider only
        disruptions in which the event itself or its impact lasted for more than 24
        hours." 
      questionOrder={questionOrder}
      questionLabels={questionLabels}
      responseCategories={responseCategories}
      categoryColors={categoryColors}
      showSummaryTable={true}
    />
  );
};

export default Q10Visualization;