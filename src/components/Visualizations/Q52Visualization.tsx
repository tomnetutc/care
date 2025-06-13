import React from 'react';
import WordCloudChart from '../WordCloudChart/WordCloudChart';

const Q52Visualization: React.FC = () => {
  return (
    <WordCloudChart
      title={<strong>How can the community be better prepared for disruptions or extreme events?</strong>}
      dataField="comments"
      useBigrams={true}
      maxWords={50}
      colors={['#2ba88c', '#507dbc', '#e25b61', '#93c4b9', '#ead97c']}
      height={400}
      stopWords={[
        'the', 'and', 'for', 'you', 'with', 'would', 'not', 'but', 'are', 'this', 
        'have', 'that', 'more', 'they', 'there', 'been', 'has', 'was', 'will'
      ]}
    />
  );
};

export default Q52Visualization;