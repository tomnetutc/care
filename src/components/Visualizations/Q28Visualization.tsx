import React from 'react';
import LikertChart from '../LikertChart/LikertChart';

const questionOrder = [
  'rank_indoor_dine',
  'rank_outdoor_dine',
  'rank_pickup_food',
  'rank_food_delivery',
];

const questionLabels = {
  rank_indoor_dine: 'Dine indoors at a restaurant',
  rank_outdoor_dine: 'Dine outdoors adjacent to a restaurant (e.g., parklet, cafe tables, streateries)',
  rank_pickup_food: 'Pick up food from a restaurant',
  rank_food_delivery: 'Have food delivered from a restaurant',
};

const responseCategories = [
  '1', // Most preferred
  '2',
  '3',
  '4', // Least preferred
];

const categoryColors = [
    '#F4E9AA',  // Lightest Yellow (for 1)
    '#EAD97C',  // Anchor Yellow (for 2)
    '#D1B856',  // Darker Yellow (for 3)
    '#A3923D',  // Darkest Yellow (for 4)
];

const Q28Visualization: React.FC = () => {
  return (
    <LikertChart
      questionId="Q28"
      title="When you choose to eat out, how do you prefer to dine? Please rank the following dining options from 1 to 4, where 1 indicates your most preferred method and 4 is your least preferred. Assign a unique rank to each option."
      questionOrder={questionOrder}
      questionLabels={questionLabels}
      responseCategories={responseCategories}
      categoryColors={categoryColors}
      showSummaryTable={false}
    />
  );
};

export default Q28Visualization; 