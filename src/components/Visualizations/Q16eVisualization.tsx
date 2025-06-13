import React from 'react';
import WordCloudChart from '../WordCloudChart/WordCloudChart';

const Q16eVisualization: React.FC = () => {
  return (
    <WordCloudChart
      title={<strong>Is there anything else you would do to cope with a neighborhood-wide power outage?</strong>}
      dataField="ext_powerout_cope_comments"
      useBigrams={true}
      maxWords={50}
      colors={['#2ba88c', '#507dbc', '#e25b61', '#93c4b9', '#ead97c']}
      height={400}
      stopWords={[
        'the', 'and', 'for', 'you', 'with', 'would', 'not', 'but', 'are', 'this', 
        'have', 'that', 'more', 'they', 'there', 'been', 'has', 'was', 'will', 'its',
        'power', 'outage', 'electricity', 'electrical', 'out'
      ]}
    />
  );
};

export default Q16eVisualization;