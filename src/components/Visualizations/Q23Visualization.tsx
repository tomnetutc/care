import React from 'react';
import LikertChart from '../LikertChart/LikertChart';

// Order of questions for delivery frequency
const questionOrder = [
  'online_shopping_freq',
  'meal_prep_freq',
  'groc_deliver_freq',
  'service_deliver_freq',
];

// Labels for each delivery type
const questionLabels = {
  online_shopping_freq: 'Items purchased online',
  meal_prep_freq: 'Prepared meals',
  groc_deliver_freq: 'Groceries',
  service_deliver_freq: 'Services (repairs, maintenance, home healthcare, etc.)',
};

// Response categories and their colors (Q10 style, extended for 6 bins)
const responseCategories = [
  '0',
  '1',
  '2–3',
  '4–6',
  '7–10',
  '>10',
];

const categoryColors = [
  '#b6bebc',  // Light Gray (for 0)
  '#F4E9AA',  // Lightest Yellow (for 1)
  '#EAD97C',  // Anchor Yellow (for 2–3)
  '#D1B856',  // Darker Yellow (for 4–6)
  '#A3923D',  // Darkest Yellow (for 7–10)
  '#7A6A2F',  // Even darker brownish yellow for >10 (logical extension)
];

const Q23Visualization: React.FC = () => {
  return (
    <LikertChart
      questionId="Q23"
      title="In the past 30 days, about how many times did you have each of the following delivered to your home?"
      questionOrder={questionOrder}
      questionLabels={questionLabels}
      responseCategories={responseCategories}
      categoryColors={categoryColors}
      showSummaryTable={false}
    />
  );
};

export default Q23Visualization; 