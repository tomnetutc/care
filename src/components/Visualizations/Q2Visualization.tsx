import React from 'react';
import LikertChart from '../LikertChart/LikertChart';

// Order of questions for community awareness
const questionOrder = [
  "att_nearby_support",
  "att_community_support",
  "att_community_participation",
  "att_communication_channels",
  "att_safety_knowledge",
  "att_adaptability",
  "att_authority_confidence",
  "att_guideline_compliance",
  "att_personal_resilience",
  "att_financial_resilience"
];

// Labels for community awareness questions
const questionLabels = {
  att_nearby_support: "I have family or friends nearby that I can turn to when I need immediate help",
  att_community_support: "I believe my community would come together to support each other during an extreme event",
  att_community_participation: "I regularly participate in community activities, which strengthens my sense of belonging and support",
  att_communication_channels: "My community has effective communication channels to distribute information during an extreme event",
  att_safety_knowledge: "I am knowledgeable about the steps I need to take for my safety during extreme events",
  att_adaptability: "I can adapt quickly to changes in my environment, even in stressful situations",
  att_authority_confidence: "I am confident in the effectiveness of local authorities and their ability to respond to a crisis situation",
  att_guideline_compliance: "I closely follow guidelines and instructions provided by authorities during times of crisis",
  att_personal_resilience: "I feel that I can personally bounce back quickly from challenging situations",
  att_financial_resilience: "I have enough savings to support myself through unexpected financial disruptions"
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

const Q2Visualization: React.FC = () => {
  return (
    <LikertChart
      questionId="Q2"
      title="Now, we want to learn about the resources available in your community, along with your awareness and ability to adapt during times of crisis, such as extreme weather events, pandemics, earthquakes, and more."
      questionOrder={questionOrder}
      questionLabels={questionLabels}
      responseCategories={responseCategories}
      categoryColors={categoryColors}
      showSummaryTable={true}
    />
  );
};

export default Q2Visualization;