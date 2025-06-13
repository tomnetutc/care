import React from 'react';
import LikertChart from '../LikertChart/LikertChart';

// Order of questions for earthquake actions
const questionOrder = [
  "ext_earthquake_lkly_normal_business",
  "ext_earthquake_lkly_stay_home",
  "ext_earthquake_lkly_seek_shelter",
  "ext_earthquake_lkly_social_connection",
  "ext_earthquake_lkly_leave_town",
  "ext_earthquake_lkly_supplies",
  "ext_earthquake_lkly_follow_officials",
  "ext_earthquake_lkly_comm_supports"
];

// Labels for earthquake action questions
const questionLabels = {
  ext_earthquake_lkly_normal_business: "Go about business as usual",
  ext_earthquake_lkly_stay_home: "Try to stay home as much as possible",
  ext_earthquake_lkly_seek_shelter: "Seek shelter provided by the city or government",
  ext_earthquake_lkly_social_connection: "Go to a friend or family's house nearby for support or safety",
  ext_earthquake_lkly_leave_town: "Leave town to avoid the worst impacts of the disruption",
  ext_earthquake_lkly_supplies: "Stock up on essential supplies and prepare an emergency kit",
  ext_earthquake_lkly_follow_officials: "Follow official guidance and updates closely for safety instructions",
  ext_earthquake_lkly_comm_supports: "Engage with community support networks or local response efforts"
};

// Response categories and their colors (consistent with other likelihood visualizations)
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

const Q15dVisualization: React.FC = () => {
  return (
    <LikertChart
      questionId="Q15d"
      title="How likely are you to do each of the following the next time you experience a major earthquake?"
      questionOrder={questionOrder}
      questionLabels={questionLabels}
      responseCategories={responseCategories}
      categoryColors={categoryColors}
      showSummaryTable={true}
    />
  );
};

export default Q15dVisualization;