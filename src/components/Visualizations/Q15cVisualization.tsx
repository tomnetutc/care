import React from 'react';
import LikertChart from '../LikertChart/LikertChart';

// Order of questions for flooding actions
const questionOrder = [
  "ext_flooding_lkly_normal_business",
  "ext_flooding_lkly_stay_home",
  "ext_flooding_lkly_seek_shelter",
  "ext_flooding_lkly_social_connection",
  "ext_flooding_lkly_leave_town",
  "ext_flooding_lkly_supplies",
  "ext_flooding_lkly_follow_officials",
  "ext_flooding_lkly_comm_supports"
];

// Labels for flooding action questions
const questionLabels = {
  "ext_flooding_lkly_normal_business": "Go about business as usual",
  "ext_flooding_lkly_stay_home": "Try to stay home as much as possible",
  "ext_flooding_lkly_seek_shelter": "Seek shelter provided by the city or government",
  "ext_flooding_lkly_social_connection": "Go to a friend or family's house nearby for support or safety",
  "ext_flooding_lkly_leave_town": "Leave town to avoid the worst impacts of the disruption",
  "ext_flooding_lkly_supplies": "Stock up on essential supplies and prepare an emergency kit",
  "ext_flooding_lkly_follow_officials": "Follow official guidance and updates closely for safety instructions",
  "ext_flooding_lkly_comm_supports": "Engage with community support networks or local response efforts"
};

// Response categories and their colors
const responseCategories = [
  "Very unlikely", 
  "Somewhat unlikely", 
  "Neither likely nor unlikely",
  "Somewhat likely", 
  "Very likely"
];

const categoryColors = [
  "#e25b61", // Strong red for very unlikely
  "#f0b3ba", // Light red for somewhat unlikely
  "#ead97c", // Yellow for neutral
  "#93c4b9", // Light green for somewhat likely
  "#2ba88c"  // Strong green for very likely
];

const Q15cVisualization: React.FC = () => {
  return (
    <LikertChart
      questionId="Q15c"
      title="How likely are you to do each of the following the next time you experience major flooding?"
      questionOrder={questionOrder}
      questionLabels={questionLabels}
      responseCategories={responseCategories}
      categoryColors={categoryColors}
      showSummaryTable={true}
    />
  );
};

export default Q15cVisualization;