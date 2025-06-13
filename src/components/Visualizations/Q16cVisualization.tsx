import React from 'react';
import WordCloudChart from '../WordCloudChart/WordCloudChart';

const Q16cVisualization: React.FC = () => {
  return (
    <WordCloudChart
      title={<strong>Is there anything else you would do to cope with major flooding?</strong>}
      dataField="ext_flooding_cope_comments"
      useBigrams={true}
      maxWords={50}
      colors={['#2ba88c', '#507dbc', '#e25b61', '#93c4b9', '#ead97c']}
      height={400}
      stopWords={[
        'the', 'and', 'for', 'you', 'with', 'would', 'not', 'but', 'are', 'this', 
        'have', 'that', 'more', 'they', 'there', 'been', 'has', 'was', 'will', 'its',
        'flood', 'flooding'
      ]}
    />
  );
};

export default Q16cVisualization;