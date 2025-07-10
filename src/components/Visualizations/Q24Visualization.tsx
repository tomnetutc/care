import React from 'react';
import LikertChart from '../LikertChart/LikertChart';

// Order of questions for activity frequency
const questionOrder = [
  'eng_walking',
  'eng_running',
  'eng_biking',
  'eng_public_parks',
  'eng_visit_playground',
  'eng_farmers_market',
  'eng_outdoor_event',
  'eng_civic_activity',
  'eng_people_watching',
];

// Labels for each activity
const questionLabels = {
  eng_walking: 'Walking for at least 15 minutes (including pet-walking)',
  eng_running: 'Running/jogging',
  eng_biking: 'Biking',
  eng_public_parks: 'Going to public parks',
  eng_visit_playground: 'Visiting a playground',
  eng_farmers_market: 'Going to a farmers market',
  eng_outdoor_event: 'Attending an outdoor event (e.g., food festival or parade)',
  eng_civic_activity: 'Civic activity (e.g., a public meeting or volunteering)',
  eng_people_watching: 'People-watching',
};

// Response categories and their colors
const responseCategories = [
  'Never',
  'Less than once a month',
  'A few times a month',
  'A few times a week',
  'Everyday',
  'I prefer not to say',
];

const categoryColors = [
  '#e25b61', // Never - red
  '#f0b3ba', // Less than once a month - light red
  '#ead97c', // A few times a month - yellow
  '#93c4b9', // A few times a week - light green
  '#2ba88c', // Everyday - strong green
  '#b6bebc', // I prefer not to say - gray
];

const Q24Visualization: React.FC = () => {
  return (
    <LikertChart
      questionId="Q24"
      title="Please indicate how often you engage in the following activities. Select the most accurate option for each activity."
      questionOrder={questionOrder}
      questionLabels={questionLabels}
      responseCategories={responseCategories}
      categoryColors={categoryColors}
      showSummaryTable={false}
    />
  );
};

export default Q24Visualization; 