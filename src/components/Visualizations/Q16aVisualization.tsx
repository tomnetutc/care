import React from 'react';
import WordCloudChart from '../WordCloudChart/WordCloudChart';

const Q16aVisualization: React.FC = () => {
  return (
    <WordCloudChart
      title={<strong>Is there anything else you would do to cope with extreme heat?</strong>}
      dataField="ext_heat_cope_comments"
      useBigrams={true}
      maxWords={50}
      colors={['#2ba88c', '#507dbc', '#e25b61', '#93c4b9', '#ead97c']}
      height={400}
      stopWords={['the', 'and', 'for', 'you', 'with', 'would', 'not', 'but', 'are', 'this', 'have']}
    />
  );
};

export default Q16aVisualization;